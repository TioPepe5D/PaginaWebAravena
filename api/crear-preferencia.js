const { MercadoPagoConfig, Preference } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");
const { METAS_REGALO, esRegalo } = require("../js/regalos.js");

const SUPA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';

/* Días que se conserva un pedido sin pagar antes de borrarlo. Un pago por
   transferencia o un webhook lento pueden tardar, pero no tanto. */
const DIAS_RETENER_PENDIENTES = 3;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { items: itemsInput, datosEnvio } = req.body || {};

  if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
    return res.status(400).json({ error: "Items inválidos" });
  }

  const supabase = createClient(
    SUPA_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Autenticación opcional (soporta invitados)
  let userId = null;
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (token) {
    try {
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) userId = data.user.id;
    } catch (_) {}
  }

  /* ── Catálogo de referencia para validar precios server-side ──
     La fuente de verdad es js/products.js: es exactamente lo que ve el
     cliente en la tienda. La tabla `catalogo` de Supabase solo se usa
     para sobrescribir filas que tengan un precio válido; hoy quedó con
     todos los precios en 0 y, si se tomara tal cual, MercadoPago
     rechazaría la compra con "unit_price invalid". */
  let porId = new Map();
  try {
    const productosEstaticos = require("../js/products.js");
    porId = new Map(productosEstaticos.map(p => [String(p.id), p]));
  } catch (e) {
    console.error("[crear-preferencia] No se pudo leer products.js:", e.message);
  }

  const ids = itemsInput.map(it => String(it.id));
  const { data: catalogoRows, error: catalogoErr } = await supabase
    .from('catalogo')
    .select('id, nombre, precio, imagen_url, activo')
    .in('id', ids)
    .eq('activo', true);

  if (!catalogoErr && Array.isArray(catalogoRows)) {
    catalogoRows.forEach(row => {
      const precio = Number(row.precio);
      if (!Number.isFinite(precio) || precio <= 0) return;   // fila sin precio útil
      const base = porId.get(String(row.id)) || {};
      porId.set(String(row.id), {
        // Se parte del producto del catálogo para no perder campos que
        // esta tabla no tiene, como la categoría
        ...base,
        id:     row.id,
        nombre: row.nombre || base.nombre || `Producto ${row.id}`,
        precio,
        imagen: row.imagen_url || base.imagen || ""
      });
    });
  }

  // ── Validar precios SERVER-SIDE contra el catálogo real ──
  // Los regalos por monto no están en el catálogo: se ignoran aquí y el
  // servidor los vuelve a calcular más abajo según el subtotal real. Así
  // nadie puede reclamar un regalo que no corresponde.
  const itemsValidados = [];
  for (const it of itemsInput) {
    if (esRegalo(it.id)) continue;

    const p = porId.get(String(it.id));
    if (!p) {
      return res.status(400).json({ error: `Producto no encontrado: ${it.id}` });
    }
    const qty = Math.max(1, Math.min(10, parseInt(it.quantity, 10) || 0));
    if (qty < 1) {
      return res.status(400).json({ error: `Cantidad inválida para ${p.nombre}` });
    }

    // MercadoPago rechaza montos que no sean enteros positivos (CLP sin
    // decimales). Se corta acá con un mensaje claro en vez de dejar que
    // falle después con "unit_price invalid".
    const precio = Math.round(Number(p.precio));
    if (!Number.isFinite(precio) || precio <= 0) {
      console.error("[crear-preferencia] Precio inválido:", p.id, p.nombre, p.precio);
      return res.status(400).json({
        error: `El producto "${p.nombre || p.id}" no tiene precio disponible. Escríbenos por WhatsApp para completar tu compra.`
      });
    }

    itemsValidados.push({
      id:        String(p.id),
      nombre:    p.nombre,
      cantidad:  qty,
      precio,                          // ← precio real del servidor
      imagen:    p.imagen || "",
      categoria: p.categoria || ""     // la usan el panel y los avisos de compra
    });
  }

  if (itemsValidados.length === 0) {
    return res.status(400).json({ error: "El carrito no tiene productos" });
  }

  const subtotal = itemsValidados.reduce((s, i) => s + i.precio * i.cantidad, 0);

  // Regalos que corresponden según el subtotal verificado en el servidor
  const regalosGanados = METAS_REGALO.filter(m => subtotal >= m.monto).map(m => ({
    id:       m.id,
    nombre:   m.nombre,
    cantidad: 1,
    precio:   0,
    imagen:   "",
    regalo:   true
  }));

  // 3%: debe coincidir con lo que se le mostró al cliente en el carrito
  const comision = Math.round(subtotal * 0.03);
  const total    = subtotal + comision;

  // ── Guardar pedido con total verificado ──
  // Los regalos se guardan junto a los productos para que en bodega
  // aparezcan en la lista de lo que hay que despachar.
  const payload = {
    items: [...itemsValidados, ...regalosGanados],
    total,
    estado: "pendiente"
  };
  if (userId)    payload.user_id    = userId;
  if (datosEnvio) payload.datos_envio = datosEnvio;

  /* Un pedido sin pagar es solo un carrito abandonado. Se limpian los que
     ya llevan días para que no se acumulen en la base. Va sin await: si
     falla no debe frenar la compra de nadie. */
  const haceDias = n => new Date(Date.now() - n * 86400000).toISOString();
  supabase.from("pedidos")
    .delete()
    .eq("estado", "pendiente")
    .lt("created_at", haceDias(DIAS_RETENER_PENDIENTES))
    .then(({ error }) => {
      if (error) console.warn("[crear-preferencia] Limpieza de pendientes:", error.message);
    });

  /* Si el mismo cliente reintenta el mismo pago, se reutiliza su pedido
     pendiente en vez de crear otro.

     Solo aplica a clientes con sesión: ahí el user_id identifica a una
     persona concreta. Para invitados NO se agrupa, porque la única pista
     sería "mismo monto y mismos productos" y dos compradores distintos
     con el carrito igual terminarían compartiendo el mismo pedido: si
     ambos pagaran, una de las dos ventas se perdería. */
  let pedido = null;
  const desdeReciente = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: previos } = userId
    ? await supabase
        .from("pedidos")
        .select("id, items")
        .eq("estado", "pendiente")
        .eq("total", total)
        .eq("user_id", userId)
        .gte("created_at", desdeReciente)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null };

  if (previos && previos.length) {
    const huella = JSON.stringify(payload.items.map(i => [String(i.id), i.cantidad]).sort());
    const igual = previos.find(p => {
      const suyo = Array.isArray(p.items) ? p.items : [];
      return JSON.stringify(suyo.map(i => [String(i.id), i.cantidad]).sort()) === huella;
    });
    if (igual) {
      pedido = { id: igual.id };
      // Se refrescan los datos de envío por si los corrigió antes de reintentar
      await supabase.from("pedidos").update({ datos_envio: datosEnvio || null }).eq("id", igual.id);
      console.log("[crear-preferencia] Reutiliza pedido pendiente:", igual.id);
    }
  }

  if (!pedido) {
    const { data: nuevo, error: pedidoErr } = await supabase
      .from("pedidos")
      .insert(payload)
      .select("id")
      .single();

    if (pedidoErr || !nuevo) {
      console.error("[crear-preferencia] Error guardando pedido:", pedidoErr);
      return res.status(500).json({ error: "No se pudo crear el pedido" });
    }
    pedido = nuevo;
  }

  // ── Crear preferencia en MercadoPago con precios reales ──
  const siteUrl   = process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : siteUrl;

  const mpItems = itemsValidados.map(i => ({
    id:         i.id,
    title:      i.nombre,
    quantity:   i.cantidad,
    unit_price: i.precio,
    currency_id: "CLP"
  }));

  if (comision > 0) {
    mpItems.push({
      id:         "comision-bancaria",
      title:      "Comisión Bancaria",
      quantity:   1,
      unit_price: comision,
      currency_id: "CLP"
    });
  }

  // Validar que tengamos las variables de entorno mínimas
  if (!process.env.MP_ACCESS_TOKEN) {
    console.error("[crear-preferencia] Falta MP_ACCESS_TOKEN");
    return res.status(500).json({ error: "Configuración de pago incompleta" });
  }
  if (!siteUrl || !siteUrl.startsWith("https://")) {
    console.error("[crear-preferencia] SITE_URL inválida o faltante:", siteUrl);
    return res.status(500).json({ error: "Configuración de URL del sitio incompleta" });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    // statement_descriptor: solo ASCII, sin tildes, máx ~22 chars
    // Algunos flujos de MP rechazan caracteres no-ASCII y devuelven CPT01.
    const prefBody = {
      items: mpItems,
      payer: {
        // Algunos flujos de MP requieren un payer válido para checkout web
        // — vacío fuerza al usuario a ingresar sus datos en MP
      },
      back_urls: {
        success: `${siteUrl}/pago-exitoso.html`,
        failure: `${siteUrl}/pago-fallido.html`,
        pending: `${siteUrl}/pago-pendiente.html`
      },
      auto_return:          "approved",
      statement_descriptor: "JoyeriaAravena",
      external_reference:   String(pedido.id),
      notification_url:     `${siteUrl}/api/mp-webhook`,
      binary_mode:          false,
      // Habilitar explícitamente todos los métodos de pago,
      // incluyendo tarjetas de débito (Redcompra) en Chile
      payment_methods: {
        excluded_payment_types:    [],
        excluded_payment_methods:  [],
        installments:              12,
        default_installments:      1
      }
    };

    const response = await preference.create({ body: prefBody });

    if (!response?.init_point) {
      console.error("[crear-preferencia] MP devolvió respuesta sin init_point:", JSON.stringify(response));
      return res.status(502).json({ error: "MercadoPago no devolvió URL de pago" });
    }

    console.log("[crear-preferencia] OK — pedidoId:", pedido.id, "prefId:", response.id);
    return res.status(200).json({ init_point: response.init_point, pedidoId: pedido.id });

  } catch (err) {
    // Log detallado para diagnosticar CPT01 y similares
    console.error("[crear-preferencia] Error MP:", {
      message: err.message,
      status: err.status,
      cause: err.cause,
      error: err.error,
      response: err.response?.data || err.response
    });
    return res.status(500).json({
      error: "Error al crear preferencia",
      detail: err.message,
      mpError: err.cause || err.error || null
    });
  }
};

const { MercadoPagoConfig, Preference } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");

const SUPA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';

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

  // Cargar catálogo desde Supabase para validar precios server-side
  const ids = itemsInput.map(it => String(it.id));
  const { data: catalogoRows, error: catalogoErr } = await supabase
    .from('catalogo')
    .select('id, nombre, precio, imagen_url, activo')
    .in('id', ids)
    .eq('activo', true);

  // Fallback: leer products.js estático si Supabase no tiene el catálogo aún
  let porId;
  if (!catalogoErr && catalogoRows && catalogoRows.length > 0) {
    porId = new Map(catalogoRows.map(p => [String(p.id), {
      id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen_url
    }]));
  } else {
    try {
      const productosEstaticos = require("../js/products.js");
      porId = new Map(productosEstaticos.map(p => [String(p.id), p]));
    } catch (_) {
      porId = new Map();
    }
  }

  // ── Validar precios SERVER-SIDE contra el catálogo real ──
  const itemsValidados = [];
  for (const it of itemsInput) {
    const p = porId.get(String(it.id));
    if (!p) {
      return res.status(400).json({ error: `Producto no encontrado: ${it.id}` });
    }
    const qty = Math.max(1, Math.min(10, parseInt(it.quantity, 10) || 0));
    if (qty < 1) {
      return res.status(400).json({ error: `Cantidad inválida para ${p.nombre}` });
    }
    itemsValidados.push({
      id:       String(p.id),
      nombre:   p.nombre,
      cantidad: qty,
      precio:   Number(p.precio),   // ← precio real del servidor
      imagen:   p.imagen || ""
    });
  }

  const subtotal = itemsValidados.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision = Math.round(subtotal * 0.05);
  const total    = subtotal + comision;

  // ── Guardar pedido con total verificado ──
  const payload = { items: itemsValidados, total, estado: "pendiente" };
  if (userId)    payload.user_id    = userId;
  if (datosEnvio) payload.datos_envio = datosEnvio;

  const { data: pedido, error: pedidoErr } = await supabase
    .from("pedidos")
    .insert(payload)
    .select("id")
    .single();

  if (pedidoErr || !pedido) {
    console.error("[crear-preferencia] Error guardando pedido:", pedidoErr);
    return res.status(500).json({ error: "No se pudo crear el pedido" });
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

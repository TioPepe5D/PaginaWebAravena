const { MercadoPagoConfig, Payment } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");

/* La URL del proyecto Supabase es la misma en todo el backend y va fija,
   igual que en crear-preferencia y el resto de endpoints. Antes este webhook
   leía process.env.SUPABASE_URL —variable que ningún otro endpoint usa—: si
   no estaba configurada en Vercel, confirmar el pago fallaba en silencio y el
   pedido quedaba "pendiente" e invisible en el panel. */
const SUPA_URL = process.env.SUPABASE_URL || 'https://qcaxddxxmrwfihnyepbo.supabase.co';

/* ── Helper: notificación WhatsApp via CallMeBot ── */
async function enviarNotifWhatsApp({ pedidoId, total, items, email }) {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  const phone  = process.env.NOTIF_PHONE || "56966497904";
  if (!apiKey) return;

  const resumen = Array.isArray(items) && items.length
    ? items.map(i => `• ${i.nombre} x${i.cantidad}`).join("\n")
    : "Sin detalle";

  const mensaje =
    `🔔 NUEVO PEDIDO PAGADO — Joyería Aravena\n\n` +
    `💳 Método: MercadoPago ✅\n` +
    `📦 ID: ${pedidoId || "N/A"}\n` +
    `💰 Total: $${Number(total).toLocaleString("es-CL")} CLP\n` +
    `👤 Cliente: ${email || "N/A"}\n\n` +
    `Productos:\n${resumen}`;

  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${phone}` +
    `&text=${encodeURIComponent(mensaje)}` +
    `&apikey=${apiKey}`;

  const resp = await fetch(url);
  console.log("[Notif] WhatsApp enviado:", resp.status);
}

module.exports = async (req, res) => {
  // MP valida y simula con GET/HEAD/OPTIONS — siempre 200 para esos casos
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    const body = req.body || {};
    console.log("[Webhook MP] Método:", req.method, "| Notificación:", JSON.stringify(body));

    // Solo procesar eventos de pago
    const tipo = body.type || body.topic;
    if (tipo !== "payment") {
      console.log("[Webhook MP] Tipo no manejado:", tipo);
      return res.status(200).send("OK");
    }

    const paymentId = body.data?.id || body.id;
    if (!paymentId) return res.status(200).send("OK");

    // Obtener detalles del pago desde MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentApi = new Payment(client);
    const pago = await paymentApi.get({ id: paymentId });

    const mpStatus = pago.status;
    const pedidoId = pago.external_reference;

    console.log("[Webhook MP] Status:", mpStatus, "| PedidoId:", pedidoId);

    if (!pedidoId) return res.status(200).send("OK");

    // Mapear estado MP → nuestro sistema
    let estado;
    if (mpStatus === "approved")                                    estado = "pagado";
    else if (mpStatus === "rejected" || mpStatus === "cancelled")   estado = "fallido";
    else                                                            estado = "pendiente";

    // Actualizar Supabase con la service role key (solo en servidor)
    const supabase = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_KEY);

    // Con .select() confirmamos que la fila realmente se actualizó
    const { data: filas, error } = await supabase
      .from("pedidos")
      .update({ estado, mp_payment_id: String(paymentId) })
      .eq("id", pedidoId)
      .select("id");

    if (error) {
      /* Error transitorio de la base: devolvemos 500 para que MercadoPago
         reintente el webhook. Si respondiéramos 200, la venta quedaría
         pagada en MP y jamás confirmada en el panel (justo el problema que
         estamos corrigiendo). */
      console.error("[Webhook MP] Error Supabase (se pedirá reintento):", error);
      return res.status(500).send("error");
    }

    if (!filas || filas.length === 0) {
      // No hay ningún pedido con ese external_reference: reintentar no ayuda.
      console.error(
        "[Webhook MP] Ningún pedido con id/external_reference:",
        pedidoId, "| pago:", paymentId, "| status:", mpStatus
      );
      return res.status(200).send("OK");
    }

    console.log("[Webhook MP] Pedido", pedidoId, "→", estado);

    // Notificar por WhatsApp solo cuando el pago es aprobado
    if (estado === "pagado") {
      try {
        const { data: pedido } = await supabase
          .from("pedidos")
          .select("total, items, user_id")
          .eq("id", pedidoId)
          .single();

        const email = pago.payer?.email || "N/A";
        const total = pedido?.total ?? pago.transaction_amount ?? 0;
        const items = pedido?.items ?? [];

        await enviarNotifWhatsApp({ pedidoId, total, items, email });
      } catch (ne) {
        console.warn("[Webhook MP] No se pudo notificar:", ne.message);
      }
    }

    return res.status(200).send("OK");

  } catch (err) {
    /* Error inesperado (p. ej. la consulta del pago a MP falló por red). Se
       responde 500 para que MercadoPago reintente y no se pierda la
       confirmación de una venta ya pagada. */
    console.error("[Webhook MP] Error:", err.message);
    return res.status(500).send("error");
  }
};

const { MercadoPagoConfig, Payment } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");

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
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error } = await supabase
      .from("pedidos")
      .update({ estado, mp_payment_id: String(paymentId) })
      .eq("id", pedidoId);

    if (error) {
      console.error("[Webhook MP] Error Supabase:", error);
    } else {
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
    }

    return res.status(200).send("OK");

  } catch (err) {
    // Siempre 200 → MP no reintenta
    console.error("[Webhook MP] Error:", err.message);
    return res.status(200).send("OK");
  }
};

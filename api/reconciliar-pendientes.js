const { createClient } = require('@supabase/supabase-js');

/* =============================================
   RECONCILIAR PENDIENTES CON MERCADOPAGO
   Red de seguridad para cuando el webhook de MP no alcanza a confirmar un
   pago (caída, timeout, notificación perdida): el pedido queda "pendiente"
   y, sin esto, sería invisible en el panel. Aquí se revisa en MercadoPago
   cada pedido pendiente reciente y, SOLO si el pago está aprobado, se pasa
   a "pagado" para que aparezca en "Por Despachar". Nunca inventa ventas:
   si MP no dice "approved", el pedido se queda como está.
   ============================================= */

const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];

const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

// Solo se revisan pendientes recientes: los más viejos son carritos
// abandonados (y la limpieza de crear-preferencia los borra a los 3 días).
const DIAS_ATRAS = 4;
const MAX_A_REVISAR = 60;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { adminToken } = req.body || {};

  // ── Verificar que quien llama es admin ──
  const supabaseAuth = createClient(SUPA_URL, SUPA_ANON);
  let adminEmail = null;
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(adminToken);
    if (error || !user) return res.status(401).json({ error: 'Token inválido' });
    adminEmail = user.email;
  } catch (e) {
    return res.status(401).json({ error: 'Error de autenticación' });
  }
  if (!ADMIN_EMAILS.includes(adminEmail)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const mpToken    = process.env.MP_ACCESS_TOKEN;
  if (!serviceKey) return res.status(500).json({ error: 'Service key no configurada' });
  if (!mpToken)    return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado' });

  const supabase = createClient(SUPA_URL, serviceKey);

  try {
    const desde = new Date(Date.now() - DIAS_ATRAS * 86400000).toISOString();
    const { data: pendientes, error } = await supabase
      .from('pedidos')
      .select('id, total')
      .eq('estado', 'pendiente')
      .gte('created_at', desde)
      .order('created_at', { ascending: false })
      .limit(MAX_A_REVISAR);

    if (error) return res.status(500).json({ error: error.message });
    if (!pendientes || pendientes.length === 0) {
      return res.status(200).json({ ok: true, revisados: 0, confirmados: 0 });
    }

    let confirmados = 0;

    for (const pedido of pendientes) {
      try {
        // Buscar en MP los pagos asociados a este pedido (external_reference)
        const url = 'https://api.mercadopago.com/v1/payments/search'
          + `?external_reference=${encodeURIComponent(pedido.id)}`
          + '&sort=date_created&criteria=desc';
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${mpToken}` }
        });
        if (!resp.ok) continue;

        const data = await resp.json();
        const pagos = Array.isArray(data.results) ? data.results : [];

        // ¿Hay algún pago APROBADO para este pedido?
        const aprobado = pagos.find(p => p.status === 'approved');
        if (!aprobado) continue;

        const { data: filas, error: upErr } = await supabase
          .from('pedidos')
          .update({ estado: 'pagado', mp_payment_id: String(aprobado.id) })
          .eq('id', pedido.id)
          .eq('estado', 'pendiente')          // no pisar si otro proceso ya lo cambió
          .select('id');

        if (!upErr && filas && filas.length) {
          confirmados++;
          console.log('[Reconciliar] Pedido', pedido.id, 'confirmado como pagado (pago', aprobado.id + ')');
        }
      } catch (ie) {
        // Un pedido que falla no debe frenar la revisión del resto
        console.warn('[Reconciliar] Error revisando', pedido.id, ':', ie.message);
      }
    }

    return res.status(200).json({ ok: true, revisados: pendientes.length, confirmados });

  } catch (err) {
    console.error('[Reconciliar] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

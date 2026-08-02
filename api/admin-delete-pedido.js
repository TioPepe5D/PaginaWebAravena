const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];

const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { pedidoId, byStatus, adminToken, hardDelete, accion } = req.body || {};

  /* Acción especial (no borra nada): revisar en MercadoPago los pedidos
     pendientes y confirmar los ya pagados. Vive dentro de este endpoint —y
     no en su propio archivo— para no superar el límite de 12 funciones
     serverless del plan de Vercel. */
  if (accion === 'reconciliar') {
    return reconciliarPendientesConMP(adminToken, res);
  }

  if (!pedidoId && !byStatus) {
    return res.status(400).json({ error: 'Falta pedidoId o byStatus' });
  }

  const ESTADOS_BORRABLES = ['fallido', 'pendiente', 'transferencia_pendiente'];
  if (byStatus && !ESTADOS_BORRABLES.includes(byStatus)) {
    return res.status(400).json({ error: `Estado no permitido para borrado masivo: ${byStatus}` });
  }

  // Verificar admin
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
  if (!serviceKey) return res.status(500).json({ error: 'Service key no configurada' });

  const supabaseAdmin = createClient(SUPA_URL, serviceKey);

  // hardDelete=true solo cuando el admin confirma desde la vista de eliminados
  if (hardDelete) {
    if (byStatus === 'eliminado') {
      const { data, error } = await supabaseAdmin
        .from('pedidos').delete().eq('estado', 'eliminado').select('id');
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, deleted: (data || []).length });
    }
    if (pedidoId) {
      const { data, error } = await supabaseAdmin
        .from('pedidos').delete().eq('id', pedidoId).select('id');
      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) {
        return res.status(404).json({ error: `No se pudo borrar el pedido ${pedidoId}.` });
      }
      return res.status(200).json({ ok: true, deleted: data.length });
    }
  }

  // Soft delete: marcar como 'eliminado' en vez de borrar
  if (byStatus) {
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update({ estado: 'eliminado' })
      .eq('estado', byStatus)
      .select('id');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, deleted: (data || []).length });
  }

  /* Con .select() se sabe cuántas filas cambiaron de verdad. Sin él la API
     respondía "deleted: 1" siempre, aunque no hubiera tocado nada: el panel
     ocultaba el pedido y al refrescar reaparecía. */
  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .update({ estado: 'eliminado' })
    .eq('id', pedidoId)
    .select('id');

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    console.error('[admin-delete-pedido] Ninguna fila actualizada para id:', pedidoId);
    return res.status(404).json({ error: `No se pudo eliminar el pedido ${pedidoId}: la base no registró el cambio.` });
  }
  return res.status(200).json({ ok: true, deleted: data.length });
};

/* ── Reconciliar pendientes con MercadoPago ──────────────────
   Red de seguridad para cuando el webhook no alcanza a confirmar un pago: el
   pedido queda "pendiente" e invisible. Aquí se revisa en MercadoPago cada
   pedido pendiente reciente y, SOLO si el pago está aprobado, se pasa a
   "pagado" (→ Por Despachar). Nunca inventa ventas: si MP no dice "approved",
   no toca el pedido. */
async function reconciliarPendientesConMP(adminToken, res) {
  // Mismas verificaciones de admin que el resto del endpoint
  const supabaseAuth = createClient(SUPA_URL, SUPA_ANON);
  let adminEmail = null;
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(adminToken);
    if (error || !user) return res.status(401).json({ error: 'Token inválido' });
    adminEmail = user.email;
  } catch (e) {
    return res.status(401).json({ error: 'Error de autenticación' });
  }
  if (!ADMIN_EMAILS.includes(adminEmail)) return res.status(403).json({ error: 'No autorizado' });

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const mpToken    = process.env.MP_ACCESS_TOKEN;
  if (!serviceKey) return res.status(500).json({ error: 'Service key no configurada' });
  if (!mpToken)    return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado' });

  const supabase = createClient(SUPA_URL, serviceKey);
  const DIAS_ATRAS = 7;
  const MAX_A_REVISAR = 80;

  try {
    const desde = new Date(Date.now() - DIAS_ATRAS * 86400000).toISOString();
    const { data: pendientes, error } = await supabase
      .from('pedidos')
      .select('id')
      .eq('estado', 'pendiente')
      .gte('created_at', desde)
      .order('created_at', { ascending: false })
      .limit(MAX_A_REVISAR);

    if (error) return res.status(500).json({ error: error.message });
    if (!pendientes || !pendientes.length) {
      return res.status(200).json({ ok: true, revisados: 0, confirmados: 0 });
    }

    let confirmados = 0;
    for (const pedido of pendientes) {
      try {
        // Buscar en MP los pagos asociados a este pedido (external_reference)
        const url = 'https://api.mercadopago.com/v1/payments/search'
          + `?external_reference=${encodeURIComponent(pedido.id)}`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${mpToken}` } });
        if (!resp.ok) continue;

        const data = await resp.json();
        const pagos = Array.isArray(data.results) ? data.results : [];
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
          console.log('[Reconciliar] Pedido', pedido.id, 'confirmado (pago', aprobado.id + ')');
        }
      } catch (ie) {
        console.warn('[Reconciliar] Error en', pedido.id, ':', ie.message);
      }
    }

    return res.status(200).json({ ok: true, revisados: pendientes.length, confirmados });
  } catch (err) {
    console.error('[Reconciliar] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

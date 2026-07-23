const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];

const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { pedidoId, byStatus, adminToken, hardDelete } = req.body || {};

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

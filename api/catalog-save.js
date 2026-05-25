// Guarda un producto analizado en ambos Supabase (sin descargar imagen completa)
const { createClient } = require('@supabase/supabase-js');

const SUPA_ARAVENA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const SUPA_AMMIRA_URL  = 'https://jgtavepljzcwwagdihgx.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';
const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Sin autorización' });

  const supaAuth = createClient(SUPA_ARAVENA_URL, SUPA_ANON);
  const { data: { user }, error: authError } = await supaAuth.auth.getUser(token);
  if (authError || !user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const serviceKeyAravena = process.env.SUPABASE_SERVICE_KEY;
  const serviceKeyAmmira  = process.env.AMMIRA_SUPABASE_SERVICE_KEY;
  if (!serviceKeyAravena) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY no configurada' });

  const { driveFileId, nombre, precio, categoria, imageUrl, modifiedTime } = req.body || {};
  if (!driveFileId || !imageUrl) return res.status(400).json({ error: 'Faltan datos requeridos' });

  const row = {
    drive_file_id: driveFileId,
    nombre:    nombre || 'Sin nombre',
    precio:    parseInt(precio, 10) || 0,
    imagen_url: imageUrl,
    categoria: categoria || 'general',
    descripcion: nombre || '',
    activo: true,
    drive_modified_time: modifiedTime || null,
    updated_at: new Date().toISOString(),
  };

  const supaAravena = createClient(SUPA_ARAVENA_URL, serviceKeyAravena);
  const { error: errA } = await supaAravena.from('catalogo')
    .upsert(row, { onConflict: 'drive_file_id' });
  if (errA) return res.status(500).json({ error: 'Aravena DB: ' + errA.message });

  if (serviceKeyAmmira) {
    const supaAmmira = createClient(SUPA_AMMIRA_URL, serviceKeyAmmira);
    await supaAmmira.from('catalogo').upsert(row, { onConflict: 'drive_file_id' });
  }

  return res.status(200).json({ ok: true });
};

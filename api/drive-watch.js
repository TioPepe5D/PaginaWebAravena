const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';
const ADMIN_EMAILS = ['diegoaravenavera@gmail.com', 'martinmagun2@gmail.com'];
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYXhkZHh4bXJ3ZmlobnllcGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE5NDgsImV4cCI6MjA5MjQwNzk0OH0.0WtrOUK3_SDCkpVBTPg_aMz8rUk1sJ_ms6Ak5p5Xi08';

// URL pública del webhook — usa la variable de entorno o la URL de Vercel
function getWebhookUrl(req) {
  if (process.env.WEBHOOK_BASE_URL) return process.env.WEBHOOK_BASE_URL + '/api/drive-webhook';
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || '';
  return `https://${host}/api/drive-webhook`;
}

module.exports = async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey  = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const folderId    = process.env.DRIVE_FOLDER_ID;

  if (!serviceKey || !clientEmail || !privateKey || !folderId) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas' });
  }

  // Verificar si es cron (Vercel) o llamada manual de admin
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    // Verificar admin
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Sin autorización' });

    const supaAuth = createClient(SUPA_URL, SUPA_ANON);
    const { data: { user }, error } = await supaAuth.auth.getUser(token);
    if (error || !user || !ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
  }

  const supabaseAdmin = createClient(SUPA_URL, serviceKey);

  // Verificar si el watch actual todavía es válido (> 24h restantes)
  const { data: watchData } = await supabaseAdmin
    .from('drive_watch').select('*').eq('id', 1).single();

  const ahora = Date.now();
  const unDia = 24 * 60 * 60 * 1000;
  if (watchData?.expiration && watchData.expiration - ahora > unDia) {
    const restante = Math.round((watchData.expiration - ahora) / 3600000);
    return res.status(200).json({ ok: true, message: `Watch válido. Expira en ${restante}h`, expiration: watchData.expiration });
  }

  // Detener watch anterior si existe
  if (watchData?.channel_id && watchData?.resource_id) {
    try {
      const auth = new google.auth.JWT({
        email: clientEmail, key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      const drive = google.drive({ version: 'v3', auth });
      await drive.channels.stop({
        requestBody: { id: watchData.channel_id, resourceId: watchData.resource_id }
      });
    } catch (_) { /* ignorar si ya expiró */ }
  }

  // Registrar nuevo watch
  try {
    const auth = new google.auth.JWT({
      email: clientEmail, key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });
    const channelId = uuidv4();
    const webhookUrl = getWebhookUrl(req);
    const expiration = ahora + (7 * 24 * 60 * 60 * 1000); // 7 días

    const watchResp = await drive.files.watch({
      fileId: folderId,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        expiration: expiration.toString(),
      },
    });

    const resourceId = watchResp.data.resourceId;
    const expirationReal = parseInt(watchResp.data.expiration || expiration, 10);

    // Guardar en Supabase
    await supabaseAdmin.from('drive_watch').upsert({
      id: 1,
      channel_id: channelId,
      resource_id: resourceId,
      expiration: expirationReal,
      webhook_url: webhookUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    return res.status(200).json({
      ok: true,
      message: 'Watch registrado correctamente',
      channelId,
      webhookUrl,
      expiration: new Date(expirationReal).toISOString(),
    });
  } catch (e) {
    console.error('[drive-watch]', e.message);
    return res.status(500).json({ error: e.message });
  }
};

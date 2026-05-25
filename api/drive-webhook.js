const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const SUPA_URL  = 'https://qcaxddxxmrwfihnyepbo.supabase.co';

function getDriveAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

// Detecta categoría desde el título extraído por OCR
function detectarCategoria(nombre) {
  const n = nombre.toUpperCase();
  if (n.includes('COLLAR'))    return 'collares';
  if (n.includes('PULSERA') || n.includes('TOBILLERA')) return 'pulseras';
  if (n.includes('ARO') || n.includes('ARGOLLA') || n.includes('ARITO')) return 'aros';
  if (n.includes('ANILLO'))    return 'anillos';
  if (n.includes('CONJUNTO'))  return 'conjuntos';
  if (n.includes('COLGANTE') || n.includes('CHARM')) return 'colgantes';
  if (n.includes('EXHIBIDOR') || n.includes('MALETA') || n.includes('MANGA')) return 'exhibidores';
  return 'general';
}

// Extrae título y precio del texto OCR
function extraerDatos(textoCompleto) {
  const lineas = textoCompleto.split('\n').map(l => l.trim()).filter(Boolean);

  // Precio: busca patrón $XX.XXX o $XX,XXX
  let precio = 0;
  let lineaPrecio = '';
  for (const linea of lineas) {
    const match = linea.match(/\$\s*([\d.,]+)/);
    if (match) {
      const raw = match[1].replace(/\./g, '').replace(/,/g, '');
      precio = parseInt(raw, 10) || 0;
      lineaPrecio = linea;
      break;
    }
  }

  // Título: primera línea larga que no sea el precio
  const nombre = lineas.find(l => l !== lineaPrecio && l.length > 3) || '';

  return { nombre: nombre.trim(), precio };
}

// Procesa un archivo de Drive: OCR + subir a Storage + guardar en catalogo
async function procesarArchivo(file, supabaseAdmin) {
  const auth = getDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  // Descargar imagen
  const resp = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer = Buffer.from(resp.data);
  const mimeType = resp.headers['content-type'] || 'image/jpeg';
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

  // OCR con Google Vision API
  const accessToken = await auth.getAccessToken();
  const base64 = buffer.toString('base64');
  const visionResp = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
    }
  );
  const visionData = await visionResp.json();
  const textoCompleto = visionData?.responses?.[0]?.textAnnotations?.[0]?.description || '';
  const { nombre, precio } = extraerDatos(textoCompleto);

  // Subir imagen a Supabase Storage
  const fileName = `${file.id}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('productos')
    .upload(fileName, buffer, { contentType: mimeType, upsert: true });
  if (uploadError) throw new Error('Storage: ' + uploadError.message);

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('productos').getPublicUrl(fileName);

  const categoria = detectarCategoria(nombre);

  // Guardar en catálogo
  const { error: dbError } = await supabaseAdmin
    .from('catalogo')
    .upsert({
      drive_file_id: file.id,
      nombre,
      precio,
      imagen_url: publicUrl,
      categoria,
      descripcion: nombre,
      activo: true,
      drive_modified_time: file.modifiedTime,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'drive_file_id' });

  if (dbError) throw new Error('DB: ' + dbError.message);
  return { nombre, precio, url: publicUrl };
}

module.exports = async (req, res) => {
  // Drive envía POST para notificar cambios
  const state = req.headers['x-goog-resource-state'];

  // Responder siempre 200 primero para que Drive no reintente
  res.status(200).end();

  // Sync = handshake inicial, ignorar
  if (!state || state === 'sync') return;

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return;

  const supabaseAdmin = createClient(SUPA_URL, serviceKey);
  const auth = getDriveAuth();
  const drive = google.drive({ version: 'v3', auth });
  const folderId = process.env.DRIVE_FOLDER_ID;

  try {
    // Listar todos los archivos actuales en Drive
    const driveResp = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, modifiedTime)',
      pageSize: 500,
    });
    const driveFiles = driveResp.data.files || [];
    const driveIds = new Set(driveFiles.map(f => f.id));

    // Obtener catálogo actual de Supabase
    const { data: dbFiles } = await supabaseAdmin
      .from('catalogo').select('drive_file_id, drive_modified_time, activo');
    const dbMap = new Map((dbFiles || []).map(r => [r.drive_file_id, r]));

    // Archivos eliminados de Drive → desactivar en DB
    for (const [driveId, row] of dbMap) {
      if (!driveIds.has(driveId) && row.activo) {
        await supabaseAdmin.from('catalogo')
          .update({ activo: false, updated_at: new Date().toISOString() })
          .eq('drive_file_id', driveId);
      }
    }

    // Archivos nuevos o modificados en Drive → procesar
    for (const file of driveFiles) {
      const existing = dbMap.get(file.id);
      const esNuevo = !existing;
      const modificado = existing && existing.drive_modified_time !== file.modifiedTime;

      if (esNuevo || modificado) {
        try {
          await procesarArchivo(file, supabaseAdmin);
        } catch (e) {
          console.error(`[webhook] Error procesando ${file.name}:`, e.message);
        }
      }

      // Reactivar si estaba desactivado y volvió a Drive
      if (existing && !existing.activo && driveIds.has(file.id)) {
        await supabaseAdmin.from('catalogo')
          .update({ activo: true, updated_at: new Date().toISOString() })
          .eq('drive_file_id', file.id);
      }
    }
  } catch (e) {
    console.error('[webhook] Error general:', e.message);
  }
};

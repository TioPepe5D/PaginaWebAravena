// Recibe la URL de una miniatura de Drive, llama a Gemini y devuelve análisis
const { analizarConGemini } = require('./_gemini');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { thumbnailUrl, mimeType = 'image/jpeg' } = req.body || {};
  if (!thumbnailUrl) return res.status(400).json({ error: 'Falta thumbnailUrl' });

  try {
    // Descargar miniatura (pequeña, rápida ~10-50KB)
    const resp = await fetch(thumbnailUrl);
    if (!resp.ok) throw new Error(`No se pudo descargar miniatura: ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const base64 = buffer.toString('base64');

    const resultado = await analizarConGemini(base64, mimeType);
    return res.status(200).json({ ok: true, ...resultado });
  } catch (e) {
    console.error('[gemini-analyze]', e.message);
    return res.status(500).json({ error: e.message });
  }
};

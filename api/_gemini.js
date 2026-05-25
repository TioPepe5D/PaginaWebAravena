// Módulo compartido: analiza una imagen con Gemini y devuelve { nombre, precio, categoria }

const PROMPT = `Eres un experto en joyería mayorista chilena. Analiza esta imagen y responde ÚNICAMENTE con JSON válido (sin markdown, sin explicación):
{"nombre":"nombre descriptivo del producto en español, máximo 50 caracteres, ej: Lote Collares Corazón Plateado","precio":precio_entero_en_pesos_chilenos_si_hay_precio_visible_sino_0,"categoria":"una de estas exactas: collares | pulseras | aros | anillos | conjuntos | colgantes | exhibidores | general"}

Si ves un precio ($XX.XXX o similar) en la imagen, úsalo como número entero sin puntos. Si no hay precio visible, usa 0.`;

async function analizarConGemini(base64, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error('Gemini API error: ' + err.slice(0, 200));
  }

  const data = await resp.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  // Extraer JSON aunque venga con markdown
  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini no devolvió JSON válido: ' + texto.slice(0, 100));

  const resultado = JSON.parse(match[0]);
  return {
    nombre:    (resultado.nombre    || '').trim().slice(0, 100),
    precio:    parseInt(resultado.precio, 10) || 0,
    categoria: resultado.categoria  || 'general',
  };
}

module.exports = { analizarConGemini };

/* =============================================
   VENTAS RECIENTES (para los avisos de la portada)
   Devuelve compras reales ya pagadas, reducidas al mínimo: nombre de
   pila y comuna. Nunca sale el apellido, el correo, el teléfono, el RUT,
   la dirección ni el monto — con eso basta para el aviso y no expone
   datos de los clientes.
   ============================================= */

const { createClient } = require('@supabase/supabase-js');

const SUPA_URL = 'https://qcaxddxxmrwfihnyepbo.supabase.co';

// Solo se muestran compras de las últimas semanas: un aviso de hace
// medio año no dice nada sobre el movimiento actual de la tienda.
const DIAS_VENTANA = 45;
const MAXIMO = 25;

// Se agrupa por tipo para no señalar el pedido exacto de una persona
const ETIQUETA_CATEGORIA = {
  collares: 'un lote de collares',
  pulseras: 'un lote de pulseras',
  aros: 'un lote de aros',
  anillos: 'un lote de anillos',
  colgantes: 'un lote de colgantes',
  conjuntos: 'un lote de conjuntos',
  exhibidores: 'insumos para su vitrina',
};

function primerNombre(nombre) {
  if (!nombre) return '';
  const n = String(nombre).trim().split(/\s+/)[0];
  if (n.length < 2) return '';
  // Capitalizado, por si vino todo en minúsculas o mayúsculas
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}

module.exports = async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return res.status(200).json({ ventas: [] });

  try {
    const supabase = createClient(SUPA_URL, serviceKey);
    const desde = new Date(Date.now() - DIAS_VENTANA * 86400000).toISOString();

    const { data, error } = await supabase
      .from('pedidos')
      .select('created_at, items, datos_envio, estado')
      .in('estado', ['pagado', 'enviado'])
      .gte('created_at', desde)
      .order('created_at', { ascending: false })
      .limit(80);

    if (error || !data) return res.status(200).json({ ventas: [] });

    const ventas = [];
    const vistos = new Set();

    for (const p of data) {
      const d = p.datos_envio || {};
      const nombre = primerNombre(d.nombre);
      const comuna = (d.comuna || d.ciudad || '').trim();
      if (!nombre || !comuna) continue;

      // Una persona no aparece dos veces seguidas en la rotación
      const clave = nombre + '|' + comuna;
      if (vistos.has(clave)) continue;
      vistos.add(clave);

      const items = Array.isArray(p.items) ? p.items.filter(i => !i.regalo) : [];
      const cats = items.map(i => i.categoria).filter(Boolean);
      const cat = cats.length ? cats[0] : null;

      ventas.push({
        nombre,
        comuna,
        que: ETIQUETA_CATEGORIA[cat] || 'su pedido',
        fecha: p.created_at,
      });

      if (ventas.length >= MAXIMO) break;
    }

    // Se cachea unos minutos: no hace falta consultar en cada visita
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ ventas });

  } catch (e) {
    console.error('[ventas-recientes]', e.message);
    return res.status(200).json({ ventas: [] });
  }
};

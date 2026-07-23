/* =============================================
   REGALOS POR MONTO DE COMPRA
   Tres objetivos. Al alcanzarlos el regalo entra al carrito como
   producto de $0; si el pedido baja del monto, se retira solo.
   Se usa tanto en el panel lateral como en la página del carrito.
   ============================================= */

const METAS_REGALO = [
  { id: "regalo-50",  monto: 50000,  emoji: "🎁", nombre: "Regalo sorpresa por compra sobre $50.000" },
  { id: "regalo-100", monto: 100000, emoji: "🎀", nombre: "Regalo sorpresa por compra sobre $100.000" },
  { id: "regalo-250", monto: 250000, emoji: "💎", nombre: "Regalo sorpresa por compra sobre $250.000" },
];

// Acepta el producto completo o solo su id
function esRegalo(item) {
  const id = (item && typeof item === "object") ? item.id : item;
  return METAS_REGALO.some(m => m.id === String(id));
}

function metaDeRegalo(item) {
  return METAS_REGALO.find(m => m.id === String(item.id));
}

// El monto que cuenta para los objetivos no incluye los propios regalos
function subtotalPagado(lista) {
  return lista.reduce((s, i) => esRegalo(i) ? s : s + i.precio * i.cantidad, 0);
}

/* Ajusta la lista de regalos al monto actual.
   Devuelve { lista, cambio, nuevos } sin tocar nada más. */
function ajustarRegalos(lista) {
  const base = subtotalPagado(lista);
  let resultado = [...lista];
  let cambio = false;
  const nuevos = [];

  METAS_REGALO.forEach(meta => {
    const yaEsta = resultado.some(i => String(i.id) === meta.id);
    const alcanzado = base >= meta.monto;

    if (alcanzado && !yaEsta) {
      resultado.push({ id: meta.id, nombre: meta.nombre, precio: 0, imagen: "",
                       categoria: "Regalo", cantidad: 1, regalo: true });
      nuevos.push(meta);
      cambio = true;
    } else if (!alcanzado && yaEsta) {
      resultado = resultado.filter(i => String(i.id) !== meta.id);
      cambio = true;
    }
  });

  return { lista: resultado, cambio, nuevos };
}

// La API de pago reutiliza estas mismas definiciones (Node), para que los
// montos de los regalos no puedan quedar desincronizados entre las dos partes.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { METAS_REGALO, esRegalo, subtotalPagado, ajustarRegalos };
}

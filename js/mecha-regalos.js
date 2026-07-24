/* =============================================
   MECHA DE REGALOS (portada)
   Barra fija bajo la cinta que avanza con lo que lleva el carrito y
   marca los tres montos. Da el objetivo a la vista sin obligar a entrar
   al carrito para enterarse.
   ============================================= */

/* La escala no es lineal: si $250.000 fuera el 100%, el primer regalo
   —el que casi todos alcanzan— quedaría apretado en el 20% inicial.
   Con estos tramos, llegar a $50.000 ya llena una quinta parte visible. */
const MECHA_TRAMOS = [
  { monto: 0,      pct: 0 },
  { monto: 50000,  pct: 20 },
  { monto: 100000, pct: 40 },
  { monto: 250000, pct: 100 },
];

function mechaPorcentaje(monto) {
  for (let i = 1; i < MECHA_TRAMOS.length; i++) {
    const a = MECHA_TRAMOS[i - 1], b = MECHA_TRAMOS[i];
    if (monto <= b.monto) {
      const avance = (monto - a.monto) / (b.monto - a.monto);
      return a.pct + avance * (b.pct - a.pct);
    }
  }
  return 100;
}

function actualizarMecha() {
  const barra = document.getElementById('mecha');
  if (!barra) return;

  // El carrito puede no estar cargado todavía en esta página
  const lista = (typeof carrito !== 'undefined' && Array.isArray(carrito)) ? carrito : [];
  const total = lista.reduce((s, i) => (i.regalo ? s : s + (i.precio || 0) * (i.cantidad || 1)), 0);

  const pct = mechaPorcentaje(total);
  const llena = document.getElementById('mecha-llena');
  if (llena) llena.style.width = pct + '%';

  // Cada hito alcanzado se enciende
  const metas = [50000, 100000, 250000];
  document.querySelectorAll('.mecha-hito').forEach(h => {
    h.classList.toggle('logrado', total >= Number(h.dataset.monto));
  });

  const siguiente = metas.find(m => total < m);
  const texto = document.getElementById('mecha-texto');
  if (!texto) return;

  if (!siguiente) {
    texto.innerHTML = '🎉 <b>¡Desbloqueaste los 3 regalos!</b> Ya están en tu carrito';
    barra.classList.add('mecha-completa');
    return;
  }
  barra.classList.remove('mecha-completa');

  const falta = siguiente - total;
  texto.innerHTML = total === 0
    ? `🎁 Suma <b>$50.000</b> y tu primer regalo va incluido`
    : `🎁 Te faltan <b>$${falta.toLocaleString('es-CL')}</b> para tu ${total >= 50000 ? 'siguiente' : 'primer'} regalo`;
}

/* El carrito se toca desde varios lugares (tarjetas, panel, sugeridos).
   En vez de llamar a esta función en cada uno, se observa el contador del
   header, que ya se actualiza en todos los casos. */
function observarCarritoParaMecha() {
  const contador = document.getElementById('carrito-contador');
  if (!contador) return;
  new MutationObserver(actualizarMecha).observe(contador, {
    childList: true, characterData: true, subtree: true,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('mecha')) return;
  actualizarMecha();
  observarCarritoParaMecha();
  // Si el carrito cambió en otra pestaña
  window.addEventListener('storage', e => { if (e.key === 'carrito') actualizarMecha(); });
});

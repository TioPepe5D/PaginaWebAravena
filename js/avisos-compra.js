/* =============================================
   AVISOS DE COMPRA — portada
   Muestra de a ratos que alguien compró: da confianza y mueve a decidir.

   Se alimenta de ventas REALES ya pagadas (/api/ventas-recientes), con
   solo el nombre de pila y la comuna. Si no hay ventas que mostrar, no
   aparece nada: es preferible a inventar compras que no ocurrieron.
   ============================================= */

const AVISO_PRIMERO_MS   = 25000;   // el primero, ya entrado en la página
const AVISO_INTERVALO_MS = 55000;   // separación entre avisos
const AVISO_DURACION_MS  = 6000;    // cuánto se queda a la vista
const AVISO_MAX_POR_VISITA = 4;     // luego se calla: si insiste, cansa

let _ventasAvisos = [];
let _indiceAviso = 0;
let _mostrados = 0;
let _timerAviso = null;

/* "hace 2 horas", "ayer", "hace 3 días" — sin horas exactas, que no
   aportan y delatarían el momento de compra de una persona */
function haceCuanto(iso) {
  const minutos = Math.max(1, Math.round((Date.now() - new Date(iso)) / 60000));
  if (minutos < 60)   return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24)     return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  const dias = Math.round(horas / 24);
  if (dias === 1)     return 'ayer';
  if (dias < 7)       return `hace ${dias} días`;
  const semanas = Math.round(dias / 7);
  return `hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
}

function barajarAvisos(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cajaAviso() {
  let caja = document.getElementById('aviso-compra');
  if (caja) return caja;
  caja = document.createElement('div');
  caja.id = 'aviso-compra';
  caja.className = 'aviso-compra';
  caja.setAttribute('role', 'status');
  document.body.appendChild(caja);
  return caja;
}

function mostrarAvisoCompra(v) {
  const caja = cajaAviso();
  caja.innerHTML = `
    <span class="aviso-compra-icono">🛍️</span>
    <span class="aviso-compra-txt">
      <strong>${v.nombre}, de ${v.comuna}</strong>
      <small>compró ${v.que} · ${haceCuanto(v.fecha)}</small>
    </span>`;

  caja.classList.remove('activo');
  void caja.offsetWidth;              // reinicia la animación
  caja.classList.add('activo');
  setTimeout(() => caja.classList.remove('activo'), AVISO_DURACION_MS);
}

function siguienteAviso() {
  if (_mostrados >= AVISO_MAX_POR_VISITA || !_ventasAvisos.length) return;

  // Con la pestaña en segundo plano no se gasta un aviso
  if (document.visibilityState !== 'visible') {
    _timerAviso = setTimeout(siguienteAviso, 10000);
    return;
  }

  mostrarAvisoCompra(_ventasAvisos[_indiceAviso % _ventasAvisos.length]);
  _indiceAviso++;
  _mostrados++;

  if (_mostrados < AVISO_MAX_POR_VISITA) {
    // Se varía el intervalo para que no caiga siempre al mismo ritmo
    const variacion = (Math.random() - 0.5) * 20000;
    _timerAviso = setTimeout(siguienteAviso, AVISO_INTERVALO_MS + variacion);
  }
}

/* Mezcla las ventas reales con las de ejemplo. Las reales van siempre
   primero y cada una desplaza a una de ejemplo, así la lista se va
   volviendo real sola a medida que la tienda vende. Cuando hay
   suficientes reales, las de ejemplo dejan de usarse por completo. */
function armarListaAvisos(reales) {
  const hayEjemplo = typeof ventasEjemploConFecha === 'function';
  const umbral = (typeof VENTAS_REALES_SUFICIENTES !== 'undefined') ? VENTAS_REALES_SUFICIENTES : 15;

  if (!hayEjemplo || reales.length >= umbral) return barajarAvisos(reales);

  // Se completa hasta el umbral, sin repetir a alguien que ya vendió
  const nombresReales = new Set(reales.map(v => v.nombre.toLowerCase()));
  const relleno = ventasEjemploConFecha()
    .filter(v => !nombresReales.has(v.nombre.toLowerCase()))
    .slice(0, Math.max(0, umbral - reales.length));

  return barajarAvisos([...reales, ...relleno]);
}

async function inicializarAvisosCompra() {
  // Solo en la portada
  const ruta = location.pathname.split('/').pop() || 'index.html';
  if (ruta !== 'index.html' && ruta !== '') return;

  let reales = [];
  try {
    const res = await fetch('/api/ventas-recientes');
    if (res.ok) {
      const datos = await res.json();
      if (Array.isArray(datos.ventas)) reales = datos.ventas;
    }
  } catch (_) {
    // Sin conexión con la API se sigue con lo que haya
  }

  const lista = armarListaAvisos(reales);
  if (lista.length < 3) return;   // muy pocas: no vale la pena

  _ventasAvisos = lista;
  _timerAviso = setTimeout(siguienteAviso, AVISO_PRIMERO_MS);
}

document.addEventListener('DOMContentLoaded', inicializarAvisosCompra);

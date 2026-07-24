/* =============================================
   FECHAS EN HORA DE CHILE
   toISOString() devuelve la fecha en UTC. Chile va 3 o 4 horas atrás,
   así que a las 20:00 (o 21:00 en verano) UTC ya marca el día siguiente:
   los contadores "de hoy" se reiniciaban esa noche en vez de a medianoche.

   Intl con timeZone resuelve el horario de verano solo, sin tener que
   saber en qué parte del año estamos.
   ============================================= */

const ZONA_CHILE = 'America/Santiago';

// Formato YYYY-MM-DD tal como se guarda en la columna `fecha`
const _fmtFechaChile = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_CHILE,
  year: 'numeric', month: '2-digit', day: '2-digit',
});

function fechaChile(d) {
  return _fmtFechaChile.format(d || new Date());
}

/* Partes del día en Chile, para poder construir fechas relativas
   (ayer, lunes de esta semana, primer día del mes) sin salirse de la zona */
function partesChile(d) {
  const [a, m, dia] = fechaChile(d).split('-').map(Number);
  return { anio: a, mes: m, dia };
}

// Fecha de hace N días, en hora de Chile
function fechaChileHace(dias) {
  return fechaChile(new Date(Date.now() - dias * 86400000));
}

/* Lunes de la semana en curso. getUTCDay() sobre la fecha ya convertida
   evita que el huso del computador del admin corra el cálculo un día. */
function lunesChile() {
  const hoy = fechaChile();
  const d = new Date(hoy + 'T12:00:00Z');       // mediodía: nunca cambia de día al restar
  const diaSemana = (d.getUTCDay() + 6) % 7;    // 0 = lunes
  d.setUTCDate(d.getUTCDate() - diaSemana);
  return d.toISOString().slice(0, 10);
}

// Primer día del mes en curso
function primerDiaMesChile() {
  const { anio, mes } = partesChile();
  return `${anio}-${String(mes).padStart(2, '0')}-01`;
}

// Disponible también para la API (Node), no solo para el navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fechaChile, fechaChileHace, lunesChile, primerDiaMesChile, partesChile, ZONA_CHILE };
}

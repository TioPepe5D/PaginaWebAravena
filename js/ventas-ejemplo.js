/* =============================================
   VENTAS DE EJEMPLO — TEMPORAL
   Rellenan los avisos de la portada mientras la tienda junta ventas
   reales. NO corresponden a compras que hayan ocurrido.

   Se retiran solas: cada venta real desplaza a una de esta lista, y al
   llegar a VENTAS_REALES_SUFICIENTES deja de usarse por completo.
   Para eliminarlas antes, basta con borrar este archivo y su <script>
   en index.html — los avisos seguirán andando solo con ventas reales.
   ============================================= */

const VENTAS_REALES_SUFICIENTES = 15;

const VENTAS_EJEMPLO = [
  { nombre: 'Camila',    comuna: 'Puerto Varas',  que: 'un lote de collares' },
  { nombre: 'Valentina', comuna: 'Temuco',        que: 'un lote de aros' },
  { nombre: 'Javiera',   comuna: 'Providencia',   que: 'un lote de conjuntos' },
  { nombre: 'Constanza', comuna: 'La Serena',     que: 'un lote de pulseras' },
  { nombre: 'Fernanda',  comuna: 'Concepción',    que: 'un lote de collares' },
  { nombre: 'Antonia',   comuna: 'Viña del Mar',  que: 'un lote de aros' },
  { nombre: 'Daniela',   comuna: 'Rancagua',      que: 'un lote de conjuntos' },
  { nombre: 'Catalina',  comuna: 'Antofagasta',   que: 'un lote de colgantes' },
  { nombre: 'Paulina',   comuna: 'Talcahuano',    que: 'un lote de collares' },
  { nombre: 'Francisca', comuna: 'Maipú',         que: 'un lote de pulseras' },
  { nombre: 'Karla',     comuna: 'Iquique',       que: 'un lote de aros' },
  { nombre: 'Nicole',    comuna: 'Peñalolén',     que: 'un lote de conjuntos' },
  { nombre: 'Bárbara',   comuna: 'Valdivia',      que: 'un lote de collares' },
  { nombre: 'Macarena',  comuna: 'Puente Alto',   que: 'un lote de anillos' },
  { nombre: 'Carolina',  comuna: 'Arica',         que: 'un lote de pulseras' },
  { nombre: 'Pamela',    comuna: 'Osorno',        que: 'un lote de aros' },
  { nombre: 'Andrea',    comuna: 'Quilpué',       que: 'un lote de collares' },
  { nombre: 'Tamara',    comuna: 'Copiapó',       que: 'un lote de conjuntos' },
  { nombre: 'Marcela',   comuna: 'Chillán',       que: 'un lote de colgantes' },
  { nombre: 'Ignacia',   comuna: 'Ñuñoa',         que: 'un lote de aros' },
  { nombre: 'Alejandra', comuna: 'Punta Arenas',  que: 'un lote de collares' },
  { nombre: 'Romina',    comuna: 'Coquimbo',      que: 'un lote de pulseras' },
  { nombre: 'Scarlett',  comuna: 'Curicó',        que: 'un lote de conjuntos' },
  { nombre: 'Yasna',     comuna: 'Calama',        que: 'un lote de aros' },
  { nombre: 'Priscila',  comuna: 'San Bernardo',  que: 'un lote de collares' },
];

/* Las fechas se calculan al cargar la página: así los avisos siempre
   dicen "hace 3 horas" y no quedan congelados en una fecha vieja. */
function ventasEjemploConFecha() {
  return VENTAS_EJEMPLO.map((v, i) => {
    // Repartidas entre las últimas ~2 semanas, sin dos iguales
    const horas = 2 + i * 13 + (i % 5) * 7;
    return { ...v, fecha: new Date(Date.now() - horas * 3600000).toISOString(), _ejemplo: true };
  });
}

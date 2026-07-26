/* =============================================
   PRESENCIA EN TIEMPO REAL — Joyería Aravena
   Registra visitantes activos en Supabase para
   mostrarlos en el panel de admin.
   ============================================= */

(function () {
  const INTERVALO = 30_000;
  const PAGINAS = {
    'index.html':        'Inicio',
    'producto.html':     'Producto',
    'carrito.html':      'Carrito',
    'perfil.html':       'Mi perfil',
    'contacto.html':     'Contacto',
    'categoria.html':    'Categoría',
    'faq.html':          'Preguntas frecuentes',
    'pago-exitoso.html': 'Pago exitoso',
    'pago-fallido.html': 'Pago fallido',
    'pago-pendiente.html':'Pago pendiente',
    'admin.html':        'Admin',
  };

  /* El servidor sirve URLs "limpias" (/carrito) y también las clásicas
     (/carrito.html). Se normaliza a nombre de archivo para que el mapa de
     páginas y las etapas del embudo funcionen igual en ambos casos. */
  let ruta = window.location.pathname.split('/').pop() || 'index.html';
  if (ruta && !ruta.includes('.')) ruta += '.html';
  const pagina  = PAGINAS[ruta] || ruta || 'Inicio';

  /* Etapa del embudo a la que llega esta página. Es lo que se guarda en el
     historial (tabla `visitas`) para poder ver cuánta gente llegó a navegar,
     a armar el carrito y a pagar, por día / semana / mes. */
  const ETAPA_RANGO = { navegando: 1, carrito: 2, pagando: 3 };
  function etapaDeRuta(r) {
    if (r === 'carrito.html')   return 'carrito';
    if (r.startsWith('pago-'))  return 'pagando';   // pago-exitoso/fallido/pendiente
    return 'navegando';
  }
  const etapa = etapaDeRuta(ruta);

  // ID único por pestaña
  let sessionId = sessionStorage.getItem('_presencia_id');
  if (!sessionId) {
    sessionId = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now());
    sessionStorage.setItem('_presencia_id', sessionId);
  }

  // Etapa más profunda ya registrada hoy por esta pestaña (para no repetir
  // ni retroceder: si ya llegó al carrito, volver al inicio no la rebaja)
  const claveEtapa = '_etapa_' + fechaChile();

  async function ping() {
    if (typeof db === 'undefined' || !db) return;
    try {
      await db.from('presencia').upsert(
        { session_id: sessionId, pagina, updated_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
    } catch (_) {}
  }

  async function registrarVisita() {
    if (typeof db === 'undefined' || !db) return;

    /* Se escribe una fila por sesión y día, guardando la etapa alcanzada.
       Solo se actualiza si esta página es una etapa MÁS profunda que la ya
       anotada: así "navegando → carrito → pagando" avanza pero nunca vuelve
       atrás. Cada pestaña tiene su propio session_id, así que no se pisan. */
    const anotada = sessionStorage.getItem(claveEtapa);
    if (anotada && ETAPA_RANGO[etapa] <= ETAPA_RANGO[anotada]) return;

    try {
      await db.from('visitas').upsert(
        { session_id: sessionId, fecha: fechaChile(), pagina: etapa },
        { onConflict: 'session_id,fecha' }
      );
      sessionStorage.setItem(claveEtapa, etapa);
    } catch (_) {}
  }

  async function salir() {
    if (typeof db === 'undefined' || !db) return;
    try {
      await db.from('presencia').delete().eq('session_id', sessionId);
    } catch (_) {}
  }

  async function limpiarViejos() {
    if (typeof db === 'undefined' || !db) return;
    try {
      const hace2min = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await db.from('presencia').delete().lt('updated_at', hace2min);
    } catch (_) {}
  }

  function iniciar() {
    if (typeof db === 'undefined' || !db) { setTimeout(iniciar, 500); return; }
    limpiarViejos();
    ping();
    registrarVisita();
    setInterval(ping, INTERVALO);
    window.addEventListener('beforeunload', salir);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') ping();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();

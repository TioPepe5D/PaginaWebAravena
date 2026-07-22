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
    'pago-exitoso.html': 'Pago exitoso',
    'pago-fallido.html': 'Pago fallido',
    'pago-pendiente.html':'Pago pendiente',
    'admin.html':        'Admin',
  };

  const ruta    = window.location.pathname.split('/').pop() || 'index.html';
  const pagina  = PAGINAS[ruta] || ruta || 'Inicio';

  // ID único por pestaña
  let sessionId = sessionStorage.getItem('_presencia_id');
  if (!sessionId) {
    sessionId = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now());
    sessionStorage.setItem('_presencia_id', sessionId);
  }

  // Marcar que ya registramos la visita hoy (para no duplicar)
  const claveVisita = '_visita_' + new Date().toISOString().slice(0, 10);
  const visitaYaRegistrada = sessionStorage.getItem(claveVisita);

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
    if (visitaYaRegistrada) return; // ya contada hoy
    try {
      await db.from('visitas').upsert(
        { session_id: sessionId, fecha: new Date().toISOString().slice(0, 10), pagina },
        { onConflict: 'session_id,fecha' }
      );
      sessionStorage.setItem(claveVisita, '1');
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

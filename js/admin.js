/* ═══════════════════════════════════════════════════════════
   PANEL DE ADMINISTRACIÓN — Joyería Aravena
   ═══════════════════════════════════════════════════════════ */

// Emails con permisos de admin
const ADMIN_EMAILS = [
  'diegoaravenavera@gmail.com',
  'martinmagun2@gmail.com'
];

/* Estados que representan una venta real: el pago ya fue confirmado.
   Todo lo demás (pendiente de pago, fallido, papelera) queda fuera de
   la vista por defecto. */
const ESTADOS_CONFIRMADOS = ['pagado', 'enviado'];

let todosLosPedidos = [];
let pedidoActual = null;
let pedidosFiltrados = [];
let emailsUsuarios = {};      // { user_id: email }
let graficoVentas = null;
// (el período del gráfico ahora lo define rangoActivo)
let primeraCarga = true;
let idsConocidos = new Set();
let realtimeSub = null;

/* ── Inicialización ──────────────────────── */
document.addEventListener('DOMContentLoaded', inicializar);

async function inicializar() {
  if (typeof db === 'undefined' || !db) {
    mostrarDenegado('No se pudo conectar con la base de datos.');
    return;
  }

  try {
    const { data: { session } } = await db.auth.getSession();

    if (!session) {
      window.location.href = 'index.html';
      return;
    }

    const email = session.user.email;

    if (!ADMIN_EMAILS.includes(email)) {
      mostrarDenegado();
      return;
    }

    // Mostrar email en header
    const emailEl = document.getElementById('admin-email');
    if (emailEl) emailEl.textContent = email;

    // Mostrar panel
    document.getElementById('admin-loader').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';

    // Cargar datos
    await cargarPedidos();

    // Listeners
    configurarEventos();

    // Suscripción realtime para nuevos pedidos
    suscribirseANuevosPedidos();

    // Analíticas: visitantes en tiempo real
    iniciarPresenciaRealtime();
    cargarUsuariosActivos();

  } catch (e) {
    console.error('[Admin] Error inicial:', e);
    mostrarDenegado('Error al verificar permisos.');
  }
}

function mostrarDenegado(mensaje) {
  document.getElementById('admin-loader').style.display = 'none';
  const denied = document.getElementById('admin-denied');
  denied.style.display = 'block';
  if (mensaje) {
    const p = denied.querySelector('p');
    if (p) p.textContent = mensaje;
  }
}

/* ══════════════════════════════════════════════════════════
   SINCRONIZACIÓN DE IMÁGENES DESDE GOOGLE DRIVE
   ══════════════════════════════════════════════════════════ */

let driveArchivos = []; // archivos cargados desde Drive

let _eventosListos = false;

function configurarEventos() {
  /* Si esta función corriera dos veces, cada botón quedaría con dos
     listeners: el menú se abriría y cerraría en el mismo clic. */
  if (_eventosListos) return;
  _eventosListos = true;

  document.getElementById('btn-logout-admin').addEventListener('click', async () => {
    if (realtimeSub) await db.removeChannel(realtimeSub);
    await db.auth.signOut();
    window.location.href = 'index.html';
  });

  document.getElementById('btn-refrescar').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.classList.add('cargando');
    await cargarPedidos();
    setTimeout(() => btn.classList.remove('cargando'), 400);
  });

  document.getElementById('filtro-busqueda').addEventListener('input', aplicarFiltros);
  document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);

  // Rango de fechas: mueve el resumen y el gráfico a la vez
  document.getElementById('rango-botones')?.addEventListener('click', e => {
    const btn = e.target.closest('.rango-btn');
    if (!btn) return;
    rangoActivo = btn.dataset.rango;
    rangoDesde = rangoHasta = null;            // manda el botón, no las fechas
    document.getElementById('rango-desde').value = '';
    document.getElementById('rango-hasta').value = '';
    document.querySelectorAll('.rango-btn').forEach(b => b.classList.toggle('activo', b === btn));
    calcularStats();
    renderizarGrafico();
  });

  // Fechas a mano: solo aplican cuando ambas están completas
  ['rango-desde', 'rango-hasta'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const d = document.getElementById('rango-desde').value;
      const h = document.getElementById('rango-hasta').value;
      if (!d || !h) return;
      rangoDesde = new Date(d + 'T00:00:00');
      rangoHasta = new Date(h + 'T00:00:00');
      // Si vienen al revés, se ordenan solas
      if (rangoDesde > rangoHasta) [rangoDesde, rangoHasta] = [rangoHasta, rangoDesde];
      document.querySelectorAll('.rango-btn').forEach(b => b.classList.remove('activo'));
      calcularStats();
      renderizarGrafico();
    });
  });

  // Modal detalle
  document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
  document.getElementById('modal-overlay').addEventListener('click', cerrarModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrarModal(); cerrarAdminConfirm(); }
  });

  // Modal confirmar eliminar pedido
  document.getElementById('admin-confirm-si').addEventListener('click', confirmarEliminarPedido);
  document.getElementById('admin-confirm-no').addEventListener('click', cerrarAdminConfirm);
  document.getElementById('admin-confirm-overlay').addEventListener('click', e => {
    if (e.target.id === 'admin-confirm-overlay') cerrarAdminConfirm();
  });

  // Pestañas: pedidos (trabajo diario) vs. ventas y visitas
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => {
        const activa = t === tab;
        t.classList.toggle('activo', activa);
        t.setAttribute('aria-selected', activa ? 'true' : 'false');
      });
      document.querySelectorAll('.admin-tabpanel').forEach(p => {
        p.hidden = p.id !== tab.dataset.panel;
      });
      // El gráfico se dibuja al mostrarse: en un panel oculto mide 0px
      if (tab.dataset.panel === 'panel-metricas') renderizarGrafico();
    });
  });

  // Chips de estado: filtran y muestran el conteo
  document.getElementById('estado-chips')?.addEventListener('click', e => {
    const chip = e.target.closest('.estado-chip');
    if (!chip) return;
    document.getElementById('filtro-estado').value = chip.dataset.estado;
    aplicarFiltros();
  });
}

/* ── Cargar pedidos ──────────────────────── */
async function cargarPedidos() {
  try {
    // Intentar usar la RPC que trae pedidos + email
    let { data, error } = await db.rpc('admin_pedidos_con_email');

    // Fallback: si la RPC no existe, traer solo pedidos
    if (error) {
      console.warn('[Admin] RPC no disponible, usando fallback:', error.message);
      const res = await db
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('[Admin] Error cargando pedidos:', error);
      document.getElementById('tabla-pedidos').innerHTML =
        `<tr><td colspan="6" class="tabla-vacia">Error: ${error.message}</td></tr>`;
      return;
    }

    todosLosPedidos = (data || []).sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    /* Indexar emails SOLO de pedidos con usuario. Sin el guard, los
       pedidos de invitado (user_id undefined) compartían la misma clave
       y todos terminaban mostrando el correo del último invitado. */
    todosLosPedidos.forEach(p => {
      if (p.email && p.user_id) emailsUsuarios[p.user_id] = p.email;
    });

    // Guardar IDs conocidos (primera carga)
    if (primeraCarga) {
      todosLosPedidos.forEach(p => idsConocidos.add(p.id));
      primeraCarga = false;
    }

    calcularStats();
    aplicarFiltros();
    renderizarGrafico();

  } catch (e) {
    console.error('[Admin] Error:', e);
  }
}

/* ── Rango de fechas: manda sobre el resumen y sobre el gráfico ── */
const RANGOS = {
  hoy:  { dias: 1,  etiqueta: 'hoy' },
  '7':  { dias: 7,  etiqueta: 'últimos 7 días' },
  '30': { dias: 30, etiqueta: 'últimos 30 días' },
  mes:  { dias: null, etiqueta: 'este mes' },
  todo: { dias: null, etiqueta: 'todo el historial' },
};
let rangoActivo = '30';
let rangoDesde = null;   // se llenan solo al elegir fechas a mano
let rangoHasta = null;

function inicioDelDia(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function finDelDia(d)    { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }

function rangoFechas() {
  const hoy = new Date();
  if (rangoDesde && rangoHasta) {
    const f = d => d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
    return { desde: inicioDelDia(rangoDesde), hasta: finDelDia(rangoHasta),
             etiqueta: `${f(rangoDesde)} a ${f(rangoHasta)}` };
  }
  const cfg = RANGOS[rangoActivo] || RANGOS['30'];
  if (rangoActivo === 'todo') {
    return { desde: new Date(2000, 0, 1), hasta: finDelDia(hoy), etiqueta: cfg.etiqueta };
  }
  if (rangoActivo === 'mes') {
    return { desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1), hasta: finDelDia(hoy), etiqueta: cfg.etiqueta };
  }
  const desde = inicioDelDia(hoy);
  desde.setDate(desde.getDate() - (cfg.dias - 1));
  return { desde, hasta: finDelDia(hoy), etiqueta: cfg.etiqueta };
}

/* Ventas con pago confirmado dentro del rango elegido */
function ventasDelRango() {
  const { desde, hasta } = rangoFechas();
  return todosLosPedidos.filter(p => {
    if (!ESTADOS_CONFIRMADOS.includes(p.estado)) return false;
    const f = new Date(p.created_at);
    return f >= desde && f <= hasta;
  });
}

/* ── Resumen de ventas del período ───────── */
function calcularStats() {
  const ventas = ventasDelRango();
  const { etiqueta } = rangoFechas();
  const monto = ventas.reduce((s, p) => s + (Number(p.total) || 0), 0);
  const ticket = ventas.length ? Math.round(monto / ventas.length) : 0;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('res-monto', '$' + monto.toLocaleString('es-CL'));
  set('res-ticket', '$' + ticket.toLocaleString('es-CL'));
  set('res-rango', etiqueta);
  animarContador('res-cantidad', ventas.length);

  // Día con más ingresos dentro del período
  const porDia = {};
  ventas.forEach(p => {
    const k = new Date(p.created_at).toLocaleDateString('es-CL');
    porDia[k] = (porDia[k] || 0) + (Number(p.total) || 0);
  });
  const mejor = Object.entries(porDia).sort((a, b) => b[1] - a[1])[0];
  set('res-mejor', mejor ? mejor[0].slice(0, 5) : '—');
  set('res-mejor-sub', mejor ? '$' + mejor[1].toLocaleString('es-CL') : 'sin ventas en el período');

  const sub = document.getElementById('chart-subtitulo');
  if (sub) sub.textContent = 'Ingresos · ' + etiqueta;
}

function animarContador(id, valorFinal) {
  const el = document.getElementById(id);
  if (!el) return;
  const valorActual = parseInt(el.textContent, 10) || 0;
  if (valorActual === valorFinal) return;

  const duracion = 600;
  const pasos = 20;
  const incremento = (valorFinal - valorActual) / pasos;
  let paso = 0;

  const interval = setInterval(() => {
    paso++;
    const v = Math.round(valorActual + incremento * paso);
    el.textContent = v;
    if (paso >= pasos) {
      el.textContent = valorFinal;
      clearInterval(interval);
    }
  }, duracion / pasos);
}

/* ── Filtros ─────────────────────────────── */
function aplicarFiltros() {
  const busqueda = document.getElementById('filtro-busqueda').value.trim().toLowerCase();
  const estado = document.getElementById('filtro-estado').value;

  pedidosFiltrados = todosLosPedidos.filter(p => {
    /* La vista por defecto muestra solo ventas con el pago confirmado.
       Un pedido "pendiente" se crea ANTES de ir a la pasarela: si el
       cliente no completa el pago, queda ahí para siempre y no es una
       venta. Se sigue pudiendo revisar eligiendo el estado a mano. */
    if (estado === 'todos' && !ESTADOS_CONFIRMADOS.includes(p.estado)) return false;
    if (estado !== 'todos' && p.estado !== estado) return false;

    if (busqueda) {
      const d = p.datos_envio || {};
      // Se busca en todo lo que sirve para ubicar un pedido a mano
      const heno = [
        p.id, p.user_id, p.email, emailsUsuarios[p.user_id],
        d.nombre, d.correo, d.telefono, d.rut,
        d.comuna, d.ciudad, d.region, d.domicilio, d.sucursal, d.empresa
      ].filter(Boolean).join(' ').toLowerCase();
      if (!heno.includes(busqueda)) return false;
    }

    return true;
  });

  actualizarChipsEstado();
  marcarPosiblesDuplicados();
  renderizarTabla();
}

/* Marca ventas que parecen la misma compra cobrada dos veces: mismo
   cliente, mismo monto y con poco rato de diferencia. Solo avisa; borrar
   queda en manos de quien revisa. */
const MINUTOS_DUPLICADO = 60;

function marcarPosiblesDuplicados() {
  const ventas = todosLosPedidos.filter(p => ESTADOS_CONFIRMADOS.includes(p.estado));
  todosLosPedidos.forEach(p => { p._duplicado = false; });

  ventas.forEach((a, i) => {
    ventas.slice(i + 1).forEach(b => {
      if (Number(a.total) !== Number(b.total)) return;
      const mismoCliente =
        (a.user_id && a.user_id === b.user_id) ||
        (a.datos_envio?.correo && a.datos_envio.correo === b.datos_envio?.correo) ||
        (a.datos_envio?.telefono && a.datos_envio.telefono === b.datos_envio?.telefono);
      if (!mismoCliente) return;
      const minutos = Math.abs(new Date(a.created_at) - new Date(b.created_at)) / 60000;
      if (minutos <= MINUTOS_DUPLICADO) { a._duplicado = true; b._duplicado = true; }
    });
  });
}

/* Conteo por estado en los chips y en la pestaña de pedidos */
function actualizarChipsEstado() {
  const cuenta = {};
  todosLosPedidos.forEach(p => { cuenta[p.estado] = (cuenta[p.estado] || 0) + 1; });
  // "Ventas" = solo lo que tiene el pago confirmado
  cuenta.todos = todosLosPedidos.filter(p => ESTADOS_CONFIRMADOS.includes(p.estado)).length;

  const activo = document.getElementById('filtro-estado')?.value || 'todos';
  document.querySelectorAll('.estado-chip').forEach(chip => {
    const est = chip.dataset.estado;
    const n = cuenta[est] || 0;
    chip.querySelector('span').textContent = n;
    chip.classList.toggle('activo', est === activo);
    // Los estados sin pedidos se atenúan, pero siguen disponibles
    chip.classList.toggle('vacio', n === 0 && est !== 'todos');
  });

  // Badge de la pestaña: pedidos pagados que aún hay que despachar
  const porAtender = cuenta.pagado || 0;
  const badge = document.getElementById('tab-badge-pedidos');
  if (badge) {
    badge.textContent = porAtender;
    badge.classList.toggle('con-pendientes', porAtender > 0);
  }
}

/* ── Render tabla ────────────────────────── */
function renderizarTabla() {
  const tbody = document.getElementById('tabla-pedidos');

  if (pedidosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="tabla-vacia">No hay pedidos que coincidan con los filtros.</td></tr>';
    return;
  }

  tbody.innerHTML = pedidosFiltrados.map(p => {
    const idCorto = String(p.id).slice(0, 8);
    // Fecha compacta: el año solo aparece si el pedido no es de este año
    const _d = new Date(p.created_at);
    const _esteAno = _d.getFullYear() === new Date().getFullYear();
    const fecha = _d.toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', ...(_esteAno ? {} : { year: '2-digit' }),
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    const email = p.email || (p.user_id ? emailsUsuarios[p.user_id] : '') || '';
    const clienteId = String(p.user_id || '').slice(0, 8);
    const items = Array.isArray(p.items) ? p.items : [];
    // Los regalos por monto no se cuentan como productos vendidos, pero
    // hay que despacharlos igual: se muestran aparte.
    const productos = items.filter(i => !i.regalo);
    const regalos = items.filter(i => i.regalo);
    const itemsCount = productos.reduce((s, i) => s + (i.cantidad || 1), 0);
    const regalosHtml = regalos.length
      ? `<span class="td-regalos" title="${regalos.map(r => r.nombre).join(' · ')}">🎁 +${regalos.length} regalo${regalos.length > 1 ? 's' : ''}</span>`
      : '';
    const total = Number(p.total) || 0;

    const acciones = [];
    if (p.estado === 'eliminado') {
      acciones.push(`<button class="btn-accion btn-accion-restaurar" onclick="restaurarPedido('${p.id}')" title="Restaurar pedido">↩ Restaurar</button>`);
      acciones.push(`<button class="btn-accion btn-accion-eliminar" onclick="eliminarPedidoDefinitivo('${p.id}')" title="Borrar definitivamente">🗑 Borrar</button>`);
    } else {
      if (p.estado === 'pagado') {
        acciones.push(`<button class="btn-accion btn-accion-enviar" onclick="cambiarEstado('${p.id}', 'enviado')" title="Marcar como despachado">📦 Marcar enviado</button>`);
      } else if (p.estado !== 'enviado') {
        acciones.push(`<button class="btn-accion btn-accion-pagar" onclick="cambiarEstado('${p.id}', 'pagado')">Marcar pagado</button>`);
      }
      if (p.datos_envio) {
        acciones.push(`<button class="btn-accion btn-accion-copiar" onclick="copiarDatosEnvio('${p.id}', this)" title="Copiar los datos para la empresa de envío">📋 Copiar</button>`);
      }
      acciones.push(`<button class="btn-accion" onclick="verDetalle('${p.id}')">Ver</button>`);
      // Con etiqueta: como icono suelto era difícil de encontrar y de acertar
      acciones.push(`<button class="btn-accion btn-accion-eliminar" onclick="eliminarPedido('${p.id}')" title="Quitar este pedido de la lista">🗑 Eliminar</button>`);
    }

    // Intentar mostrar nombre de datos_envio si es pedido de invitado
    const envioNombre = p.datos_envio?.nombre || '';
    const envioEmail  = p.datos_envio?.correo  || '';
    const displayEmail = email || envioEmail || '';
    const tieneUsuario = !!p.user_id;

    let clienteHtml;
    if (displayEmail) {
      clienteHtml = `<span class="td-cliente-email" title="${displayEmail}">${displayEmail}</span><span class="td-cliente-id">${envioNombre || clienteId + '…'}</span>`;
    } else if (tieneUsuario) {
      // Usuario con sesión pero email no disponible (RPC no retornó email)
      clienteHtml = `<span class="td-cliente-email" style="color:var(--color-texto-suave)">Usuario registrado</span><span class="td-cliente-id">${clienteId}…</span>`;
    } else {
      // Pedido de invitado sin sesión
      clienteHtml = `<span class="td-cliente-email">${envioNombre || 'Invitado'}</span><span class="td-cliente-id" style="color:var(--color-texto-suave)">sin sesión</span>`;
    }

    // Columna datos de envío
    const de = p.datos_envio || null;
    let envioHtml;
    if (de) {
      // La ubicación se arma de lo más específico a lo más general
      const lugar = [de.comuna, de.ciudad, de.region].filter(Boolean).join(', ');
      // Empresa y tipo de entrega van juntos: al despachar se leen de una
      const esSucursal = de.preferencia === 'Sucursal';
      const entrega = de.preferencia
        ? `<span class="td-envio-pref">${esSucursal ? '🏪' : '🏠'} ${de.preferencia}</span>` : '';
      const empresa = (de.empresa || entrega)
        ? `<span class="td-envio-cab">${de.empresa ? `<span class="td-envio-empresa">${de.empresa}</span>` : ''}${entrega}</span>` : '';
      const nombre    = de.nombre     ? `<span class="td-envio-linea">${de.nombre}</span>` : '';
      const tel       = de.telefono   ? `<a class="td-envio-linea td-envio-tel" href="https://wa.me/${String(de.telefono).replace(/\D/g,'')}" target="_blank" rel="noopener" title="Escribir por WhatsApp">📞 ${de.telefono}</a>` : '';
      const ubic      = lugar         ? `<span class="td-envio-linea">📍 ${lugar}</span>` : '';
      // Se muestra el dato que corresponde: sucursal o dirección
      const destino = esSucursal
        ? (de.sucursal  ? `<span class="td-envio-domicilio">🏪 ${de.sucursal}</span>` : '')
        : (de.domicilio ? `<span class="td-envio-domicilio">🏠 ${de.domicilio}</span>` : '');
      envioHtml = `<div class="td-envio">${empresa}${nombre}${tel}${ubic}${destino}</div>`;
    } else {
      envioHtml = `<span class="td-envio-vacio">—</span>`;
    }

    return `
      <tr data-id="${p.id}"${p._duplicado ? ' class="fila-duplicada"' : ''}>
        <td class="td-pedido" data-label="Pedido">
          <span class="td-id">#${idCorto}</span>
          ${p._duplicado ? '<span class="aviso-duplicado" title="Mismo cliente y monto que otro pedido cercano. Revisa si es una compra repetida.">⚠ Posible duplicado</span>' : ''}
          <span class="td-fecha-label">Fecha</span>
          <span class="td-fecha">${fecha}</span>
        </td>
        <td class="td-cliente" data-label="Cliente">${clienteHtml}</td>
        <td class="td-envio-col" data-label="Envío">${envioHtml}</td>
        <td class="td-total" data-label="Total">$${total.toLocaleString('es-CL')}${regalosHtml}</td>
        <td data-label="Estado"><span class="estado-badge estado-${p.estado}">${p.estado}</span></td>
        <td><div class="tabla-acciones">${acciones.join('')}</div></td>
      </tr>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   COPIAR DATOS DE ENVÍO
   Sale en el orden en que se llenan en Starken, una línea por dato,
   para pegarlo de corrido sin tener que reordenar nada.
   ══════════════════════════════════════════════════════════ */
function textoEnvioPedido(pedido) {
  const d = pedido.datos_envio || {};
  const esSucursal = d.preferencia === 'Sucursal';

  const lineas = [
    [d.empresa, d.preferencia].filter(Boolean).join(' | '),
    d.nombre,
    d.telefono,
    d.rut,
    [d.ciudad, d.comuna].filter(Boolean).join(', '),
    d.correo,
    esSucursal ? d.sucursal : d.domicilio,
  ];

  // Se omiten los datos que el cliente no llenó (el RUT es opcional)
  return lineas.filter(l => l && String(l).trim()).join('\n');
}

async function copiarDatosEnvio(pedidoId, boton) {
  const pedido = todosLosPedidos.find(p => String(p.id) === String(pedidoId));
  if (!pedido) return;
  const texto = textoEnvioPedido(pedido);
  if (!texto) { mostrarToast('Sin datos', 'Este pedido no tiene datos de envío.', 'info'); return; }

  const marcar = ok => {
    const original = boton.dataset.original || boton.innerHTML;
    boton.dataset.original = original;
    boton.innerHTML = ok ? '✓ Copiado' : '⚠ Error';
    boton.classList.toggle('copiado', ok);
    setTimeout(() => { boton.innerHTML = original; boton.classList.remove('copiado'); }, 1800);
  };

  try {
    await navigator.clipboard.writeText(texto);
    marcar(true);
  } catch (_) {
    // Sin permiso de portapapeles: se copia con un campo temporal
    try {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      marcar(document.execCommand('copy'));
      ta.remove();
    } catch (__) { marcar(false); }
  }
}

/* ── Cambiar estado ──────────────────────── */
/* El cambio de estado se aplica al instante, sin diálogo de confirmación:
   es la acción más repetida del día. Si fue un clic equivocado, el aviso
   trae "Deshacer" y devuelve el pedido a su estado anterior. */
async function cambiarEstado(pedidoId, nuevoEstado, silencioso) {
  const pedido = todosLosPedidos.find(p => String(p.id) === String(pedidoId));
  const estadoPrevio = pedido ? pedido.estado : null;

  // Se pinta de inmediato y se corrige si el servidor rechaza
  if (pedido) pedido.estado = nuevoEstado;
  calcularStats();
  aplicarFiltros();

  try {
    /* Con .select() se confirma que la fila cambió. Sin él, un update que
       no toca ninguna fila no devuelve error y el panel mostraría un
       cambio que la base nunca guardó. */
    const { data, error } = await db
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId)
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('La base no registró el cambio. Revisa los permisos del pedido.');
    }

    renderizarGrafico();

    if (!silencioso) {
      mostrarToast(
        'Pedido actualizado',
        `Marcado como ${nuevoEstado}`,
        'ok',
        estadoPrevio && estadoPrevio !== nuevoEstado
          ? { texto: 'Deshacer', accion: () => cambiarEstado(pedidoId, estadoPrevio, true) }
          : null
      );
    }

  } catch (e) {
    console.error('[Admin] Error cambiando estado:', e);
    // Vuelve atrás: el pedido no cambió en la base
    if (pedido && estadoPrevio) pedido.estado = estadoPrevio;
    calcularStats();
    aplicarFiltros();
    mostrarToast('No se pudo actualizar', e.message || 'Revisa tu conexión', 'error');
  }
}
window.cambiarEstado = cambiarEstado;

/* ── Eliminar pedido (con modal de confirmación) ──────── */
let _pedidoAEliminar = null;
let _bulkAEliminar   = null;
let _hardDelete      = false;

function eliminarPedido(pedidoId) {
  const pedido = todosLosPedidos.find(p => String(p.id) === String(pedidoId));
  const idCorto = String(pedidoId).slice(0, 8).toUpperCase();
  const estado  = pedido?.estado || '';
  const total   = pedido?.total ? `$${Number(pedido.total).toLocaleString('es-CL')}` : '';

  _pedidoAEliminar = pedidoId;
  _bulkAEliminar   = null;
  document.querySelector('.admin-confirm-titulo').textContent = '¿Eliminar pedido?';
  document.getElementById('admin-confirm-detalle').textContent =
    `Pedido #${idCorto} · ${estado}${total ? ' · ' + total : ''}`;
  document.getElementById('admin-confirm-overlay').classList.add('activo');
}
window.eliminarPedido = eliminarPedido;

function pedirEliminarFallidos() {
  const fallidos = todosLosPedidos.filter(p => p.estado === 'fallido');
  if (fallidos.length === 0) {
    mostrarToast('Sin pedidos', 'No hay pedidos fallidos para eliminar.', 'ok');
    return;
  }
  _pedidoAEliminar = null;
  _bulkAEliminar   = 'fallido';
  document.querySelector('.admin-confirm-titulo').textContent = '¿Eliminar pedidos fallidos?';
  document.getElementById('admin-confirm-detalle').textContent =
    `Se eliminarán ${fallidos.length} pedido(s) con estado fallido.`;
  document.getElementById('admin-confirm-overlay').classList.add('activo');
}
window.pedirEliminarFallidos = pedirEliminarFallidos;

function cerrarAdminConfirm() {
  _pedidoAEliminar = null;
  _bulkAEliminar   = null;
  _hardDelete      = false;
  document.getElementById('admin-confirm-overlay').classList.remove('activo');
}

async function confirmarEliminarPedido() {
  const pedidoId = _pedidoAEliminar;
  const bulk     = _bulkAEliminar;
  if (!pedidoId && !bulk) return;
  cerrarAdminConfirm();

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      mostrarToast('Error', 'Sesión expirada. Recarga la página.', 'error');
      return;
    }

    const body = bulk
      ? { byStatus: bulk, adminToken: session.access_token, hardDelete: _hardDelete }
      : { pedidoId,       adminToken: session.access_token, hardDelete: _hardDelete };

    const res = await fetch('/api/admin-delete-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      mostrarToast('Error', data.error || 'No se pudo eliminar', 'error');
      return;
    }

    if (bulk) {
      const count = data.deleted ?? 0;
      mostrarToast(_hardDelete ? 'Pedidos borrados' : 'Pedidos eliminados',
        `${count} pedido(s)`, 'ok');
    } else {
      const idCorto = String(pedidoId).slice(0, 8).toUpperCase();
      if (_hardDelete) {
        mostrarToast('Pedido borrado', `#${idCorto} borrado definitivamente`, 'ok');
      } else {
        const pedido = todosLosPedidos.find(p => String(p.id) === String(pedidoId));
        if (pedido) _estadoAntesDeEliminar[pedidoId] = pedido.estado;   // para poder deshacer
        /* Ya no existe la vista "Eliminados", así que la única forma de
           recuperarlo es aquí mismo: el aviso trae Deshacer. */
        mostrarToast('Pedido eliminado', `#${idCorto} salió de la lista`, 'ok',
          { texto: 'Deshacer', accion: () => restaurarPedido(pedidoId) });
      }
    }

    /* Se relee desde la base en vez de dar por hecho el cambio: así lo que
       se ve es lo que quedó guardado y "Refrescar" no puede contradecirlo. */
    await cargarPedidos();

  } catch (e) {
    console.error('[Admin] Error eliminando:', e);
    mostrarToast('Error', 'Error inesperado al eliminar.', 'error');
  }
}

/* ── Restaurar pedido ────────────────────── */
/* Al eliminar se guarda el estado que tenía, para que deshacer lo devuelva
   a como estaba. Antes lo restauraba siempre como "pendiente" y, con los
   pendientes ocultos, el pedido desaparecía igual. */
const _estadoAntesDeEliminar = {};

async function restaurarPedido(pedidoId) {
  const previo = _estadoAntesDeEliminar[pedidoId] || 'pagado';
  try {
    const { data, error } = await db.from('pedidos')
      .update({ estado: previo }).eq('id', pedidoId).select('id');
    if (error) { mostrarToast('Error', error.message, 'error'); return; }
    if (!data || data.length === 0) {
      mostrarToast('No se pudo restaurar', 'La base no registró el cambio.', 'error');
      return;
    }
    delete _estadoAntesDeEliminar[pedidoId];
    // Se relee para que la lista refleje lo guardado, no lo supuesto
    await cargarPedidos();
    mostrarToast('Pedido restaurado', `#${String(pedidoId).slice(0,8).toUpperCase()} vuelve a la lista`, 'ok');
  } catch (e) {
    mostrarToast('Error', 'No se pudo restaurar.', 'error');
  }
}
window.restaurarPedido = restaurarPedido;

/* ── Borrar definitivamente (desde papelera) ── */
function eliminarPedidoDefinitivo(pedidoId) {
  const idCorto = String(pedidoId).slice(0, 8).toUpperCase();
  _pedidoAEliminar = pedidoId;
  _bulkAEliminar   = null;
  _hardDelete      = true;
  document.querySelector('.admin-confirm-titulo').textContent = '¿Borrar definitivamente?';
  document.getElementById('admin-confirm-detalle').textContent =
    `Pedido #${idCorto} — Esta acción es irreversible.`;
  document.getElementById('admin-confirm-overlay').classList.add('activo');
}
window.eliminarPedidoDefinitivo = eliminarPedidoDefinitivo;

function pedirVaciarPapelera() {
  const eliminados = todosLosPedidos.filter(p => p.estado === 'eliminado');
  if (eliminados.length === 0) {
    mostrarToast('Papelera vacía', 'No hay pedidos en la papelera.', 'info');
    return;
  }
  _pedidoAEliminar = null;
  _bulkAEliminar   = 'eliminado';
  _hardDelete      = true;
  document.querySelector('.admin-confirm-titulo').textContent = '¿Vaciar papelera?';
  document.getElementById('admin-confirm-detalle').textContent =
    `Se borrarán definitivamente ${eliminados.length} pedido(s). Acción irreversible.`;
  document.getElementById('admin-confirm-overlay').classList.add('activo');
}

/* ── Ver detalle (modal) ─────────────────── */
function verDetalle(pedidoId) {
  // Comparar como strings para evitar fallo con IDs numéricos vs string
  const pedido = todosLosPedidos.find(p => String(p.id) === String(pedidoId));
  if (!pedido) return;
  pedidoActual = pedido;

  const fecha = new Date(pedido.created_at).toLocaleString('es-CL');
  const items = Array.isArray(pedido.items) ? pedido.items : [];
  const total = Number(pedido.total) || 0;
  const email = pedido.email || emailsUsuarios[pedido.user_id] || '—';

  const itemsHtml = items.map(i => {
    const subtotal = Number(i.precio) * Number(i.cantidad);
    const img = i.imagen || `https://placehold.co/80x80/E8E8E8/A8A8A8?text=${encodeURIComponent(i.nombre || 'Producto')}`;
    return `
    <div class="modal-item">
      <div class="modal-item-img-wrap">
        <img src="${img}" alt="${i.nombre}" onerror="this.src='https://placehold.co/80x80/E8E8E8/A8A8A8?text=Imagen'">
      </div>
      <div class="modal-item-info">
        <p class="modal-item-nombre">${i.nombre}</p>
        <p class="modal-item-detalle">${i.categoria ? i.categoria + ' · ' : ''}$${Number(i.precio).toLocaleString('es-CL')} c/u</p>
        <div class="modal-item-cant">
          <span class="modal-cant-badge">×${i.cantidad}</span>
        </div>
      </div>
      <div class="modal-item-subtotal">
        <span>$${subtotal.toLocaleString('es-CL')}</span>
        <small>CLP</small>
      </div>
    </div>`;
  }).join('');

  // Datos de envío (si existen)
  const de = pedido.datos_envio || null;
  const datosEnvioHtml = de ? `
    <div class="modal-envio-section">
      <div class="modal-envio-header">
        <h3>🚚 Datos de envío</h3>
        <button class="btn-copiar-envio" onclick="copiarDatosEnvio()" title="Copiar datos de envío">
          📋 Copiar
        </button>
      </div>
      <div class="modal-info-grid">
        ${de.nombre    ? `<div class="modal-info-bloque"><p class="modal-info-label">Nombre</p><p class="modal-info-valor">${de.nombre}</p></div>` : ''}
        ${de.correo    ? `<div class="modal-info-bloque"><p class="modal-info-label">Correo</p><p class="modal-info-valor">${de.correo}</p></div>` : ''}
        ${de.telefono  ? `<div class="modal-info-bloque"><p class="modal-info-label">Teléfono</p><p class="modal-info-valor">${de.telefono}</p></div>` : ''}
        ${de.rut       ? `<div class="modal-info-bloque"><p class="modal-info-label">RUT</p><p class="modal-info-valor">${de.rut}</p></div>` : ''}
        ${de.ciudad    ? `<div class="modal-info-bloque"><p class="modal-info-label">Ciudad</p><p class="modal-info-valor">${de.ciudad}</p></div>` : ''}
        ${de.empresa   ? `<div class="modal-info-bloque"><p class="modal-info-label">Empresa envío</p><p class="modal-info-valor">${de.empresa}</p></div>` : ''}
        ${de.preferencia ? `<div class="modal-info-bloque"><p class="modal-info-label">Preferencia</p><p class="modal-info-valor">${de.preferencia}</p></div>` : ''}
        ${de.sucursal  ? `<div class="modal-info-bloque"><p class="modal-info-label">Sucursal</p><p class="modal-info-valor">${de.sucursal}</p></div>` : ''}
        ${de.domicilio ? `<div class="modal-info-bloque modal-info-full"><p class="modal-info-label">Domicilio</p><p class="modal-info-valor">${de.domicilio}</p></div>` : ''}
      </div>
    </div>` : '';

  document.getElementById('modal-body').innerHTML = `
    <!-- Info del pedido -->
    <div class="modal-info-grid">
      <div class="modal-info-bloque">
        <p class="modal-info-label">ID pedido</p>
        <p class="modal-info-valor mono">${String(pedido.id).slice(0, 18)}${String(pedido.id).length > 18 ? '…' : ''}</p>
      </div>
      <div class="modal-info-bloque">
        <p class="modal-info-label">Fecha</p>
        <p class="modal-info-valor">${fecha}</p>
      </div>
      <div class="modal-info-bloque">
        <p class="modal-info-label">Cliente</p>
        <p class="modal-info-valor">${email !== '—' ? email : (de?.correo || '<span style="color:var(--color-texto-suave)">Invitado</span>')}</p>
      </div>
      <div class="modal-info-bloque">
        <p class="modal-info-label">Estado</p>
        <p class="modal-info-valor"><span class="estado-badge estado-${pedido.estado}">${pedido.estado}</span></p>
      </div>
      <div class="modal-info-bloque">
        <p class="modal-info-label">Método de pago</p>
        <p class="modal-info-valor">
          ${pedido.mp_payment_id
            ? '💳 MercadoPago'
            : pedido.estado === 'enviado' || pedido.estado === 'pagado'
              ? '✓ Pagado'
              : '—'}
        </p>
      </div>
      ${pedido.mp_payment_id ? `
      <div class="modal-info-bloque">
        <p class="modal-info-label">MercadoPago ID</p>
        <p class="modal-info-valor mono">${pedido.mp_payment_id}</p>
      </div>` : ''}
    </div>

    <!-- Datos de envío -->
    ${datosEnvioHtml}

    <!-- Productos -->
    <div class="modal-items">
      <h3>Productos <span class="modal-items-count">${items.length}</span></h3>
      <div class="modal-items-lista">
        ${itemsHtml || '<p style="color:var(--color-texto-suave);padding:1rem 0">Sin productos registrados.</p>'}
      </div>
    </div>

    <!-- Total -->
    <div class="modal-total-row">
      <span class="modal-total-label">Total pagado</span>
      <span class="modal-total-valor">$${total.toLocaleString('es-CL')} <small>CLP</small></span>
    </div>
  `;

  document.getElementById('modal-overlay').classList.add('activo');
  document.getElementById('modal-detalle').classList.add('activo');
}
window.verDetalle = verDetalle;

function cerrarModal() {
  document.getElementById('modal-overlay').classList.remove('activo');
  document.getElementById('modal-detalle').classList.remove('activo');
}

/* ── Copiar datos de envío ──────────────── */
function copiarDatosEnvio() {
  if (!pedidoActual || !pedidoActual.datos_envio) return;

  const d = pedidoActual.datos_envio;
  const texto = [
    d.nombre      ? `Nombre: ${d.nombre}`           : null,
    d.rut         ? `RUT: ${d.rut}`                 : null,
    d.telefono    ? `Teléfono: ${d.telefono}`        : null,
    d.correo      ? `Correo: ${d.correo}`            : null,
    d.empresa     ? `Empresa: ${d.empresa}`          : null,
    d.preferencia ? `Preferencia: ${d.preferencia}` : null,
    d.sucursal    ? `Sucursal: ${d.sucursal}`        : null,
    d.ciudad      ? `Ciudad: ${d.ciudad}`            : null,
    d.domicilio   ? `Dirección: ${d.domicilio}`      : null,
  ].filter(Boolean).join('\n');

  const btn = document.querySelector('.btn-copiar-envio');

  function mostrarCopiado() {
    if (!btn) return;
    btn.textContent = '✅ Copiado';
    btn.classList.add('copiado');
    setTimeout(() => {
      btn.textContent = '📋 Copiar';
      btn.classList.remove('copiado');
    }, 2000);
  }

  // Método moderno
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(mostrarCopiado).catch(() => copiarFallback(texto, mostrarCopiado));
  } else {
    copiarFallback(texto, mostrarCopiado);
  }
}

function copiarFallback(texto, callback) {
  const ta = document.createElement('textarea');
  ta.value = texto;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    callback();
  } catch (e) {
    alert('No se pudo copiar automáticamente.\n\n' + texto);
  }
  document.body.removeChild(ta);
}

/* ── Exportar CSV ───────────────────────── */
function exportarCSV() {
  if (pedidosFiltrados.length === 0) {
    mostrarToast('Nada que exportar', 'No hay pedidos en la vista actual.', 'info');
    return;
  }

  const headers = ['ID', 'Fecha', 'Email', 'User ID', 'Estado', 'Items', 'Total', 'MP Payment ID'];

  const escape = (str) => {
    if (str == null) return '';
    const s = String(str).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };

  const rows = pedidosFiltrados.map(p => {
    const items = Array.isArray(p.items) ? p.items : [];
    const itemsStr = items.map(i => `${i.nombre} x${i.cantidad}`).join(' | ');
    const email = p.email || (p.user_id ? emailsUsuarios[p.user_id] : '') || '';
    return [
      p.id,
      new Date(p.created_at).toISOString(),
      email,
      p.user_id || '',
      p.estado,
      itemsStr,
      p.total || 0,
      p.mp_payment_id || ''
    ].map(escape).join(',');
  });

  // BOM para que Excel detecte UTF-8
  const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const fecha = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pedidos-aravena-${fecha}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarToast('Exportación lista', `${pedidosFiltrados.length} pedidos descargados`, 'ok');
}

/* ── Gráfico de ventas ──────────────────── */
function renderizarGrafico() {
  const canvas = document.getElementById('grafico-ventas');
  if (!canvas || typeof Chart === 'undefined') return;

  /* El gráfico usa el MISMO rango que el resumen: al cambiar las fechas
     arriba, las barras se mueven con él. */
  const { desde, hasta } = rangoFechas();
  const labels = [];
  const dataVentas = [];
  const dataCantidad = [];
  const buckets = {};

  // Una columna por día, con tope para que el eje no se sature
  const totalDias = Math.max(1, Math.round((hasta - desde) / 86400000) + 1);
  const dias = Math.min(totalDias, 120);
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hasta);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { ventas: 0, cantidad: 0 };
    labels.push(d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }));
  }

  // Cuentan también las ya despachadas: siguen siendo ingresos
  ventasDelRango().forEach(p => {
    const key = new Date(p.created_at).toISOString().slice(0, 10);
    if (buckets[key]) {
      buckets[key].ventas += Number(p.total) || 0;
      buckets[key].cantidad += 1;
    }
  });

  Object.keys(buckets).sort().forEach(k => {
    dataVentas.push(buckets[k].ventas);
    dataCantidad.push(buckets[k].cantidad);
  });

  const esDark = !document.documentElement.classList.contains('light');
  const textColor = esDark ? '#b5b5b5' : '#555';
  const gridColor = esDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  if (graficoVentas) graficoVentas.destroy();

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(143, 227, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(143, 227, 255, 0.02)');

  graficoVentas = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ingresos',
        data: dataVentas,
        borderColor: '#8fe3ff',
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#8fe3ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: esDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.98)',
          titleColor: esDark ? '#fff' : '#222',
          bodyColor: esDark ? '#ddd' : '#444',
          borderColor: '#8fe3ff',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (ctx) => {
              const idx = ctx.dataIndex;
              const cant = dataCantidad[idx];
              return [
                `Ingresos: $${ctx.parsed.y.toLocaleString('es-CL')}`,
                `Pedidos: ${cant}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor, drawBorder: false },
          ticks: {
            color: textColor,
            font: { size: 11 },
            callback: (v) => '$' + v.toLocaleString('es-CL')
          }
        }
      }
    }
  });
}

/* ── Realtime: nuevos pedidos ────────────── */
function suscribirseANuevosPedidos() {
  try {
    realtimeSub = db
      .channel('admin-pedidos')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        async (payload) => {
          const nuevo = payload.new;
          if (idsConocidos.has(nuevo.id)) return;
          idsConocidos.add(nuevo.id);

          /* Un pedido nace "pendiente" justo antes de mandar al cliente a
             la pasarela: todavía no es una venta y muchos se abandonan.
             El aviso se guarda para cuando el pago se confirme (UPDATE). */
          if (!ESTADOS_CONFIRMADOS.includes(nuevo.estado)) return;

          // Recargar para obtener email (RPC)
          await cargarPedidos();

          // Marcar fila como nueva
          setTimeout(() => {
            const fila = document.querySelector(`tr[data-id="${nuevo.id}"]`);
            if (fila) fila.classList.add('fila-nueva');
          }, 100);

          const total = Number(nuevo.total) || 0;
          mostrarToast(
            '¡Nueva venta!',
            `$${total.toLocaleString('es-CL')} CLP · pago confirmado`,
            'ok',
            true
          );
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        async (payload) => {
          // Si el webhook actualizó un pedido (pendiente → pagado)
          const anterior = payload.old;
          const nuevo = payload.new;
          if (anterior.estado !== nuevo.estado) {
            if (nuevo.estado === 'pagado') {
              await cargarPedidos();
              mostrarToast(
                'Pago confirmado',
                `Pedido ${String(nuevo.id).slice(0, 8)}… pasó a pagado`,
                'ok',
                true
              );
            } else if (nuevo.estado === 'enviado') {
              await cargarPedidos();
              mostrarToast(
                'Pedido despachado',
                `Pedido ${String(nuevo.id).slice(0, 8)}… marcado como enviado`,
                'ok'
              );
            }
          }
        }
      )
      .subscribe();

    console.log('[Admin] Suscrito a cambios en tiempo real.');
  } catch (e) {
    console.warn('[Admin] Realtime no disponible:', e);
  }
}

/* ── Toasts ──────────────────────────────── */
/* El 4º parámetro acepta `true` para sonar (pedido nuevo) o un objeto
   { texto, accion } para ofrecer deshacer. */
function mostrarToast(titulo, mensaje, tipo = 'ok', extra = false) {
  const cont = document.getElementById('admin-toasts');
  if (!cont) return;
  const conSonido = extra === true;
  const deshacer = (extra && typeof extra === 'object') ? extra : null;

  const iconos = {
    ok: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `
    <div class="admin-toast-icon">${iconos[tipo] || iconos.ok}</div>
    <div class="admin-toast-content">
      <p class="admin-toast-title">${titulo}</p>
      <p class="admin-toast-msg">${mensaje}</p>
    </div>
    ${deshacer ? '<button class="admin-toast-undo">' + deshacer.texto + '</button>' : ''}
  `;

  if (deshacer) {
    toast.querySelector('.admin-toast-undo').addEventListener('click', e => {
      e.stopPropagation();
      removerToast(toast);
      deshacer.accion();
    });
  }

  toast.addEventListener('click', () => removerToast(toast));
  cont.appendChild(toast);

  if (conSonido) reproducirSonido();

  // Con opción de deshacer se deja más tiempo para reaccionar
  setTimeout(() => removerToast(toast), deshacer ? 8000 : 5500);
}

function removerToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.add('saliendo');
  setTimeout(() => toast.remove(), 300);
}

function reproducirSonido() {
  try {
    // Sonido sintético con Web Audio API (evita depender de archivo)
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) { /* silencio en error */ }
}

/* ── Visitantes en tiempo real ──────────────────────── */
function iniciarPresenciaRealtime() {
  const countEl  = document.getElementById('realtime-count');
  const paginasEl = document.getElementById('realtime-paginas');
  if (!countEl) return;

  async function actualizarConteo() {
    try {
      const hace2min = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data } = await db
        .from('presencia')
        .select('pagina')
        .gte('updated_at', hace2min);

      if (!data) return;

      // Excluir al propio admin del conteo
      const visitantes = data.filter(r => r.pagina !== 'Admin');
      countEl.textContent = visitantes.length;

      // Agrupar por página
      const grupos = {};
      visitantes.forEach(r => {
        grupos[r.pagina] = (grupos[r.pagina] || 0) + 1;
      });

      paginasEl.innerHTML = Object.entries(grupos)
        .map(([pag, n]) => `<span class="realtime-pag">${pag} <b>${n}</b></span>`)
        .join('');

    } catch (_) {}
  }

  // Cargar al iniciar
  actualizarConteo();

  // Suscribirse a cambios en tiempo real
  db.channel('presencia-admin')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'presencia'
    }, actualizarConteo)
    .subscribe();

  // Fallback: refrescar cada 30s igual
  setInterval(actualizarConteo, 30_000);
}

/* ── Usuarios activos DAU / WAU / MAU ───────────────── */
async function cargarUsuariosActivos() {
  try {
    const hoy      = new Date();
    const diaStr   = hoy.toISOString().slice(0, 10);
    const lunesStr = (() => {
      const d = new Date(hoy);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return d.toISOString().slice(0, 10);
    })();
    const mes1Str  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString().slice(0, 10);

    const [resDia, resSemana, resMes, resTopPag] = await Promise.all([
      db.from('visitas').select('session_id', { count: 'exact', head: true })
        .eq('fecha', diaStr),
      db.from('visitas').select('session_id', { count: 'exact', head: true })
        .gte('fecha', lunesStr),
      db.from('visitas').select('session_id', { count: 'exact', head: true })
        .gte('fecha', mes1Str),
      db.from('visitas').select('pagina').eq('fecha', diaStr),
    ]);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val ?? '—';
    };

    set('uau-dia',    resDia.count    ?? 0);
    set('uau-semana', resSemana.count ?? 0);
    set('uau-mes',    resMes.count    ?? 0);

    // Página más visitada hoy
    if (resTopPag.data?.length) {
      const freq = {};
      resTopPag.data.forEach(r => {
        if (r.pagina && r.pagina !== 'Admin')
          freq[r.pagina] = (freq[r.pagina] || 0) + 1;
      });
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
      if (top) {
        set('uau-top-pagina', top[0]);
        set('uau-top-sub', `${top[1]} visita${top[1] !== 1 ? 's' : ''} hoy`);
      }
    }
  } catch (e) {
    console.warn('[Admin] Error cargando UAU:', e.message);
  }
}

/* ── Drive Sync: abrir modal ────────────────────────────── */
async function abrirDriveModal() {
  const overlay = document.getElementById('drive-overlay');
  const modal   = document.getElementById('drive-modal');
  const grid    = document.getElementById('drive-grid');
  const estado  = document.getElementById('drive-estado');
  const footer  = document.getElementById('drive-footer');

  overlay.classList.add('activo');
  modal.style.display = 'flex';
  grid.innerHTML = '';
  footer.style.display = 'none';
  estado.innerHTML = '<div class="drive-cargando"><div class="spinner-dorado"></div><p>Cargando imágenes de Drive…</p></div>';

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session) { cerrarDriveModal(); return; }

    const res = await fetch('/api/drive-list', {
      headers: { 'Authorization': 'Bearer ' + session.access_token }
    });
    const data = await res.json();

    if (!res.ok) {
      estado.innerHTML = `<div class="drive-error"><strong>Error:</strong> ${data.error}</div>`;
      return;
    }

    driveArchivos = data.files || [];

    if (driveArchivos.length === 0) {
      estado.innerHTML = '<div class="drive-vacio">No hay imágenes en la carpeta de Drive.</div>';
      return;
    }

    estado.innerHTML = `<p class="drive-instrucciones-txt">
      Se encontraron <strong>${driveArchivos.length}</strong> imágenes. Selecciona el producto para cada una y haz clic en "Sincronizar asignados".
    </p>`;

    grid.innerHTML = driveArchivos.map((f, idx) => {
      const opcionesProductos = typeof productos !== 'undefined'
        ? productos.map(p =>
            `<option value="${p.id}">${p.id} — ${p.nombre.slice(0, 35)}${p.nombre.length > 35 ? '…' : ''}</option>`
          ).join('')
        : '';
      return `
        <div class="drive-item" id="drive-item-${idx}">
          <div class="drive-item-img-wrap">
            ${f.thumbnail
              ? `<img src="${f.thumbnail}" alt="${f.name}" loading="lazy">`
              : `<div class="drive-item-sin-thumb">Sin previsualización</div>`
            }
          </div>
          <div class="drive-item-info">
            <p class="drive-item-nombre" title="${f.name}">${f.name.slice(0, 40)}${f.name.length > 40 ? '…' : ''}</p>
            <select class="drive-item-select" id="drive-sel-${idx}" data-drive-id="${f.id}" data-idx="${idx}" onchange="actualizarContadorAsignados()">
              <option value="">— Sin asignar —</option>
              ${opcionesProductos}
            </select>
            <span class="drive-item-badge" id="drive-badge-${idx}"></span>
          </div>
        </div>
      `;
    }).join('');

    footer.style.display = 'flex';
    actualizarContadorAsignados();

  } catch (e) {
    estado.innerHTML = `<div class="drive-error"><strong>Error inesperado:</strong> ${e.message}</div>`;
  }
}

function cerrarDriveModal() {
  document.getElementById('drive-overlay').classList.remove('activo');
  document.getElementById('drive-modal').style.display = 'none';
}

function actualizarContadorAsignados() {
  const selects = document.querySelectorAll('.drive-item-select');
  let count = 0;
  selects.forEach(s => { if (s.value) count++; });
  const el = document.getElementById('drive-asignados-count');
  if (el) el.textContent = `${count} asignado${count !== 1 ? 's' : ''}`;
}
window.actualizarContadorAsignados = actualizarContadorAsignados;

/* ── Drive Sync: ejecutar sincronización ────────────────── */
async function sincronizarAsignados() {
  const selects = Array.from(document.querySelectorAll('.drive-item-select')).filter(s => s.value);

  if (selects.length === 0) {
    mostrarToast('Sin asignaciones', 'Asigna al menos una imagen a un producto.', 'info');
    return;
  }

  const btn = document.getElementById('btn-drive-confirmar');
  btn.disabled = true;
  btn.textContent = 'Sincronizando…';

  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    mostrarToast('Error', 'Sesión expirada.', 'error');
    btn.disabled = false;
    btn.textContent = 'Sincronizar asignados';
    return;
  }

  let exitosos = 0;
  let fallidos = 0;

  for (const select of selects) {
    const idx      = select.dataset.idx;
    const driveId  = select.dataset.driveId;
    const prodId   = select.value;
    const badge    = document.getElementById(`drive-badge-${idx}`);

    if (badge) badge.innerHTML = '<span class="drive-badge-sync">⏳</span>';

    try {
      const res = await fetch('/api/drive-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveFileId: driveId, productId: prodId, adminToken: session.access_token }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        exitosos++;
        if (badge) badge.innerHTML = '<span class="drive-badge-ok">✓ Sincronizado</span>';
        // Actualizar override en memoria
        if (window.imagenesOverride) window.imagenesOverride[parseInt(prodId)] = data.url;
      } else {
        fallidos++;
        if (badge) badge.innerHTML = `<span class="drive-badge-error" title="${data.error}">✗ Error</span>`;
      }
    } catch (e) {
      fallidos++;
      if (badge) badge.innerHTML = '<span class="drive-badge-error">✗ Error de red</span>';
    }
  }

  btn.disabled = false;
  btn.textContent = 'Sincronizar asignados';

  if (exitosos > 0) {
    mostrarToast(
      'Sincronización completa',
      `${exitosos} imagen${exitosos !== 1 ? 'es' : ''} actualizada${exitosos !== 1 ? 's' : ''} correctamente${fallidos > 0 ? ` (${fallidos} con error)` : ''}.`,
      exitosos > 0 ? 'ok' : 'error'
    );
  } else {
    mostrarToast('Error', `No se pudo sincronizar ninguna imagen.`, 'error');
  }
}

/* ── Sync completo del catálogo desde Drive ─────────────── */
async function sincronizarCatalogo() {
  const btn = document.getElementById('btn-sync-catalogo');
  const textoOriginal = btn.innerHTML;
  const spinnerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>`;
  btn.disabled = true;

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session) { mostrarToast('Error', 'Sesión expirada', 'error'); return; }

    // 1. Obtener lista de archivos de Drive (con thumbnails)
    btn.innerHTML = `${spinnerHTML} Cargando lista…`;
    const listRes = await fetch('/api/drive-list', {
      headers: { 'Authorization': 'Bearer ' + session.access_token }
    });
    if (!listRes.ok) {
      const e = await listRes.json();
      mostrarToast('Error', e.error || 'No se pudo listar Drive', 'error');
      return;
    }
    const { files } = await listRes.json();
    const total = files.length;

    let procesados = 0, errores = 0;

    // 2. Procesar cada archivo: descargar thumbnail en browser → Gemini → guardar
    for (const file of files) {
      btn.innerHTML = `${spinnerHTML} Analizando (${procesados}/${total})…`;

      try {
        const thumbnailUrl = file.thumbnail
          ? file.thumbnail.replace(/=s\d+/, '=s800')
          : null;

        // El servidor descarga la imagen vía service account (sin CORS ni sesión)
        const gemRes = await fetch('/api/gemini-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driveFileId: file.id, mimeType: file.mimeType || 'image/jpeg' }),
        });
        if (!gemRes.ok) { errores++; continue; }
        const { nombre, precio, categoria } = await gemRes.json();

        // Guardar en ambas bases de datos
        const saveRes = await fetch('/api/catalog-save', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + session.access_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            driveFileId: file.id,
            nombre, precio, categoria,
            imageUrl: thumbnailUrl,
          }),
        });
        if (saveRes.ok) procesados++;
        else errores++;

      } catch (err) {
        console.warn('[sync] Error en archivo', file.name, err.message);
        errores++;
      }
    }

    const msg = `${procesados} foto${procesados !== 1 ? 's' : ''} procesada${procesados !== 1 ? 's' : ''}${errores ? `, ${errores} error(es)` : ''}`;
    mostrarToast('Catálogo sincronizado', msg, 'success');
  } catch (e) {
    mostrarToast('Error', e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

/* ── Editar Catálogo ─────────────────────────────────────── */
const CATEGORIAS = ['general','collares','pulseras','aros','anillos','conjuntos','colgantes','exhibidores'];

async function abrirEditarCatalogo() {
  const overlay = document.getElementById('catalogo-overlay');
  const modal   = document.getElementById('catalogo-modal');
  const lista   = document.getElementById('catalogo-lista');

  overlay.style.display = 'block';
  modal.style.display   = 'flex';
  lista.innerHTML = '<p style="color:#aaa;text-align:center;padding:2rem">Cargando catálogo…</p>';

  const { data, error } = await db.from('catalogo').select('*').order('created_at', { ascending: false });

  if (error || !data) {
    lista.innerHTML = `<p style="color:#f87171;text-align:center">Error: ${error?.message}</p>`;
    return;
  }

  if (data.length === 0) {
    lista.innerHTML = '<p style="color:#aaa;text-align:center;padding:2rem">No hay productos en el catálogo todavía.</p>';
    return;
  }

  lista.innerHTML = data.map(p => {
    const opsCat = CATEGORIAS.map(c =>
      `<option value="${c}"${p.categoria === c ? ' selected' : ''}>${c}</option>`
    ).join('');
    return `
    <div style="display:grid;grid-template-columns:56px 1fr 110px 160px 80px auto;gap:.5rem;align-items:center;background:#0f0f23;border:1px solid #2a2a4a;border-radius:10px;padding:.6rem .8rem" id="cat-row-${p.id}">
      <img src="${p.imagen_url}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #333">
      <input type="text" value="${p.nombre || ''}" placeholder="Nombre del producto"
        style="background:#1a1a3e;border:1px solid #333;color:#fff;border-radius:6px;padding:.35rem .6rem;font-size:.85rem;width:100%"
        id="cat-nombre-${p.id}">
      <input type="number" value="${p.precio || 0}" min="0" placeholder="Precio"
        style="background:#1a1a3e;border:1px solid #333;color:#fff;border-radius:6px;padding:.35rem .6rem;font-size:.85rem;width:100%"
        id="cat-precio-${p.id}">
      <select style="background:#1a1a3e;border:1px solid #333;color:#fff;border-radius:6px;padding:.35rem .6rem;font-size:.85rem"
        id="cat-cat-${p.id}">${opsCat}</select>
      <label style="display:flex;align-items:center;gap:.3rem;color:#aaa;font-size:.8rem;cursor:pointer">
        <input type="checkbox" id="cat-activo-${p.id}"${p.activo ? ' checked' : ''}> Activo
      </label>
      <button onclick="guardarProductoCatalogo(${p.id})"
        style="background:#10b981;border:none;color:#fff;border-radius:6px;padding:.35rem .7rem;cursor:pointer;font-size:.8rem;white-space:nowrap"
        id="cat-btn-${p.id}">Guardar</button>
    </div>`;
  }).join('');
}

async function guardarProductoCatalogo(id) {
  const btn      = document.getElementById(`cat-btn-${id}`);
  const nombre   = document.getElementById(`cat-nombre-${id}`).value.trim();
  const precio   = parseInt(document.getElementById(`cat-precio-${id}`).value) || 0;
  const categoria= document.getElementById(`cat-cat-${id}`).value;
  const activo   = document.getElementById(`cat-activo-${id}`).checked;

  btn.textContent = '…';
  btn.disabled = true;

  try {
    const { data: { session } } = await db.auth.getSession();
    const res = await fetch('/api/catalog-update', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + session.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, nombre, precio, categoria, activo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    btn.textContent = '✓';
    btn.style.background = '#059669';
    setTimeout(() => { btn.textContent = 'Guardar'; btn.style.background = '#10b981'; btn.disabled = false; }, 1500);
  } catch (e) {
    btn.textContent = 'Error';
    btn.style.background = '#ef4444';
    setTimeout(() => { btn.textContent = 'Guardar'; btn.style.background = '#10b981'; btn.disabled = false; }, 2000);
    mostrarToast('Error', e.message, 'error');
  }
}

function cerrarEditarCatalogo() {
  document.getElementById('catalogo-overlay').style.display = 'none';
  document.getElementById('catalogo-modal').style.display   = 'none';
}

/* ═══════════════════════════════════════════════════════════
   PANEL DE ADMINISTRACIÓN — Joyería Aravena
   ═══════════════════════════════════════════════════════════ */

// Emails con permisos de admin
const ADMIN_EMAILS = [
  'diegoaravenavera@gmail.com'
];

let todosLosPedidos = [];
let pedidoActual = null;
let pedidosFiltrados = [];
let emailsUsuarios = {};      // { user_id: email }
let graficoVentas = null;
let diasGrafico = 30;
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

function configurarEventos() {
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

  document.getElementById('btn-export').addEventListener('click', exportarCSV);

  document.getElementById('filtro-busqueda').addEventListener('input', aplicarFiltros);
  document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);

  // Botones período del gráfico
  document.querySelectorAll('.btn-periodo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-periodo').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      diasGrafico = parseInt(btn.dataset.dias, 10);
      renderizarGrafico();
    });
  });

  // Modal detalle
  document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
  document.getElementById('modal-overlay').addEventListener('click', cerrarModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrarModal(); cerrarCalculadora(); cerrarAdminConfirm(); }
  });

  // Modal confirmar eliminar pedido
  document.getElementById('admin-confirm-si').addEventListener('click', confirmarEliminarPedido);
  document.getElementById('admin-confirm-no').addEventListener('click', cerrarAdminConfirm);
  document.getElementById('admin-confirm-overlay').addEventListener('click', e => {
    if (e.target.id === 'admin-confirm-overlay') cerrarAdminConfirm();
  });

  // Botón "Eliminar fallidos" — borrado masivo
  document.getElementById('btn-limpiar-fallidos')?.addEventListener('click', pedirEliminarFallidos);
  // Botón "Eliminar pendientes" — borrado masivo
  document.getElementById('btn-limpiar-pendientes')?.addEventListener('click', pedirEliminarPendientes);

  // Calculadora de lote
  document.getElementById('btn-calculadora').addEventListener('click', abrirCalculadora);
  document.getElementById('calc-cerrar').addEventListener('click', cerrarCalculadora);
  document.getElementById('calc-overlay').addEventListener('click', cerrarCalculadora);
  document.getElementById('calc-buscar').addEventListener('input', buscarProductoCalc);
  document.getElementById('calc-cantidad').addEventListener('input', recalcular);
  document.querySelectorAll('.calc-btn-cant').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('calc-cantidad');
      const delta = parseInt(btn.dataset.delta, 10);
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
      recalcular();
    });
  });
  document.getElementById('calc-btn-copiar').addEventListener('click', copiarCotizacion);
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
        `<tr><td colspan="7" class="tabla-vacia">Error: ${error.message}</td></tr>`;
      return;
    }

    todosLosPedidos = (data || []).sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    // Indexar emails
    todosLosPedidos.forEach(p => {
      if (p.email) emailsUsuarios[p.user_id] = p.email;
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

/* ── Stats ───────────────────────────────── */
function calcularStats() {
  const total = todosLosPedidos.length;
  // "Pagados" incluye también enviados (siguen siendo ingresos confirmados)
  const pagadosYEnviados = todosLosPedidos.filter(p => p.estado === 'pagado' || p.estado === 'enviado');
  const enviados = todosLosPedidos.filter(p => p.estado === 'enviado').length;
  const pendientes = todosLosPedidos.filter(p => p.estado === 'pendiente').length;
  const revenue = pagadosYEnviados.reduce((s, p) => s + (Number(p.total) || 0), 0);

  animarContador('stat-total', total);
  animarContador('stat-pagados', pagadosYEnviados.length);
  animarContador('stat-pendientes', pendientes);
  animarContador('stat-enviados', enviados);
  document.getElementById('stat-revenue').textContent = '$' + revenue.toLocaleString('es-CL');
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
    // "Todos" excluye pendientes — solo se ven al filtrar explícitamente
    if (estado === 'todos') {
      if (p.estado === 'pendiente') return false;
    } else if (p.estado !== estado) {
      return false;
    }

    if (busqueda) {
      const id = String(p.id).toLowerCase();
      const userId = String(p.user_id || '').toLowerCase();
      const email = String(p.email || emailsUsuarios[p.user_id] || '').toLowerCase();
      if (!id.includes(busqueda) && !userId.includes(busqueda) && !email.includes(busqueda)) return false;
    }

    return true;
  });

  renderizarTabla();
}

/* ── Render tabla ────────────────────────── */
function renderizarTabla() {
  const tbody = document.getElementById('tabla-pedidos');

  if (pedidosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="tabla-vacia">No hay pedidos que coincidan con los filtros.</td></tr>';
    return;
  }

  tbody.innerHTML = pedidosFiltrados.map(p => {
    const idCorto = String(p.id).slice(0, 8);
    const fecha = new Date(p.created_at).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const email = p.email || emailsUsuarios[p.user_id] || '';
    const clienteId = String(p.user_id || '').slice(0, 8);
    const items = Array.isArray(p.items) ? p.items : [];
    const itemsCount = items.reduce((s, i) => s + (i.cantidad || 1), 0);
    const total = Number(p.total) || 0;

    const acciones = [];
    if (p.estado === 'pagado') {
      acciones.push(`<button class="btn-accion btn-accion-enviar" onclick="cambiarEstado('${p.id}', 'enviado')" title="Marcar como despachado">📦 Marcar enviado</button>`);
    } else if (p.estado !== 'enviado') {
      acciones.push(`<button class="btn-accion btn-accion-pagar" onclick="cambiarEstado('${p.id}', 'pagado')">Marcar pagado</button>`);
    }
    if (p.estado !== 'fallido' && p.estado !== 'enviado') {
      acciones.push(`<button class="btn-accion btn-accion-fallar" onclick="cambiarEstado('${p.id}', 'fallido')">Fallido</button>`);
    }
    acciones.push(`<button class="btn-accion" onclick="verDetalle('${p.id}')">Ver</button>`);
    acciones.push(`<button class="btn-accion btn-accion-eliminar" onclick="eliminarPedido('${p.id}')" title="Eliminar pedido">🗑</button>`);

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
      const empresa   = de.empresa    ? `<span class="td-envio-empresa">${de.empresa}</span>` : '';
      const nombre    = de.nombre     ? `<span class="td-envio-linea">${de.nombre}</span>` : '';
      const tel       = de.telefono   ? `<span class="td-envio-linea">📞 ${de.telefono}</span>` : '';
      const ciudad    = de.ciudad     ? `<span class="td-envio-linea">📍 ${de.ciudad}</span>` : '';
      const pref      = de.preferencia ? `<span class="td-envio-pref">${de.preferencia}${de.sucursal ? ' · ' + de.sucursal : ''}</span>` : '';
      const domicilio = de.domicilio  ? `<span class="td-envio-domicilio">🏠 ${de.domicilio}</span>` : '';
      envioHtml = `<div class="td-envio">${empresa}${nombre}${tel}${ciudad}${pref}${domicilio}</div>`;
    } else {
      envioHtml = `<span class="td-envio-vacio">—</span>`;
    }

    return `
      <tr data-id="${p.id}">
        <td class="td-id" data-label="ID">${idCorto}…</td>
        <td data-label="Fecha">${fecha}</td>
        <td class="td-cliente" data-label="Cliente">${clienteHtml}</td>
        <td class="td-envio-col" data-label="Envío">${envioHtml}</td>
        <td data-label="Items">${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}</td>
        <td class="td-total" data-label="Total">$${total.toLocaleString('es-CL')}</td>
        <td data-label="Estado"><span class="estado-badge estado-${p.estado}">${p.estado}</span></td>
        <td><div class="tabla-acciones">${acciones.join('')}</div></td>
      </tr>
    `;
  }).join('');
}

/* ── Cambiar estado ──────────────────────── */
async function cambiarEstado(pedidoId, nuevoEstado) {
  if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

  try {
    const { error } = await db
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }

    // Actualizar local (comparación con conversión de tipo)
    const pedido = todosLosPedidos.find(p => String(p.id) === String(pedidoId));
    if (pedido) pedido.estado = nuevoEstado;

    calcularStats();
    aplicarFiltros();
    renderizarGrafico();

    mostrarToast('Estado actualizado', `Pedido marcado como ${nuevoEstado}`, 'ok');

  } catch (e) {
    console.error('[Admin] Error cambiando estado:', e);
    alert('Error inesperado.');
  }
}
window.cambiarEstado = cambiarEstado;

/* ── Eliminar pedido (con modal de confirmación) ──────── */
let _pedidoAEliminar = null;
let _bulkAEliminar   = null; // 'fallido' | null

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

function pedirEliminarPendientes() {
  const pendientes = todosLosPedidos.filter(p => p.estado === 'pendiente');
  if (pendientes.length === 0) {
    mostrarToast('Sin pedidos', 'No hay pedidos pendientes para eliminar.', 'ok');
    return;
  }
  _pedidoAEliminar = null;
  _bulkAEliminar   = 'pendiente';
  document.querySelector('.admin-confirm-titulo').textContent = '¿Eliminar pedidos pendientes?';
  document.getElementById('admin-confirm-detalle').textContent =
    `Se eliminarán ${pendientes.length} pedido(s) en estado pendiente. Asegúrate de haber verificado en MercadoPago cuáles realmente pagaron antes de eliminar.`;
  document.getElementById('admin-confirm-overlay').classList.add('activo');
}
window.pedirEliminarPendientes = pedirEliminarPendientes;

function cerrarAdminConfirm() {
  _pedidoAEliminar = null;
  _bulkAEliminar   = null;
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
      ? { byStatus: bulk, adminToken: session.access_token }
      : { pedidoId,        adminToken: session.access_token };

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
      const antes = todosLosPedidos.length;
      todosLosPedidos = todosLosPedidos.filter(p => p.estado !== bulk);
      const eliminados = data.deleted ?? (antes - todosLosPedidos.length);
      mostrarToast('Pedidos eliminados', `${eliminados} pedido(s) ${bulk}(s) eliminados`, 'ok');
    } else {
      const idCorto = String(pedidoId).slice(0, 8).toUpperCase();
      todosLosPedidos = todosLosPedidos.filter(p => String(p.id) !== String(pedidoId));
      mostrarToast('Pedido eliminado', `#${idCorto} eliminado correctamente`, 'ok');
    }

    calcularStats();
    aplicarFiltros();
    renderizarGrafico();

  } catch (e) {
    console.error('[Admin] Error eliminando:', e);
    mostrarToast('Error', 'Error inesperado al eliminar.', 'error');
  }
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
    const email = p.email || emailsUsuarios[p.user_id] || '';
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

  // Construir dataset por día
  const ahora = new Date();
  const labels = [];
  const dataVentas = [];
  const dataCantidad = [];
  const buckets = {};

  for (let i = diasGrafico - 1; i >= 0; i--) {
    const d = new Date(ahora);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { ventas: 0, cantidad: 0 };
    labels.push(d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }));
  }

  // Agregar pagados al bucket correspondiente
  todosLosPedidos
    .filter(p => p.estado === 'pagado')
    .forEach(p => {
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
  gradient.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
  gradient.addColorStop(1, 'rgba(212, 175, 55, 0.02)');

  graficoVentas = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ingresos',
        data: dataVentas,
        borderColor: '#d4af37',
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#d4af37',
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
          borderColor: '#d4af37',
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

          // Recargar para obtener email (RPC)
          await cargarPedidos();

          // Marcar fila como nueva
          setTimeout(() => {
            const fila = document.querySelector(`tr[data-id="${nuevo.id}"]`);
            if (fila) fila.classList.add('fila-nueva');
          }, 100);

          // Notificación
          const total = Number(nuevo.total) || 0;
          mostrarToast(
            '¡Nuevo pedido recibido!',
            `$${total.toLocaleString('es-CL')} CLP · estado: ${nuevo.estado}`,
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
function mostrarToast(titulo, mensaje, tipo = 'ok', conSonido = false) {
  const cont = document.getElementById('admin-toasts');
  if (!cont) return;

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
  `;

  toast.addEventListener('click', () => removerToast(toast));
  cont.appendChild(toast);

  if (conSonido) reproducirSonido();

  setTimeout(() => removerToast(toast), 5500);
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

/* ═══════════════════════════════════════════════════════════
   CALCULADORA DE LOTE
   ═══════════════════════════════════════════════════════════ */

let calcProductoActivo = null;

// Tiers de descuento por volumen
const DESCUENTOS_LOTE = [
  { min: 100, pct: 20 },
  { min: 50,  pct: 15 },
  { min: 20,  pct: 10 },
  { min: 10,  pct: 5  },
  { min: 1,   pct: 0  }
];

function calcularDescuento(cantidad) {
  return DESCUENTOS_LOTE.find(t => cantidad >= t.min)?.pct || 0;
}

function abrirCalculadora() {
  document.getElementById('calc-overlay').classList.add('activo');
  document.getElementById('calc-modal').classList.add('activo');
  document.getElementById('calc-buscar').value = '';
  document.getElementById('calc-buscar').focus();
  buscarProductoCalc();
}

function cerrarCalculadora() {
  document.getElementById('calc-overlay').classList.remove('activo');
  document.getElementById('calc-modal').classList.remove('activo');
}

function buscarProductoCalc() {
  if (typeof productos === 'undefined') return;
  const q = document.getElementById('calc-buscar').value.trim().toLowerCase();
  const lista = document.getElementById('calc-resultados');

  // Sólo productos con precio > 0
  const matches = productos
    .filter(p => p.precio > 0)
    .filter(p => !q || p.nombre.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q))
    .slice(0, 8);

  if (matches.length === 0) {
    lista.innerHTML = '<div class="calc-no-results">Sin coincidencias</div>';
    return;
  }

  lista.innerHTML = matches.map(p => `
    <div class="calc-resultado-item" onclick="seleccionarProductoCalc(${p.id})">
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.opacity=0.3">
      <div class="calc-resultado-info">
        <p class="calc-resultado-nombre">${p.nombre}</p>
        <p class="calc-resultado-meta">${p.categoria} · $${p.precio.toLocaleString('es-CL')}</p>
      </div>
    </div>
  `).join('');
}

function seleccionarProductoCalc(id) {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  calcProductoActivo = p;

  document.getElementById('calc-resultados').innerHTML = '';
  document.getElementById('calc-buscar').value = p.nombre;

  const elegido = document.getElementById('calc-producto-elegido');
  elegido.style.display = 'flex';
  elegido.innerHTML = `
    <img src="${p.imagen}" alt="${p.nombre}">
    <div>
      <p class="calc-elegido-nombre">${p.nombre}</p>
      <p class="calc-elegido-meta">${p.categoria} · ${p.material}</p>
      <p class="calc-elegido-precio">$${p.precio.toLocaleString('es-CL')} <small>c/u</small></p>
    </div>
    <button class="calc-elegido-quitar" onclick="quitarProductoCalc()" title="Quitar">×</button>
  `;

  document.getElementById('calc-cantidad-bloque').style.display = 'block';
  document.getElementById('calc-resultado').style.display = 'block';
  document.getElementById('calc-cantidad').value = 1;
  recalcular();
}
window.seleccionarProductoCalc = seleccionarProductoCalc;

function quitarProductoCalc() {
  calcProductoActivo = null;
  document.getElementById('calc-producto-elegido').style.display = 'none';
  document.getElementById('calc-cantidad-bloque').style.display = 'none';
  document.getElementById('calc-resultado').style.display = 'none';
  document.getElementById('calc-buscar').value = '';
  document.getElementById('calc-buscar').focus();
  buscarProductoCalc();
}
window.quitarProductoCalc = quitarProductoCalc;

function recalcular() {
  if (!calcProductoActivo) return;
  const cant = Math.max(1, parseInt(document.getElementById('calc-cantidad').value, 10) || 1);
  const precio = calcProductoActivo.precio;
  const subtotal = precio * cant;
  const pct = calcularDescuento(cant);
  const descuento = Math.round(subtotal * pct / 100);
  const total = subtotal - descuento;
  const precioReal = Math.round(total / cant);

  document.getElementById('calc-precio-unit').textContent = '$' + precio.toLocaleString('es-CL');
  document.getElementById('calc-cant-display').textContent = cant;
  document.getElementById('calc-subtotal').textContent = '$' + subtotal.toLocaleString('es-CL');
  document.getElementById('calc-total').textContent = '$' + total.toLocaleString('es-CL') + ' CLP';
  document.getElementById('calc-precio-real').textContent = '$' + precioReal.toLocaleString('es-CL');

  const descRow = document.getElementById('calc-descuento-row');
  if (pct > 0) {
    descRow.style.display = 'flex';
    document.getElementById('calc-descuento-pct').textContent = pct + '%';
    document.getElementById('calc-descuento-valor').textContent = '−$' + descuento.toLocaleString('es-CL');
  } else {
    descRow.style.display = 'none';
  }

  // Resaltar tier activo
  document.querySelectorAll('.calc-tier').forEach(t => {
    const min = parseInt(t.dataset.min, 10);
    t.classList.toggle('activo', cant >= min &&
      (DESCUENTOS_LOTE.find(d => d.min === min)?.pct || 0) === pct);
  });

  // Mensaje WhatsApp
  const msg =
`*Cotización mayorista — Joyería Aravena*

📦 ${calcProductoActivo.nombre}
   Categoría: ${calcProductoActivo.categoria}
   Material: ${calcProductoActivo.material}

🔢 Cantidad: ${cant} unidades
💰 Precio unitario: $${precio.toLocaleString('es-CL')}
📊 Subtotal: $${subtotal.toLocaleString('es-CL')}` +
(pct > 0 ? `\n🎁 Descuento mayorista (${pct}%): −$${descuento.toLocaleString('es-CL')}` : '') +
`\n\n✨ *Total: $${total.toLocaleString('es-CL')} CLP*\n   ($${precioReal.toLocaleString('es-CL')} c/u)`;

  document.getElementById('calc-btn-wsp').href =
    'https://wa.me/56966497904?text=' + encodeURIComponent(msg);
  document.getElementById('calc-btn-copiar').dataset.texto = msg;
}

function copiarCotizacion() {
  const texto = document.getElementById('calc-btn-copiar').dataset.texto;
  if (!texto) return;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById('calc-btn-copiar');
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Copiado!';
    btn.classList.add('copiado');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copiado');
    }, 1800);
  }).catch(() => mostrarToast('Error', 'No se pudo copiar', 'error'));
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

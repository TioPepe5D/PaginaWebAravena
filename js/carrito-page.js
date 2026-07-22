let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const MAX_POR_ITEM = 10;

// Sanea cantidades guardadas que excedan el límite (ej. carritos viejos)
let _saneado = false;
carrito.forEach(it => {
  if (it.cantidad > MAX_POR_ITEM) { it.cantidad = MAX_POR_ITEM; _saneado = true; }
});
if (_saneado) localStorage.setItem("carrito", JSON.stringify(carrito));

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function mostrarAvisoLimite(nombre) {
  const t = document.createElement('div');
  t.className = 'toast-limite';
  t.textContent = `Máximo ${MAX_POR_ITEM} unidades de "${nombre}". Para mayoristas escríbenos por WhatsApp.`;
  Object.assign(t.style, {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    background: '#1a1a1a', color: '#ffd700', border: '1px solid #ffd700',
    padding: '12px 18px', borderRadius: '10px', zIndex: 9999,
    fontSize: '0.9rem', maxWidth: '90%', textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function actualizarContador() {
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById("carrito-contador");
  if (el) el.textContent = total;
  const badge = document.getElementById("carrito-badge");
  if (badge) badge.textContent = total;
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(p => String(p.id) === String(id));
  if (!item) return;
  if (delta > 0 && item.cantidad >= MAX_POR_ITEM) {
    mostrarAvisoLimite(item.nombre);
    return;
  }
  item.cantidad += delta;
  if (item.cantidad > MAX_POR_ITEM) item.cantidad = MAX_POR_ITEM;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(p => String(p.id) !== String(id));
  }
  guardarCarrito();
  actualizarContador();
  renderizarCarritoPage();
  habilitarBotonPago();
}

let _pendienteEliminarId = null;

function pedirConfirmacionEliminar(id) {
  const item = carrito.find(p => String(p.id) === String(id));
  if (!item) return;
  _pendienteEliminarId = id;
  document.getElementById('confirm-eliminar-nombre').textContent = item.nombre;
  document.getElementById('modal-confirm-overlay').classList.add('activo');
}

function cerrarConfirmEliminar() {
  _pendienteEliminarId = null;
  document.getElementById('modal-confirm-overlay').classList.remove('activo');
}

function confirmarEliminar() {
  if (_pendienteEliminarId === null) return;
  carrito = carrito.filter(p => String(p.id) !== String(_pendienteEliminarId));
  guardarCarrito();
  cerrarConfirmEliminar();
  actualizarContador();
  renderizarCarritoPage();
  habilitarBotonPago();
}

// Los carritos guardados antes no traían la categoría: se busca por id
function categoriaDeItem(item) {
  if (item.categoria) return item.categoria;
  const p = (typeof productos !== "undefined") ? productos.find(x => String(x.id) === String(item.id)) : null;
  return p ? p.categoria : "Joyas";
}

function renderizarCarritoPage() {
  const contenedor = document.getElementById("carrito-page-items");
  const totalEl = document.getElementById("carrito-aside-total");

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="carrito-vacio-msg">Tu carrito está vacío. <a href="index.html#catalogo">Ver productos →</a></p>';
    if (totalEl) totalEl.textContent = "$0 CLP";
    renderizarSugeridos();
    actualizarBarraPago(0);
    return;
  }

  contenedor.innerHTML = carrito.map(item => `
    <div class="carrito-page-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="carrito-page-item-info">
        <p class="carrito-page-item-nombre">${item.nombre}</p>
        <p class="carrito-page-item-cat">${categoriaDeItem(item)}</p>
        <p class="carrito-page-item-precio">$${item.precio.toLocaleString("es-CL")}</p>
      </div>
      <div class="cantidad-selector">
        <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
        <span class="cantidad-valor">${item.cantidad}</span>
        <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
      </div>
      <button class="carrito-page-item-eliminar" onclick="pedirConfirmacionEliminar(${item.id})" title="Eliminar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `).join("");

  const subtotal  = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const comision  = Math.round(subtotal * 0.03);
  const total     = subtotal + comision;

  const subtotalEl  = document.getElementById("carrito-aside-subtotal");
  const comisionEl  = document.getElementById("carrito-aside-comision");
  const comisionRow = document.getElementById("carrito-aside-comision-row");

  if (subtotalEl)  subtotalEl.textContent  = "$" + subtotal.toLocaleString("es-CL") + " CLP";
  if (comisionEl)  comisionEl.textContent  = "$" + comision.toLocaleString("es-CL") + " CLP";
  if (comisionRow) comisionRow.style.display = subtotal > 0 ? "flex" : "none";
  if (totalEl)     totalEl.textContent = "$" + total.toLocaleString("es-CL") + " CLP";

  renderizarSugeridos();
  actualizarBarraPago(total);
}

/* =============================================
   BARRA DE PAGO FIJA (celular)
   El panel de totales queda muy abajo cuando hay varios productos.
   ============================================= */
function actualizarBarraPago(total) {
  const barra = document.getElementById("carrito-barra-pago");
  if (!barra) return;
  barra.hidden = carrito.length === 0;
  const monto = document.getElementById("cbp-monto");
  if (monto) monto.textContent = "$" + total.toLocaleString("es-CL") + " CLP";
}

/* =============================================
   OTROS EMPRENDEDORES TAMBIÉN COMPRARON
   Sugiere productos de las mismas categorías del carrito; completa
   con otros si faltan. Nunca repite lo que ya está agregado.
   ============================================= */
const SUGERIDOS_MAX = 8;

function renderizarSugeridos() {
  const seccion = document.getElementById("sugeridos");
  const fila = document.getElementById("sugeridos-fila");
  if (!seccion || !fila || typeof productos === "undefined") return;

  const enCarrito = new Set(carrito.map(i => String(i.id)));
  const categorias = new Set(carrito.map(i => categoriaDeItem(i)));
  const disponibles = productos.filter(p => !enCarrito.has(String(p.id)) && p.precio > 0);

  const afines = disponibles.filter(p => categorias.has(p.categoria));
  const resto  = disponibles.filter(p => !categorias.has(p.categoria));
  const lista  = [...afines, ...resto].slice(0, SUGERIDOS_MAX);

  if (!lista.length) { seccion.hidden = true; return; }

  seccion.hidden = false;
  fila.innerHTML = lista.map(p => `
    <article class="sug-card">
      <a class="sug-link" href="producto.html?id=${p.id}">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" decoding="async">
        <p class="sug-nombre">${p.nombre}</p>
      </a>
      <div class="sug-pie">
        <span class="sug-precio">$${p.precio.toLocaleString("es-CL")}</span>
        <button class="sug-add" onclick="agregarSugerido(${p.id})" title="Agregar al carrito" aria-label="Agregar ${p.nombre} al carrito">+</button>
      </div>
    </article>`).join("");
}

function agregarSugerido(id) {
  if (typeof productos === "undefined") return;
  const p = productos.find(x => String(x.id) === String(id));
  if (!p) return;

  const existente = carrito.find(i => String(i.id) === String(id));
  if (existente) {
    if (existente.cantidad >= MAX_POR_ITEM) { mostrarAvisoLimite(p.nombre); return; }
    existente.cantidad++;
  } else {
    carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, categoria: p.categoria, cantidad: 1 });
  }
  guardarCarrito();
  actualizarContador();
  renderizarCarritoPage();
  habilitarBotonPago();
}

function habilitarBotonPago() {
  const btn = document.getElementById("btn-pagar");
  if (btn) btn.disabled = carrito.length === 0;
}

// ── Datos de envío temporales (guest checkout) ──
let _datosEnvio = null;

// ── Validadores y formateadores ─────────────────────────────────────────────
function _formatearRut(rut) {
  // Limpia y formatea: 12.345.678-9
  let v = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (v.length < 2) return v;
  const dv = v.slice(-1);
  let cuerpo = v.slice(0, -1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpo}-${dv}`;
}
function _validarRut(rut) {
  const v = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (v.length < 8 || v.length > 9) return false;
  const cuerpo = v.slice(0, -1);
  const dv = v.slice(-1);
  let suma = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dv === dvCalc;
}
function _validarCorreo(c) {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/.test(c);
}
function _bindRestricciones() {
  const get = id => document.getElementById(id);
  if (get('_restricciones_aplicadas')) return;

  // Solo letras y espacios
  ['env-nombre-pago', 'env-ciudad-pago'].forEach(id => {
    const el = get(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    });
  });

  // Teléfono: solo +56 seguido de 9 dígitos (máx 12 chars)
  const tel = get('env-telefono-pago');
  if (tel) tel.addEventListener('input', () => {
    tel.value = tel.value.replace(/[^0-9+]/g, '').slice(0, 12);
  });

  // RUT: formateo automático
  const rutEl = get('env-rut-pago');
  if (rutEl) rutEl.addEventListener('input', () => {
    rutEl.value = _formatearRut(rutEl.value);
  });

  // Marcador para no aplicar dos veces
  const flag = document.createElement('input');
  flag.type = 'hidden';
  flag.id = '_restricciones_aplicadas';
  document.body.appendChild(flag);
}

function abrirFormularioEnvio() {
  if (carrito.length === 0) return;
  _bindRestricciones();

  // 1. Pre-rellenar desde localStorage (funciona para todos)
  const guardados = JSON.parse(localStorage.getItem('checkout_datos') || 'null');
  if (guardados) {
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('env-nombre-pago',      guardados.nombre);
    set('env-telefono-pago',    guardados.telefono);
    set('env-rut-pago',         guardados.rut);
    set('env-ciudad-pago',      guardados.ciudad);
    set('env-correo-pago',      guardados.correo);
    set('env-empresa-pago',     guardados.empresa);
    set('env-preferencia-pago', guardados.preferencia);
    set('env-sucursal-pago',    guardados.sucursal);
    set('env-domicilio-pago',   guardados.domicilio);
  }

  // 2. Si hay sesión, sobreescribir con datos de Supabase (más confiables)
  if (typeof db !== 'undefined' && db) {
    db.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Email del usuario autenticado
        const correoEl = document.getElementById('env-correo-pago');
        if (correoEl && !correoEl.value) correoEl.value = session.user.email || '';

        // Datos de direcciones guardados en perfil
        db.from('direcciones').select('*').eq('user_id', session.user.id).limit(1)
          .then(({ data }) => {
            if (data && data[0]) {
              const d = data[0];
              const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
              if (d.nombre)    set('env-nombre-pago',   d.nombre + (d.apellido ? ' ' + d.apellido : ''));
              if (d.telefono)  set('env-telefono-pago', d.telefono);
              if (d.ciudad)    set('env-ciudad-pago',   d.ciudad);
              if (d.direccion) set('env-domicilio-pago',d.direccion);
            }
          });
      }
    });
  }

  document.getElementById('modal-envio-overlay').classList.add('activo');
}

function cerrarFormularioEnvio() {
  document.getElementById('modal-envio-overlay').classList.remove('activo');
}

function confirmarEnvioYPagar() {
  const nombre    = document.getElementById('env-nombre-pago').value.trim();
  const telefono  = document.getElementById('env-telefono-pago').value.trim();
  const rut       = document.getElementById('env-rut-pago').value.trim();
  const ciudad    = document.getElementById('env-ciudad-pago').value.trim();
  const correo    = document.getElementById('env-correo-pago').value.trim();
  const empresa   = document.getElementById('env-empresa-pago').value;
  const preferencia = document.getElementById('env-preferencia-pago').value;
  const sucursal  = document.getElementById('env-sucursal-pago').value.trim();
  const domicilio = document.getElementById('env-domicilio-pago').value.trim();

  const errEl = document.getElementById('env-form-error');
  const fail = msg => { errEl.textContent = msg; errEl.style.display = 'block'; };

  if (!nombre || !telefono || !rut || !ciudad || !correo || !empresa) {
    return fail('Por favor completa todos los campos obligatorios (*)');
  }
  if (nombre.length < 3 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
    return fail('Nombre inválido. Solo letras y espacios (mín. 3 caracteres).');
  }
  if (!/^\+56[0-9]{9}$/.test(telefono)) {
    return fail('Teléfono inválido. Formato requerido: +56912345678 (12 caracteres).');
  }
  if (!_validarRut(rut)) {
    return fail('RUT inválido. Verifica el dígito verificador (ej: 12.345.678-9).');
  }
  if (ciudad.length < 3 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(ciudad)) {
    return fail('Ciudad inválida. Solo letras y espacios.');
  }
  if (!_validarCorreo(correo)) {
    return fail('Correo electrónico inválido.');
  }
  if (preferencia === 'Domicilio' && (!domicilio || domicilio.length < 5)) {
    return fail('Para envío a domicilio, completa la dirección (mín. 5 caracteres).');
  }
  if (preferencia === 'Sucursal' && (!sucursal || sucursal.length < 3)) {
    return fail('Para envío a sucursal, indica cuál sucursal.');
  }
  errEl.style.display = 'none';

  _datosEnvio = { nombre, telefono, rut, ciudad, correo, empresa, preferencia, sucursal, domicilio };

  // Guardar en localStorage para próximas compras (funciona para todos)
  localStorage.setItem('checkout_datos', JSON.stringify(_datosEnvio));

  // Si hay sesión, guardar también en tabla direcciones de Supabase
  if (typeof db !== 'undefined' && db) {
    db.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        db.from('direcciones').upsert({
          user_id:  session.user.id,
          nombre:   nombre.split(' ')[0] || nombre,
          apellido: nombre.split(' ').slice(1).join(' ') || '',
          telefono,
          ciudad,
          direccion: domicilio || '',
        }, { onConflict: 'user_id' }).then(({ error }) => {
          if (error) console.warn('[Envío] No se pudo guardar en Supabase:', error.message);
        });
      }
    });
  }

  cerrarFormularioEnvio();
  _iniciarPagoMP();
}

async function _iniciarPagoMP() {
  const btn = document.getElementById("btn-pagar");
  const estado = document.getElementById("btn-mp-estado");
  if (carrito.length === 0) return;

  btn.disabled = true;
  btn.textContent = "Procesando...";
  if (estado) estado.textContent = "";

  // Solo enviar id y quantity — el servidor calcula los precios reales
  const items = carrito.map(i => ({
    id:       String(i.id),
    quantity: i.cantidad
  }));

  // Token de sesión para asociar el pedido al usuario (opcional)
  let token = null;
  try {
    const { data: { session } } = await db.auth.getSession();
    if (session) token = session.access_token;
  } catch (_) {}

  try {
    const res = await fetch("/api/crear-preferencia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ items, datosEnvio: _datosEnvio || null })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.init_point) {
      console.error("[MP] Error del servidor:", data);
      throw new Error(data.detail || data.error || "Error del servidor");
    }

    if (data.pedidoId) localStorage.setItem('pedido_pendiente_id', data.pedidoId);
    window.location.href = data.init_point;
  } catch (err) {
    console.error("[MP] Error al iniciar pago:", err);
    if (estado) {
      estado.textContent = `⚠ ${err.message || 'Error al conectar con MercadoPago'}. Intenta nuevamente o escríbenos por WhatsApp.`;
      estado.style.color = "#dc2626";
    }
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#009EE3"/><path d="M13 24c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11S13 30.075 13 24z" fill="white"/><path d="M20 24l3 3 6-6" stroke="#009EE3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Pagar con MercadoPago`;
  }
}

// Wrapper que abre el formulario de envío primero
function iniciarPago() {
  abrirFormularioEnvio();
}

/* ── Manejar retorno desde MercadoPago ────── */
async function manejarRetornoPago() {
  const params = new URLSearchParams(window.location.search);
  const pago = params.get('pago');
  if (!pago) return;

  // Limpiar URL sin recargar la página
  history.replaceState({}, '', window.location.pathname);

  const pedidoId = localStorage.getItem('pedido_pendiente_id');

  if (pago === 'ok') {
    // Actualizar estado en Supabase
    if (pedidoId && typeof db !== 'undefined' && db) {
      try {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
          await db.from('pedidos')
            .update({ estado: 'pagado' })
            .eq('id', pedidoId)
            .eq('user_id', session.user.id);
          localStorage.removeItem('pedido_pendiente_id');
        }
      } catch (e) { console.warn('[Pedidos] Error al actualizar estado:', e); }
    }

    // Vaciar carrito
    carrito = [];
    guardarCarrito();
    actualizarContador();
    renderizarCarritoPage();
    habilitarBotonPago();

    mostrarBannerPago(
      '¡Pago realizado con éxito! Gracias por tu compra, pronto te contactaremos.',
      'ok',
      'Ver mis pedidos →',
      'perfil.html#pedidos'
    );

  } else if (pago === 'pendiente') {
    mostrarBannerPago(
      'Tu pago está siendo procesado. Te avisaremos cuando se confirme.',
      'pendiente'
    );

  } else if (pago === 'error') {
    // Marcar pedido como fallido
    if (pedidoId && typeof db !== 'undefined' && db) {
      try {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
          await db.from('pedidos')
            .update({ estado: 'fallido' })
            .eq('id', pedidoId)
            .eq('user_id', session.user.id);
          localStorage.removeItem('pedido_pendiente_id');
        }
      } catch (e) {}
    }

    mostrarBannerPago(
      'Hubo un problema con el pago. Puedes intentarlo de nuevo.',
      'error'
    );
  }
}

function mostrarBannerPago(texto, tipo, linkTexto = '', linkUrl = '') {
  const main = document.querySelector('.carrito-page');
  if (!main) return;

  const banner = document.createElement('div');
  banner.className = `pago-banner pago-banner-${tipo}`;
  const icono = tipo === 'ok' ? '✓' : tipo === 'pendiente' ? '⏳' : '⚠';
  banner.innerHTML = `
    <span class="pago-banner-icono">${icono}</span>
    <span>${texto}</span>
    ${linkTexto ? `<a href="${linkUrl}" class="pago-banner-link">${linkTexto}</a>` : ''}
  `;
  main.prepend(banner);
}

/* ── Configurar botones ── */
function configurarPago() {
  const btn = document.getElementById("btn-pagar");

  // Modal de envío
  const btnConfEnvio   = document.getElementById("btn-confirmar-envio");
  const btnCerrarEnvio = document.getElementById("modal-envio-cerrar");
  const overlayEnvio   = document.getElementById("modal-envio-overlay");

  if (btn)            btn.addEventListener("click", iniciarPago);
  // La barra fija de celular dispara el mismo flujo de pago
  document.getElementById("cbp-btn")?.addEventListener("click", iniciarPago);
  if (btnConfEnvio)   btnConfEnvio.addEventListener("click", confirmarEnvioYPagar);
  if (btnCerrarEnvio) btnCerrarEnvio.addEventListener("click", cerrarFormularioEnvio);
  if (overlayEnvio)   overlayEnvio.addEventListener("click", e => {
    if (e.target === overlayEnvio) cerrarFormularioEnvio();
  });

  // Modal confirmar eliminar
  document.getElementById("btn-confirm-si")?.addEventListener("click", confirmarEliminar);
  document.getElementById("btn-confirm-no")?.addEventListener("click", cerrarConfirmEliminar);
  document.getElementById("modal-confirm-overlay")?.addEventListener("click", e => {
    if (e.target.id === "modal-confirm-overlay") cerrarConfirmEliminar();
  });
}

actualizarContador();
renderizarCarritoPage();
habilitarBotonPago();
configurarPago();

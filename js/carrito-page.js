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

  // Antes de pintar: agregar o retirar los regalos según el monto
  const desbloqueados = sincronizarRegalos();
  renderizarMetas();
  desbloqueados.forEach((m, i) => setTimeout(() => avisarRegalo(m, false), i * 900));

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="carrito-vacio-msg">Tu carrito está vacío. <a href="index.html#catalogo">Ver productos →</a></p>';
    if (totalEl) totalEl.textContent = "$0 CLP";
    renderizarSugeridos();
    actualizarBarraPago(0);
    return;
  }

  contenedor.innerHTML = carrito.map(item => {
    // Los regalos no se editan ni se eliminan: dependen del monto del pedido
    if (esRegalo(item)) {
      const meta = METAS_REGALO.find(m => m.id === String(item.id));
      return `
        <div class="carrito-page-item carrito-page-item-regalo">
          <span class="regalo-icono">${meta.emoji}</span>
          <div class="carrito-page-item-info">
            <p class="carrito-page-item-nombre">${item.nombre}</p>
            <p class="carrito-page-item-cat">Regalo sorpresa</p>
            <p class="carrito-page-item-precio regalo-gratis">GRATIS</p>
          </div>
          <span class="regalo-sello">Incluido</span>
        </div>`;
    }
    // Precio y cantidad van juntos dentro de la info: si el selector fuera
    // una columna del grid, se estiraría a todo el ancho disponible.
    return `
    <div class="carrito-page-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="carrito-page-item-info">
        <p class="carrito-page-item-nombre">${item.nombre}</p>
        <p class="carrito-page-item-cat">${categoriaDeItem(item)}</p>
        <div class="cpi-fila">
          <p class="carrito-page-item-precio">$${item.precio.toLocaleString("es-CL")}</p>
          <div class="cantidad-selector">
            <button onclick="cambiarCantidad(${item.id}, -1)" aria-label="Quitar uno">−</button>
            <span class="cantidad-valor">${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.id}, 1)" aria-label="Agregar uno">+</button>
          </div>
        </div>
      </div>
      <button class="carrito-page-item-eliminar" onclick="pedirConfirmacionEliminar(${item.id})" title="Eliminar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>`;
  }).join("");

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
   REGALOS POR MONTO
   Tres objetivos. Al alcanzar uno, el regalo se suma al pedido como
   producto de $0 y se avisa al cliente. Si el carrito baja del monto,
   el regalo se retira solo.
   ============================================= */
function sincronizarRegalos() {
  const r = ajustarRegalos(carrito);
  if (r.cambio) {
    carrito = r.lista;
    guardarCarrito();
    actualizarContador();
  }
  return r.nuevos;
}

function renderizarMetas() {
  const seccion = document.getElementById("metas");
  if (!seccion) return;

  const base = subtotalPagado(carrito);
  if (base <= 0) { seccion.hidden = true; return; }
  seccion.hidden = false;

  const tope = METAS_REGALO[METAS_REGALO.length - 1].monto;
  const avance = Math.min(100, (base / tope) * 100);
  const linea = document.getElementById("metas-linea-llena");
  if (linea) linea.style.width = avance + "%";

  // Cuánto falta para el próximo regalo
  const siguiente = METAS_REGALO.find(m => base < m.monto);
  const falta = document.getElementById("metas-falta");
  if (falta) {
    falta.textContent = siguiente
      ? `Te faltan $${(siguiente.monto - base).toLocaleString("es-CL")} para el próximo regalo`
      : "¡Desbloqueaste todos los regalos! 🎉";
  }

  const hitos = document.getElementById("metas-hitos");
  if (hitos) {
    hitos.innerHTML = METAS_REGALO.map(m => {
      const logrado = base >= m.monto;
      const pos = (m.monto / tope) * 100;
      return `
        <button type="button" class="meta-hito ${logrado ? "logrado" : ""}"
                style="left:${pos}%" data-meta="${m.id}"
                title="${logrado ? "¡Regalo desbloqueado! Toca para abrirlo" : "Compra $" + m.monto.toLocaleString("es-CL") + " para desbloquearlo"}">
          <span class="meta-emoji">${logrado ? m.emoji : "🔒"}</span>
          <span class="meta-monto">$${(m.monto / 1000)}k</span>
        </button>`;
    }).join("");
  }
}

// Al tocar un regalo desbloqueado se "abre" con una animación
function abrirRegalo(idMeta) {
  const meta = METAS_REGALO.find(m => m.id === idMeta);
  const btn = document.querySelector(`.meta-hito[data-meta="${idMeta}"]`);
  if (!meta || !btn || !btn.classList.contains("logrado")) return;

  btn.classList.remove("abriendo");
  void btn.offsetWidth;
  btn.classList.add("abriendo");
  avisarRegalo(meta, true);
}

/* Aviso propio de los regalos: más visible que el del carrito, porque
   es una buena noticia que conviene que el cliente note. */
function avisarRegalo(meta, esApertura) {
  let aviso = document.getElementById("aviso-regalo");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "aviso-regalo";
    aviso.className = "aviso-regalo";
    document.body.appendChild(aviso);
  }
  aviso.innerHTML = `
    <span class="aviso-regalo-emoji">${meta.emoji}</span>
    <div class="aviso-regalo-txt">
      <strong>${esApertura ? "Tu regalo sorpresa" : "¡Regalo desbloqueado!"}</strong>
      <small>${esApertura
        ? "Lo preparamos y va dentro de tu pedido 📦"
        : `Superaste $${meta.monto.toLocaleString("es-CL")} · ya está en tu carrito`}</small>
    </div>`;
  aviso.classList.remove("activo");
  void aviso.offsetWidth;
  aviso.classList.add("activo");
  clearTimeout(aviso._timer);
  aviso._timer = setTimeout(() => aviso.classList.remove("activo"), 4200);
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
const SUGERIDOS_TOPE_PRECIO = 20000;   // se ofrecen agregados baratos, no otra compra grande

let _ordenSugeridos = null;

function _barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderizarSugeridos() {
  const seccion = document.getElementById("sugeridos");
  const fila = document.getElementById("sugeridos-fila");
  if (!seccion || !fila || typeof productos === "undefined") return;

  // El orden se baraja una sola vez por visita: si se rehiciera en cada
  // cambio de cantidad, las tarjetas saltarían de lugar.
  if (!_ordenSugeridos) {
    const baratos = _barajar(productos.filter(p =>
      p.precio > 0 && (p.categoria === "exhibidores" || p.precio <= SUGERIDOS_TOPE_PRECIO)));
    const resto = productos
      .filter(p => p.precio > 0 && !baratos.includes(p))
      .sort((a, b) => a.precio - b.precio);
    _ordenSugeridos = [...baratos, ...resto];
  }

  const enCarrito = new Set(carrito.map(i => String(i.id)));
  const lista = _ordenSugeridos
    .filter(p => !enCarrito.has(String(p.id)))
    .slice(0, SUGERIDOS_MAX);

  if (!lista.length) { seccion.hidden = true; return; }

  seccion.hidden = false;
  const tarjetas = lista.map(p => `
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

  // Se duplica el contenido: al terminar la primera copia la animación
  // reinicia y el desplazamiento se ve continuo, sin saltos.
  fila.innerHTML = tarjetas + tarjetas;
  fila.style.animationDuration = Math.max(24, lista.length * 5) + "s";
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
/* ── Teléfono: código de país + número con la cantidad exacta de dígitos ── */
function _paisSeleccionado() {
  const sel = document.getElementById('env-tel-codigo');
  const codigo = sel ? sel.value : '+56';
  return CODIGOS_PAIS.find(p => p.codigo === codigo) || CODIGOS_PAIS[0];
}

function _poblarCodigosPais() {
  const sel = document.getElementById('env-tel-codigo');
  if (!sel || sel.options.length) return;
  sel.innerHTML = CODIGOS_PAIS.map(p =>
    `<option value="${p.codigo}" title="${p.pais}">${p.bandera} ${p.codigo}</option>`).join('');
  sel.value = '+56';   // Chile por defecto
}

function _actualizarPistaTelefono() {
  const p = _paisSeleccionado();
  const hint = document.getElementById('env-tel-hint');
  const tel  = document.getElementById('env-telefono-pago');
  if (hint) hint.textContent = `${p.digitos} dígitos, sin el código de país. Ej: ${p.ejemplo}`;
  if (tel) {
    tel.placeholder = p.ejemplo;
    tel.maxLength = p.digitos;
    // Si ya había un número más largo, se recorta al nuevo largo
    tel.value = tel.value.replace(/\D/g, '').slice(0, p.digitos);
  }
}

/* ── Región → Ciudad/Provincia → Comuna, en cascada ── */
function _poblarRegiones() {
  const sel = document.getElementById('env-region-pago');
  if (!sel || sel.options.length > 1) return;
  sel.innerHTML = '<option value="">Selecciona tu región</option>' +
    REGIONES_CHILE.map(r => `<option value="${r.region}">${r.region}</option>`).join('');
}

function _poblarCiudades(nombreRegion, preseleccion) {
  const sel = document.getElementById('env-ciudad-pago');
  if (!sel) return;
  const region = REGIONES_CHILE.find(r => r.region === nombreRegion);
  if (!region) {
    sel.innerHTML = '<option value="">Primero elige la región</option>';
    sel.disabled = true;
    _poblarComunas(null, null);
    return;
  }
  sel.disabled = false;
  sel.innerHTML = '<option value="">Selecciona ciudad o provincia</option>' +
    region.provincias.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
  if (preseleccion && region.provincias.some(p => p.nombre === preseleccion)) {
    sel.value = preseleccion;
  }
  _poblarComunas(nombreRegion, sel.value);
}

function _poblarComunas(nombreRegion, nombreCiudad, preseleccion) {
  const sel = document.getElementById('env-comuna-pago');
  if (!sel) return;
  const region = REGIONES_CHILE.find(r => r.region === nombreRegion);
  const prov = region && region.provincias.find(p => p.nombre === nombreCiudad);
  if (!prov) {
    sel.innerHTML = '<option value="">Primero elige la ciudad</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  sel.innerHTML = '<option value="">Selecciona tu comuna</option>' +
    prov.comunas.map(c => `<option value="${c}">${c}</option>`).join('');
  if (preseleccion && prov.comunas.includes(preseleccion)) sel.value = preseleccion;
}

function _bindRestricciones() {
  const get = id => document.getElementById(id);
  if (get('_restricciones_aplicadas')) return;

  // Solo letras y espacios
  const nom = get('env-nombre-pago');
  if (nom) nom.addEventListener('input', () => {
    nom.value = nom.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  });

  // Teléfono: solo dígitos, con el largo exacto del país elegido
  _poblarCodigosPais();
  _actualizarPistaTelefono();
  get('env-tel-codigo')?.addEventListener('change', _actualizarPistaTelefono);
  const tel = get('env-telefono-pago');
  if (tel) tel.addEventListener('input', () => {
    tel.value = tel.value.replace(/\D/g, '').slice(0, _paisSeleccionado().digitos);
  });

  // Ubicación en cascada
  _poblarRegiones();
  get('env-region-pago')?.addEventListener('change', e => _poblarCiudades(e.target.value));
  get('env-ciudad-pago')?.addEventListener('change', e =>
    _poblarComunas(get('env-region-pago').value, e.target.value));

  /* RUT: se formatea solo si lo escrito parece un RUT chileno (dígitos con
     dígito verificador). Un pasaporte tipo "AB123456" se deja intacto. */
  const rutEl = get('env-rut-pago');
  if (rutEl) rutEl.addEventListener('input', () => {
    const limpio = rutEl.value.replace(/[.\-\s]/g, '');
    if (/^[0-9]{1,8}[0-9kK]?$/.test(limpio)) rutEl.value = _formatearRut(rutEl.value);
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
    set('env-tel-codigo',       guardados.telCodigo);
    set('env-telefono-pago',    guardados.telNumero);
    set('env-rut-pago',         guardados.rut);
    set('env-correo-pago',      guardados.correo);
    // La ubicación se repuebla en cascada para que los selects tengan opciones
    if (guardados.region) {
      set('env-region-pago', guardados.region);
      _poblarCiudades(guardados.region, guardados.ciudad);
      _poblarComunas(guardados.region, guardados.ciudad, guardados.comuna);
    }
    _actualizarPistaTelefono();
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
  const telCodigo = document.getElementById('env-tel-codigo').value;
  const telNumero = document.getElementById('env-telefono-pago').value.trim();
  const telefono  = telCodigo + telNumero;
  const rut       = document.getElementById('env-rut-pago').value.trim();
  const region    = document.getElementById('env-region-pago').value;
  const ciudad    = document.getElementById('env-ciudad-pago').value;
  const comuna    = document.getElementById('env-comuna-pago').value;
  const correo    = document.getElementById('env-correo-pago').value.trim();
  const empresa   = document.getElementById('env-empresa-pago').value;
  const preferencia = document.getElementById('env-preferencia-pago').value;
  const sucursal  = document.getElementById('env-sucursal-pago').value.trim();
  const domicilio = document.getElementById('env-domicilio-pago').value.trim();

  const errEl = document.getElementById('env-form-error');
  const fail = msg => { errEl.textContent = msg; errEl.style.display = 'block'; };

  if (!nombre || !telNumero || !region || !ciudad || !comuna || !correo || !empresa) {
    return fail('Por favor completa todos los campos obligatorios (*)');
  }
  if (nombre.length < 3 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
    return fail('Nombre inválido. Solo letras y espacios (mín. 3 caracteres).');
  }
  const pais = _paisSeleccionado();
  if (!new RegExp(`^[0-9]{${pais.digitos}}$`).test(telNumero)) {
    return fail(`Teléfono inválido. Para ${pais.pais} son exactamente ${pais.digitos} dígitos (ej: ${pais.ejemplo}).`);
  }
  /* El RUT es opcional (hay clientes con documento extranjero). Solo se
     valida el dígito verificador cuando parece un RUT chileno; cualquier
     otro documento se acepta tal cual. */
  if (rut && /^[0-9.]+-?[0-9kK]$/.test(rut) && !_validarRut(rut)) {
    return fail('El RUT no es válido. Revisa el dígito verificador (ej: 12.345.678-9) o déjalo en blanco.');
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

  _datosEnvio = { nombre, telefono, telCodigo, telNumero, rut, region, ciudad, comuna,
                  correo, empresa, preferencia, sucursal, domicilio };

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
      estado.textContent = `⚠ ${err.message || 'Error al conectar con el medio de pago'}. Intenta nuevamente o escríbenos por WhatsApp.`;
      estado.style.color = "#dc2626";
    }
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#009EE3"/><path d="M13 24c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11S13 30.075 13 24z" fill="white"/><path d="M20 24l3 3 6-6" stroke="#009EE3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Realizar pago`;
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
    /* Quien confirma el pago es el webhook de MercadoPago. El navegador
       no debe marcar pedidos como pagados: además de duplicar la venta,
       permitiría dar por pagado un pedido sin haber pagado. */
    localStorage.removeItem('pedido_pendiente_id');

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

/* =============================================
   PAGO POR TRANSFERENCIA
   No se confirma el pedido en la web: se coordina por WhatsApp en 3
   pasos. Aquí se arma el texto para que el cliente lo copie y pegue
   sin tener que escribirlo todo de nuevo.
   ============================================= */
const WSP_NUMERO = "56966497904";

function textoPedidoTransferencia() {
  if (carrito.length === 0) return "";
  const lineas = carrito
    .filter(i => !esRegalo(i))
    .map(i => `• ${i.nombre} — x${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString("es-CL")}`);

  const subtotal = subtotalPagado(carrito);
  const regalos = carrito.filter(i => esRegalo(i)).map(i => `🎁 ${i.nombre}`);

  return [
    "Hola 👋 Quiero pagar por transferencia. Mi pedido:",
    "",
    ...lineas,
    ...(regalos.length ? ["", ...regalos] : []),
    "",
    `Total productos: $${subtotal.toLocaleString("es-CL")}`,
  ].join("\n");
}

function textoDatosTransferencia() {
  const v = id => (document.getElementById(id)?.value || "").trim();
  const codigo = v("env-tel-codigo");
  const numero = v("env-telefono-pago");

  /* Los selectores traen valores por defecto (empresa, tipo de entrega),
     así que no bastan para decir que el cliente "ya llenó sus datos":
     se exige al menos nombre o teléfono. */
  if (!v("env-nombre-pago") && !numero) return "";

  /* Mismo orden que usa la bodega al despachar en Starken, una línea por
     dato, para que se pueda pegar de corrido. */
  const esSucursal = v("env-preferencia-pago") === "Sucursal";
  const lineas = [
    [v("env-empresa-pago"), v("env-preferencia-pago")].filter(Boolean).join(" | "),
    v("env-nombre-pago"),
    numero ? codigo + numero : "",
    v("env-rut-pago"),
    [v("env-ciudad-pago"), v("env-comuna-pago")].filter(Boolean).join(", "),
    v("env-correo-pago"),
    esSucursal ? v("env-sucursal-pago") : v("env-domicilio-pago"),
  ];

  return lineas.filter(l => l && l.trim()).join("\n");
}

// Copia al portapapeles con respaldo para navegadores que no lo permiten
/* Copia con un campo temporal, dentro del mismo gesto del clic. Se intenta
   antes que navigator.clipboard porque esa promesa, si la ventana no tiene
   el foco, no resuelve ni falla y el botón se queda sin reaccionar. */
function _copiarConCampoTemporal(texto) {
  try {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);   // iOS necesita el rango explícito
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (_) {
    return false;
  }
}

function copiarAlPortapapeles(texto, boton) {
  const avisar = ok => {
    const original = boton.dataset.original || boton.textContent;
    boton.dataset.original = original;
    boton.textContent = ok ? "✅ Copiado" : "⚠ No se pudo copiar";
    boton.classList.toggle("copiado", ok);
    setTimeout(() => { boton.textContent = original; boton.classList.remove("copiado"); }, 2200);
  };

  if (_copiarConCampoTemporal(texto)) { avisar(true); return; }

  /* Con tiempo límite: sin el foco puesto, esta promesa no resuelve ni
     falla, y el botón se quedaba sin dar ninguna señal. */
  if (navigator.clipboard?.writeText) {
    let resuelto = false;
    const listo = ok => { if (!resuelto) { resuelto = true; avisar(ok); } };
    navigator.clipboard.writeText(texto).then(() => listo(true)).catch(() => listo(false));
    setTimeout(() => listo(false), 1200);
    return;
  }
  avisar(false);
}

function abrirModalTransferencia() {
  const overlay = document.getElementById("modal-transf-overlay");
  if (!overlay) return;

  const pedido = textoPedidoTransferencia();
  const enlace = `https://wa.me/${WSP_NUMERO}?text=${encodeURIComponent(pedido || "Hola 👋 Quiero pagar por transferencia.")}`;
  const wspPedido = document.getElementById("transf-wsp-pedido");
  const wspPrincipal = document.getElementById("transf-wsp-principal");
  if (wspPedido)    wspPedido.href = enlace;
  if (wspPrincipal) wspPrincipal.href = enlace;

  // Aviso si todavía no completó el formulario de envío
  const nota = document.getElementById("transf-nota-datos");
  const btnDatos = document.getElementById("transf-copiar-datos");
  const hayDatos = !!textoDatosTransferencia();
  if (nota) {
    nota.textContent = hayDatos
      ? ""
      : "Aún no has llenado tus datos. Puedes escribirlos en el formulario de envío y volver aquí, o mandárnoslos por WhatsApp.";
  }
  if (btnDatos) btnDatos.disabled = !hayDatos;

  overlay.classList.add("activo");
}

function cerrarModalTransferencia() {
  document.getElementById("modal-transf-overlay")?.classList.remove("activo");
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

  // Transferencia: se explica el proceso en vez de confirmar el pedido aquí
  document.getElementById("btn-transferencia")?.addEventListener("click", abrirModalTransferencia);
  document.getElementById("modal-transf-cerrar")?.addEventListener("click", cerrarModalTransferencia);
  document.getElementById("modal-transf-overlay")?.addEventListener("click", e => {
    if (e.target.id === "modal-transf-overlay") cerrarModalTransferencia();
  });
  document.getElementById("transf-copiar-pedido")?.addEventListener("click", e =>
    copiarAlPortapapeles(textoPedidoTransferencia(), e.currentTarget));
  document.getElementById("transf-copiar-datos")?.addEventListener("click", e =>
    copiarAlPortapapeles(textoDatosTransferencia(), e.currentTarget));

  // Los hitos se repintan seguido: se escucha en el contenedor
  document.getElementById("metas-hitos")?.addEventListener("click", e => {
    const hito = e.target.closest(".meta-hito");
    if (hito) abrirRegalo(hito.dataset.meta);
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

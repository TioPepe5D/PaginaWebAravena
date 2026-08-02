let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function inicializarCarrito() {
  actualizarContador();
  renderizarCarrito();

  document.getElementById("carrito-btn").addEventListener("click", abrirCarrito);
  document.getElementById("carrito-cerrar").addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-overlay").addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-seguir")?.addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-vaciar")?.addEventListener("click", vaciarCarrito);

  // Escape cierra el panel
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarCarrito();
  });

  // El botón de pago del panel es un enlace a carrito.html: ahí se piden
  // los datos de envío antes de ir a MercadoPago.
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  carrito = [];
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
  if (typeof renderizarProductos === "function") renderizarProductos();
}

const MAX_POR_ITEM = 10;

function _avisoLimite(nombre) {
  const t = document.createElement('div');
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

// Busca un producto en el catálogo activo (Supabase) con fallback al estático
function _buscarProducto(id) {
  const fuente = (typeof productosActivos !== "undefined" && productosActivos.length)
    ? productosActivos
    : (typeof productos !== "undefined" ? productos : []);
  return fuente.find(p => String(p.id) === String(id));
}

function agregarAlCarrito(id) {
  const producto = _buscarProducto(id);
  if (!producto) {
    console.warn("[Carrito] Producto no encontrado:", id);
    return;
  }

  const existente = carrito.find(p => String(p.id) === String(id));

  if (existente) {
    if (existente.cantidad >= MAX_POR_ITEM) {
      _avisoLimite(producto.nombre);
      return;
    }
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
  if (typeof renderizarProductos === "function") renderizarProductos();
  mostrarToast(producto.nombre);
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(p => String(p.id) === String(id));
  if (!item) return;
  if (delta > 0 && item.cantidad >= MAX_POR_ITEM) {
    _avisoLimite(item.nombre);
    return;
  }
  item.cantidad += delta;
  if (item.cantidad > MAX_POR_ITEM) item.cantidad = MAX_POR_ITEM;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(p => String(p.id) !== String(id));
  }
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
  if (typeof renderizarProductos === "function") renderizarProductos();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => String(p.id) !== String(id));
  guardarCarrito();
  actualizarContador();
  renderizarCarrito();
  if (typeof renderizarProductos === "function") renderizarProductos();
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const totalEl = document.getElementById("carrito-total");
  const badge = document.getElementById("carrito-header-badge");

  // Los regalos se agregan o retiran según cuánto suma el pedido
  const ajuste = ajustarRegalos(carrito);
  if (ajuste.cambio) {
    carrito = ajuste.lista;
    guardarCarrito();
  }

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  if (badge) badge.textContent = totalItems;

  const pie = document.querySelector(".carrito-panel .carrito-footer");

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Tu carrito está vacío</p>
        <a href="index.html#catalogo" class="carrito-vacio-cta">Ver catálogo</a>
      </div>`;
    if (totalEl) totalEl.textContent = "$0 CLP";
    // Sin productos no tiene sentido mostrar totales ni el botón de pago
    const desgloseVacio = document.getElementById("carrito-desglose");
    if (desgloseVacio) desgloseVacio.innerHTML = "";
    if (pie) pie.hidden = true;
    return;
  }
  if (pie) pie.hidden = false;

  /* Cada producto se desliza a la izquierda para descubrir el botón Eliminar,
     igual que en las apps nativas. El botón queda debajo, fijo. */
  contenedor.innerHTML = carrito.map(item => {
    // Un regalo no se edita ni se borra: aparece y desaparece con el monto
    if (esRegalo(item)) {
      const meta = metaDeRegalo(item);
      return `
        <div class="carrito-fila">
          <div class="carrito-item carrito-item-regalo">
            <span class="carrito-regalo-icono">${meta.emoji}</span>
            <div class="carrito-item-info">
              <p class="carrito-item-nombre">${item.nombre}</p>
              <p class="carrito-item-categoria">Regalo sorpresa</p>
              <div class="carrito-item-fila">
                <p class="carrito-item-precio regalo-gratis">GRATIS</p>
                <span class="regalo-sello-mini">Incluido</span>
              </div>
            </div>
          </div>
        </div>`;
    }
    return `
    <div class="carrito-fila" data-id="${item.id}">
      <button class="carrito-fila-borrar" onclick="eliminarDelCarrito(${item.id})" tabindex="-1" aria-label="Eliminar ${item.nombre}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
        <span>Eliminar</span>
      </button>
      <div class="carrito-item">
        <img src="${item.imagen}" alt="${item.nombre}">
        <div class="carrito-item-info">
          <p class="carrito-item-nombre">${item.nombre}</p>
          <p class="carrito-item-categoria">${item.categoria || ""}</p>
          <!-- Precio y cantidad en la misma línea: caben más productos a la vista -->
          <div class="carrito-item-fila">
            <p class="carrito-item-precio">$${item.precio.toLocaleString("es-CL")}</p>
            <div class="cantidad-selector">
              <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
              <span class="cantidad-valor">${item.cantidad}</span>
              <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </div>
          </div>
        </div>
        <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})" title="Eliminar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>`;
  }).join("");

  activarDeslizarParaEliminar(contenedor);

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision = Math.round(subtotal * 0.03);
  const total = subtotal + comision;

  const desglose = document.getElementById("carrito-desglose");
  if (desglose) {
    desglose.innerHTML = `
      <div class="carrito-desglose-row">
        <span>Subtotal</span>
        <span>$${subtotal.toLocaleString("es-CL")} CLP</span>
      </div>
      <div class="carrito-desglose-row">
        <span style="font-size:0.7rem">Comisión Bancaria</span>
        <span>$${comision.toLocaleString("es-CL")} CLP</span>
      </div>
    `;
  }

  if (totalEl) totalEl.textContent = "$" + total.toLocaleString("es-CL") + " CLP";
}

/* =============================================
   DESLIZAR PARA ELIMINAR
   Se arrastra la tarjeta hacia la izquierda y aparece el botón Eliminar.
   Si el gesto pasa la mitad del recorrido, queda abierto; si no, vuelve.
   ============================================= */
const CARRITO_ANCHO_BORRAR = 92;   // debe coincidir con el CSS

function activarDeslizarParaEliminar(contenedor) {
  contenedor.querySelectorAll(".carrito-fila").forEach(fila => {
    const tarjeta = fila.querySelector(".carrito-item");
    let inicioX = 0, inicioY = 0, desplazado = 0, arrastrando = false, decidido = false;

    const abrir  = () => { tarjeta.style.transform = `translateX(-${CARRITO_ANCHO_BORRAR}px)`; fila.classList.add("abierta"); };
    const cerrar = () => { tarjeta.style.transform = "translateX(0)"; fila.classList.remove("abierta"); };

    tarjeta.addEventListener("touchstart", e => {
      inicioX = e.touches[0].clientX;
      inicioY = e.touches[0].clientY;
      arrastrando = true;
      decidido = false;
      tarjeta.style.transition = "none";
    }, { passive: true });

    tarjeta.addEventListener("touchmove", e => {
      if (!arrastrando) return;
      const dx = e.touches[0].clientX - inicioX;
      const dy = e.touches[0].clientY - inicioY;

      // Hasta saber si el gesto es horizontal o vertical no se mueve nada:
      // así el scroll del panel sigue funcionando con normalidad.
      if (!decidido) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        decidido = true;
        if (Math.abs(dy) > Math.abs(dx)) { arrastrando = false; return; }
      }

      const base = fila.classList.contains("abierta") ? -CARRITO_ANCHO_BORRAR : 0;
      desplazado = Math.max(-CARRITO_ANCHO_BORRAR, Math.min(0, base + dx));
      tarjeta.style.transform = `translateX(${desplazado}px)`;
    }, { passive: true });

    tarjeta.addEventListener("touchend", () => {
      if (!arrastrando) return;
      arrastrando = false;
      tarjeta.style.transition = "";
      if (desplazado < -CARRITO_ANCHO_BORRAR / 2) abrir(); else cerrar();
      desplazado = 0;
    });

    // En computador, el botón de la papelera sigue estando a la vista
  });
}

function abrirCarrito() {
  document.getElementById("carrito-panel").classList.add("activo");
  document.getElementById("carrito-overlay").classList.add("activo");
  // Siempre desde el primer producto, no donde quedó el scroll anterior
  const items = document.getElementById("carrito-items");
  if (items) items.scrollTop = 0;
  // Con el panel abierto la página de atrás no debe desplazarse
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  document.getElementById("carrito-panel").classList.remove("activo");
  document.getElementById("carrito-overlay").classList.remove("activo");
  document.body.style.overflow = "";
}

function actualizarContador() {
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  const contador = document.getElementById("carrito-contador");
  if (!contador) return;
  contador.textContent = total;
  contador.classList.remove("pulse");
  void contador.offsetWidth;
  contador.classList.add("pulse");
}

async function iniciarPago() {
  const btn = document.getElementById("btn-pagar-sidebar");
  const estado = document.getElementById("btn-mp-estado");
  if (!btn || carrito.length === 0) return;

  btn.disabled = true;
  btn.textContent = "Procesando…";
  if (estado) estado.textContent = "";

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision = Math.round(subtotal * 0.03);
  const totalFinal = subtotal + comision;

  const items = carrito.map(i => ({
    id: String(i.id),
    title: i.nombre,
    quantity: i.cantidad,
    unit_price: i.precio,
    currency_id: "CLP"
  }));

  if (comision > 0) {
    items.push({
      id: "comision-bancaria",
      title: "Comisión Bancaria",
      quantity: 1,
      unit_price: comision,
      currency_id: "CLP"
    });
  }

  /* El pedido lo crea /api/crear-preferencia, no el navegador. Antes se
     insertaba aquí TAMBIÉN y quedaban dos filas por la misma compra: una
     la confirmaba el webhook y la otra el navegador al volver, así que la
     venta aparecía duplicada en el panel. */
  const pedidoId = localStorage.getItem('pedido_pendiente_id') || "";

  try {
    const res = await fetch("/api/crear-preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, pedidoId })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    window.location.href = data.init_point;
  } catch {
    if (estado) {
      estado.textContent = "⚠ Error al conectar. Intenta de nuevo.";
      estado.style.color = "#dc2626";
    }
    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#009EE3"/><path d="M13 24c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11S13 30.075 13 24z" fill="white"/><path d="M20 24l3 3 6-6" stroke="#009EE3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Realizar pago`;
  }
}

/* Aviso al agregar: confirma el producto y, sobre todo, señala dónde está
   el carrito para que el cliente sepa cómo llegar al pago. */
function mostrarToast(nombre) {
  let toast = document.getElementById("toast-carrito");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-carrito";
    toast.className = "toast-carrito";
    document.body.appendChild(toast);
  }

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  toast.innerHTML = `
    <span class="toast-check">✓</span>
    <span class="toast-txt">
      <strong>${nombre}</strong>
      <small>${totalItems} ${totalItems === 1 ? "producto" : "productos"} en tu carrito</small>
    </span>`;

  // Sale justo desde el ícono del carrito, como un aviso del sistema
  toast.classList.remove("activo");
  void toast.offsetWidth;
  toast.classList.add("activo");

  const ocultar = () => toast.classList.remove("activo");
  toast.onclick = () => {
    ocultar();
    if (document.getElementById("carrito-panel")) abrirCarrito();
    else window.location.href = "carrito.html";
  };

  // El ícono del carrito parpadea suave para que el cliente lo ubique
  const icono = document.getElementById("carrito-btn") || document.querySelector(".carrito-btn");
  if (icono) {
    icono.classList.remove("carrito-btn-guia");
    void icono.offsetWidth;
    icono.classList.add("carrito-btn-guia");
    setTimeout(() => icono.classList.remove("carrito-btn-guia"), 1800);
  }

  clearTimeout(toast._timer);
  toast._timer = setTimeout(ocultar, 3200);
}

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

  // El botón sidebar ahora es un enlace a carrito.html — no necesita listener
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

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  if (badge) badge.textContent = totalItems;

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p class='carrito-vacio'>Tu carrito está vacío</p>";
    if (totalEl) totalEl.textContent = "$0 CLP";
    return;
  }

  contenedor.innerHTML = carrito.map(item => `
    <div class="carrito-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="carrito-item-info">
        <p class="carrito-item-nombre">${item.nombre}</p>
        <p class="carrito-item-categoria">${item.categoria}</p>
        <p class="carrito-item-precio">$${item.precio.toLocaleString("es-CL")}</p>
        <div class="cantidad-selector">
          <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
          <span class="cantidad-valor">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
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
  `).join("");

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision = Math.round(subtotal * 0.05);
  const total = subtotal + comision;

  const desglose = document.getElementById("carrito-desglose");
  if (desglose) {
    desglose.innerHTML = `
      <div class="carrito-desglose-row">
        <span>Subtotal</span>
        <span>$${subtotal.toLocaleString("es-CL")} CLP</span>
      </div>
      <div class="carrito-desglose-row">
        <span style="font-size:0.7rem">Comisión Bancaria impuesto (5%)</span>
        <span>$${comision.toLocaleString("es-CL")} CLP</span>
      </div>
    `;
  }

  if (totalEl) totalEl.textContent = "$" + total.toLocaleString("es-CL") + " CLP";
}

function abrirCarrito() {
  document.getElementById("carrito-panel").classList.add("activo");
  document.getElementById("carrito-overlay").classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carrito-panel").classList.remove("activo");
  document.getElementById("carrito-overlay").classList.remove("activo");
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
  const comision = Math.round(subtotal * 0.05);
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
      title: "Comisión Bancaria impuesto",
      quantity: 1,
      unit_price: comision,
      currency_id: "CLP"
    });
  }

  // ── Guardar pedido pendiente en Supabase ──
  if (typeof db !== 'undefined' && db) {
    try {
      const { data: { session } } = await db.auth.getSession();
      if (session) {
        const itemsGuardar = carrito.map(i => ({
          id: i.id, nombre: i.nombre, cantidad: i.cantidad,
          precio: i.precio, imagen: i.imagen || ''
        }));
        const { data: pedido, error } = await db
          .from('pedidos')
          .insert({ user_id: session.user.id, items: itemsGuardar, total: totalFinal, estado: 'pendiente' })
          .select('id').single();
        if (!error && pedido) localStorage.setItem('pedido_pendiente_id', pedido.id);
      }
    } catch (e) { console.warn('[Pedidos] No se pudo guardar:', e); }
  }

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
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#009EE3"/><path d="M13 24c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11S13 30.075 13 24z" fill="white"/><path d="M20 24l3 3 6-6" stroke="#009EE3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Pagar`;
  }
}

function mostrarToast(nombre) {
  let toast = document.getElementById("toast-carrito");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-carrito";
    toast.className = "toast-carrito";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> ${nombre} agregado`;
  toast.classList.remove("activo");
  void toast.offsetWidth;
  toast.classList.add("activo");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("activo"), 2200);
}

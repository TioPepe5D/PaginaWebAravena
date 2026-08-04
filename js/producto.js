const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));
const producto = productos.find(p => p.id === id);

/* `carrito` ya lo declara cart.js, que se carga ANTES en esta página.
   Volver a declararlo con `let` lanzaba "Identifier 'carrito' has already
   been declared" y abortaba TODO producto.js: la ficha nunca renderizaba. */
let cantidadSeleccionada = 1;

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContadorHeader() {
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById("carrito-contador");
  if (el) el.textContent = total;
}

function agregarAlCarrito() {
  const existente = carrito.find(p => p.id === producto.id);
  if (existente) {
    existente.cantidad += cantidadSeleccionada;
  } else {
    carrito.push({ ...producto, cantidad: cantidadSeleccionada });
  }
  guardarCarrito();
  actualizarContadorHeader();

  const btn = document.getElementById("btn-agregar");
  btn.textContent = "✓ Agregado";
  btn.classList.add("agregado");
  setTimeout(() => {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Agregar al carrito';
    btn.classList.remove("agregado");
  }, 2000);
}

function renderizarProducto() {
  const contenedor = document.getElementById("producto-page");

  if (!producto) {
    contenedor.innerHTML = `
      <div class="producto-no-encontrado">
        <h2>Producto no encontrado</h2>
        <p><a href="index.html#catalogo">Volver al catálogo →</a></p>
      </div>`;
    return;
  }

  document.title = `${producto.nombre} — Joyería Aravena`;

  contenedor.innerHTML = `
    <p class="producto-breadcrumb">
      <a href="index.html">Inicio</a>
      <span>›</span>
      <a href="index.html#catalogo">Productos</a>
      <span>›</span>
      ${producto.nombre}
    </p>

    <div class="producto-grid">

      <div class="producto-imagen-wrap">
        <img src="${(window.imagenesOverride && window.imagenesOverride[producto.id]) || producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="producto-info-wrap">
        <p class="producto-categoria-tag">${producto.categoria}</p>
        <h1 class="producto-nombre-detalle">${producto.nombre}</h1>
        <p class="producto-precio-detalle">$${producto.precio.toLocaleString("es-CL")} CLP</p>
        <p class="producto-descripcion">${producto.descripcion}</p>

        <div>
          <p class="producto-cantidad-label">Cantidad</p>
          <div class="producto-cantidad-selector">
            <button id="btn-menos">−</button>
            <span class="producto-cantidad-valor" id="cantidad-display">1</span>
            <button id="btn-mas">+</button>
          </div>
        </div>

        <div class="producto-acciones">
          <button class="btn-agregar" id="btn-agregar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Agregar al carrito
          </button>
          <a href="carrito.html" class="btn-ver-carrito">Ver carrito</a>
        </div>

        <div class="producto-badges">
          <div class="producto-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span>Envíos a todo Chile</span>
          </div>
          <div class="producto-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Plata 925 certificada</span>
          </div>
          <div class="producto-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>100% artesanal — pieza única</span>
          </div>
        </div>
      </div>

    </div>
  `;

  document.getElementById("btn-menos").addEventListener("click", () => {
    if (cantidadSeleccionada > 1) cantidadSeleccionada--;
    document.getElementById("cantidad-display").textContent = cantidadSeleccionada;
  });

  document.getElementById("btn-mas").addEventListener("click", () => {
    cantidadSeleccionada++;
    document.getElementById("cantidad-display").textContent = cantidadSeleccionada;
  });

  document.getElementById("btn-agregar").addEventListener("click", agregarAlCarrito);
}

actualizarContadorHeader();
renderizarProducto();

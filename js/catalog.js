// Fuente de productos activa — se reemplaza con datos de Supabase si están disponibles
let productosActivos = typeof productos !== 'undefined' ? [...productos] : [];

async function cargarCatalogoDesdeSupa() {
  if (typeof db === 'undefined' || !db) return;
  try {
    const { data, error } = await db
      .from('catalogo')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      productosActivos = data.map(r => ({
        id: r.id,
        nombre: r.nombre || 'Sin nombre',
        precio: r.precio || 0,
        imagen: r.imagen_url,
        categoria: r.categoria || 'general',
        descripcion: r.descripcion || r.nombre || '',
        drive_file_id: r.drive_file_id,
      }));
    }
    // Si la tabla está vacía, usa el catálogo estático (products.js)
  } catch (e) { /* silencioso — usa estático */ }
}

function renderizarProductos() {
  const grid     = document.getElementById("productos-grid");
  const busqueda = (document.getElementById("filtro-nombre")?.value || "").toLowerCase();
  const orden    = document.getElementById("filtro-precio")?.value || "";

  let filtrados = [...productosActivos];

  if (busqueda) {
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(busqueda));
  }

  if (orden === "asc")  filtrados = filtrados.sort((a, b) => a.precio - b.precio);
  if (orden === "desc") filtrados = filtrados.sort((a, b) => b.precio - a.precio);

  if (filtrados.length === 0) {
    grid.innerHTML = "<p style='text-align:center;color:#888;padding:3rem 0'>No se encontraron productos con ese filtro.</p>";
    return;
  }

  grid.innerHTML = filtrados.map((producto, i) => {
    const enCarrito = (typeof carrito !== "undefined") ? carrito.find(p => p.id === producto.id) : null;
    const cantidad  = enCarrito ? enCarrito.cantidad : 0;
    const delay = i < 8 ? i * 60 : 0;
    const lazyAttr = i < 6 ? '' : 'loading="lazy" decoding="async"';
    const fetchPriority = i < 3 ? 'fetchpriority="high"' : '';
    const imgSrc = (window.imagenesOverride && window.imagenesOverride[producto.id]) || producto.imagen;
    return `
    <div class="producto-card animar${cantidad > 0 ? ' en-carrito' : ''}" style="transition-delay: ${delay}ms" data-id="${producto.id}">
      <div class="producto-card-img-wrap">
        <img src="${imgSrc}" alt="${producto.nombre}" ${lazyAttr} ${fetchPriority}>
        ${cantidad > 0 ? `<span class="badge-en-carrito">${cantidad}</span>` : ''}
        ${typeof iconCorazon === 'function' ? iconCorazon(producto.id) : ''}
      </div>
      <div class="producto-info">
        <p class="producto-categoria">${producto.categoria}</p>
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-precio">${producto.precio > 0 ? '$' + producto.precio.toLocaleString("es-CL") : '<span class="precio-consultar">Consultar precio</span>'}</p>
      </div>
      <div class="producto-card-btn-wrap">
        ${cantidad === 0 ? `
        <button class="btn-agregar-card" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Agregar al carrito
        </button>
        ` : `
        <div class="cantidad-selector cantidad-selector-card" onclick="event.stopPropagation()">
          <button onclick="event.stopPropagation(); cambiarCantidad(${producto.id}, -1)">−</button>
          <span class="cantidad-valor">${cantidad}</span>
          <button onclick="event.stopPropagation(); cambiarCantidad(${producto.id}, 1)">+</button>
        </div>
        `}
      </div>
    </div>
  `;
  }).join("");

  grid.querySelectorAll(".producto-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      abrirDetalleProducto(id);
    });
  });

  setTimeout(() => {
    grid.querySelectorAll(".animar").forEach(el => el.classList.add("visible"));
  }, 50);
}

function abrirDetalleProducto(id) {
  const producto = productosActivos.find(p => p.id === id);
  if (!producto) return;

  const panel    = document.getElementById("producto-detalle-panel");
  const overlay  = document.getElementById("producto-detalle-overlay");
  const contenido = document.getElementById("producto-detalle-contenido");

  const precioTexto = producto.precio > 0 ? `$${producto.precio.toLocaleString("es-CL")} CLP` : 'Consultar precio';
  const imagenUrl = producto.imagen.startsWith('http')
    ? producto.imagen
    : `https://joyasaravena.cl/${producto.imagen.replace(/^\//, '')}`;
  const msgWsp = encodeURIComponent(
    `Hola! Me interesa el *${producto.nombre}* (${precioTexto}). ¿Tiene disponibilidad?\n\n📸 ${imagenUrl}`
  );
  const linkWsp = `https://wa.me/56966497904?text=${msgWsp}`;

  contenido.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" class="detalle-imagen">
    <div class="detalle-info">
      <p class="detalle-categoria">${producto.categoria}</p>
      <h2 class="detalle-nombre">${producto.nombre}</h2>
      <p class="detalle-precio">${producto.precio > 0 ? '$' + producto.precio.toLocaleString("es-CL") + ' CLP' : '<span class="precio-consultar">Consultar precio</span>'}</p>
      <p class="detalle-descripcion">${producto.descripcion}</p>
      <div class="detalle-cantidad-wrap">
        <span class="detalle-cantidad-label">Cantidad</span>
        <div class="cantidad-selector">
          <button onclick="detalleCambiarCantidad(-1)">−</button>
          <span class="cantidad-valor" id="detalle-cantidad">1</span>
          <button onclick="detalleCambiarCantidad(1)">+</button>
        </div>
      </div>
      <div class="detalle-acciones">
        <button class="btn-detalle-agregar" id="btn-detalle-agregar" onclick="detalleAgregarAlCarrito(${producto.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Agregar al carrito
        </button>
        ${typeof iconCorazon === 'function' ? `
        <button class="btn-detalle-favorito${typeof favoritosSet !== 'undefined' && favoritosSet.has(String(producto.id)) ? ' favorito-activo' : ''}" data-fav-id="${producto.id}" onclick="toggleFavorito(${producto.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="${typeof favoritosSet !== 'undefined' && favoritosSet.has(String(producto.id)) ? 'currentColor' : 'none'}">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>` : ''}
      </div>
      <a class="btn-detalle-wsp" href="${linkWsp}" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.678 4.797 1.856 6.785L2 30l7.43-1.82A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.826-1.594l-.418-.248-4.33 1.062 1.094-4.212-.272-.432A11.467 11.467 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.29-8.634c-.344-.172-2.036-1.004-2.352-1.118-.316-.116-.546-.172-.776.172-.23.344-.892 1.118-1.094 1.348-.2.23-.402.258-.746.086-.344-.172-1.452-.536-2.766-1.706-1.022-.912-1.712-2.036-1.912-2.38-.2-.344-.022-.53.15-.702.154-.154.344-.402.516-.602.172-.2.23-.344.344-.574.116-.23.058-.43-.028-.602-.086-.172-.776-1.87-1.064-2.562-.28-.674-.564-.582-.776-.594-.2-.01-.43-.012-.66-.012s-.602.086-.918.43c-.316.344-1.204 1.176-1.204 2.868s1.232 3.326 1.404 3.556c.172.23 2.426 3.706 5.878 5.198.822.354 1.464.566 1.964.724.826.262 1.578.226 2.172.138.662-.1 2.036-.832 2.322-1.634.288-.802.288-1.49.202-1.634-.086-.144-.316-.23-.66-.402z"/>
        </svg>
        Consultar por WhatsApp
      </a>
      <div class="detalle-badges">
        <span>🚚 Envíos a todo Chile</span>
        <span>💎 Joyería mayorista</span>
        <span>📦 Precio de lote</span>
      </div>
    </div>
  `;

  panel.classList.add("activo");
  overlay.classList.add("activo");
  document.body.style.overflow = "hidden";
}

function cerrarDetalleProducto() {
  document.getElementById("producto-detalle-panel").classList.remove("activo");
  document.getElementById("producto-detalle-overlay").classList.remove("activo");
  document.body.style.overflow = "";
}

function detalleCambiarCantidad(delta) {
  const el = document.getElementById("detalle-cantidad");
  if (!el) return;
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  el.textContent = val;
}

function detalleAgregarAlCarrito(id) {
  const cantidad = parseInt(document.getElementById("detalle-cantidad").textContent) || 1;
  for (let i = 0; i < cantidad; i++) agregarAlCarrito(id);
  const btn = document.getElementById("btn-detalle-agregar");
  btn.textContent = "✓ Agregado";
  btn.style.backgroundColor = "#10b981";
  setTimeout(() => {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Agregar al carrito`;
    btn.style.backgroundColor = "";
  }, 1800);
}

function inicializarFiltros() {
  const rerender = () => renderizarProductos();
  document.getElementById("filtro-nombre")?.addEventListener("input",  rerender);
  document.getElementById("filtro-precio")?.addEventListener("change", rerender);
}

async function inicializarCatalogo() {
  // Mostrar catálogo estático primero (rápido)
  renderizarProductos();
  inicializarFiltros();
  inicializarAnimaciones();

  document.getElementById("producto-detalle-overlay").addEventListener("click", cerrarDetalleProducto);
  document.getElementById("producto-detalle-cerrar").addEventListener("click",  cerrarDetalleProducto);

  // Catálogo MANUAL: se usa js/products.js (estático). La sincronización automática
  // desde Supabase/Drive quedó desactivada. Para reactivarla, descomenta lo siguiente:
  // await cargarCatalogoDesdeSupa();
  // if (productosActivos.length > 0) renderizarProductos();
}

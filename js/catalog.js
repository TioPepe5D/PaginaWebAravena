// Fuente de productos activa — se baraja al cargar para que el orden sea aleatorio
let productosActivos = typeof productos !== 'undefined' ? barajar([...productos]) : [];

// Página de categoría: categoria.html#collares (el hash sobrevive a las
// redirecciones "clean URL" del servidor, que descartan ?c=)
const CATEGORIA_PAGINA = /categoria/.test(location.pathname)
  ? (location.hash.replace('#','') || new URLSearchParams(location.search).get('c') || '')
  : '';

// Paginación "Ver más" (grilla de búsqueda / página de categoría)
const PRODUCTOS_POR_TANDA = 12;
let productosVisibles = PRODUCTOS_POR_TANDA;
let esVerMas = false;

// Orden y etiquetas de las categorías del catálogo
// "todos" es especial: su página muestra el catálogo completo
const CATEGORIAS_META = [
  { key: "todos",       label: "Todos los Productos" },
  { key: "collares",    label: "Collares" },
  { key: "pulseras",    label: "Pulseras" },
  { key: "aros",        label: "Aros" },
  { key: "colgantes",   label: "Colgantes" },
  { key: "conjuntos",   label: "Conjuntos" },
  { key: "anillos",     label: "Anillos" },
  { key: "exhibidores", label: "Insumos" },
];

function etiquetaCategoria(key) {
  return (CATEGORIAS_META.find(c => c.key === key) || {}).label || key;
}

// Barajado Fisher–Yates: orden aleatorio en cada visita
function barajar(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reiniciarPaginacion() {
  productosVisibles = PRODUCTOS_POR_TANDA;
}

/* =============================================
   TARJETA DE PRODUCTO (compartida por grilla y carruseles)
   ============================================= */
function badgeCarritoHTML(cantidad) {
  return cantidad > 0 ? `<span class="badge-en-carrito">${cantidad}</span>` : '';
}

function btnWrapHTML(producto, cantidad) {
  if (cantidad === 0) {
    return `
        <button class="btn-agregar-card" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Agregar al carrito
        </button>`;
  }
  return `
        <div class="cantidad-selector-card" onclick="event.stopPropagation()">
          <button class="qty-btn qty-menos${cantidad === 1 ? ' qty-eliminar' : ''}" aria-label="${cantidad === 1 ? 'Quitar del carrito' : 'Restar uno'}" onclick="event.stopPropagation(); cambiarCantidad(${producto.id}, -1)">
            ${cantidad === 1
              ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>`
              : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`}
          </button>
          <span class="cantidad-valor">${cantidad}</span>
          <button class="qty-btn qty-mas" aria-label="Sumar uno" onclick="event.stopPropagation(); cambiarCantidad(${producto.id}, 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>`;
}

function tarjetaHTML(producto, opts = {}) {
  const enCarrito = (typeof carrito !== "undefined") ? carrito.find(p => p.id === producto.id) : null;
  const cantidad  = enCarrito ? enCarrito.cantidad : 0;
  const imgSrc = (window.imagenesOverride && window.imagenesOverride[producto.id]) || producto.imagen;
  const clases = ['producto-card'];
  if (opts.animar) clases.push('animar');
  if (opts.visible) clases.push('visible');
  if (cantidad > 0) clases.push('en-carrito');
  const delay = opts.delay ? ` style="transition-delay: ${opts.delay}ms"` : '';
  const lazy = opts.lazy === false ? '' : 'loading="lazy" decoding="async"';
  return `
    <div class="${clases.join(' ')}"${delay} data-id="${producto.id}">
      <div class="producto-card-img-wrap">
        <img src="${imgSrc}" alt="${producto.nombre}" ${lazy}>
        ${badgeCarritoHTML(cantidad)}
        ${typeof iconCorazon === 'function' ? iconCorazon(producto.id) : ''}
      </div>
      <div class="producto-info">
        <p class="producto-categoria">${etiquetaCategoria(producto.categoria)}</p>
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-precio">${producto.precio > 0 ? '$' + producto.precio.toLocaleString("es-CL") : '<span class="precio-consultar">Consultar precio</span>'}</p>
      </div>
      <div class="producto-card-btn-wrap">${btnWrapHTML(producto, cantidad)}</div>
    </div>`;
}

function activarClickTarjetas(cont) {
  cont.querySelectorAll(".producto-card").forEach(card => {
    if (card.dataset.click) return;
    card.dataset.click = "1";
    card.addEventListener("click", () => abrirDetalleProducto(parseInt(card.dataset.id)));
  });
}

/* =============================================
   FILAS POR CATEGORÍA — carruseles deslizantes
   ============================================= */
function renderizarFilas() {
  const cont = document.getElementById("categorias-filas");
  if (!cont) return;

  cont.innerHTML = CATEGORIAS_META.map((cat, i) => {
    // "todos": muestra del catálogo completo (16 al azar); su página lo trae entero
    const items = cat.key === 'todos'
      ? productosActivos.slice(0, 16)
      : productosActivos.filter(p => p.categoria === cat.key);
    if (!items.length) return '';
    // Dirección alternada: Collares →, Pulseras ←, Aros →, ...
    const dir = i % 2 === 0 ? 'marquee-izq' : 'marquee-der';
    // El contenido se duplica para que el bucle no tenga cortes
    const tarjetas = items.map(p => tarjetaHTML(p)).join('');
    // Velocidad proporcional a la cantidad (≈6s por tarjeta)
    const dur = Math.max(30, items.length * 6);
    return `
    <div class="cat-fila animar">
      <div class="cat-fila-head">
        <h3 class="cat-fila-titulo">${cat.label}</h3>
        <a class="cat-fila-link" href="categoria.html#${cat.key}">
          Ver todo
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
      <div class="marquee">
        <div class="marquee-track ${dir}" style="animation-duration: ${dur}s">
          ${tarjetas}${tarjetas}
        </div>
      </div>
    </div>`;
  }).join('');

  activarClickTarjetas(cont);
  cont.dataset.listo = "1";
  // Las filas aparecen con fade-up
  setTimeout(() => cont.querySelectorAll(".animar").forEach(el => el.classList.add("visible")), 50);
}

// Actualiza en su sitio las tarjetas de los carruseles (sin reiniciar la animación)
function refrescarTarjetasFilas() {
  const cont = document.getElementById("categorias-filas");
  if (!cont || !cont.dataset.listo) return;
  cont.querySelectorAll(".producto-card").forEach(card => {
    const id = parseInt(card.dataset.id);
    const producto = productosActivos.find(p => p.id === id);
    if (!producto) return;
    const enCarrito = (typeof carrito !== "undefined") ? carrito.find(p => p.id === id) : null;
    const cantidad = enCarrito ? enCarrito.cantidad : 0;
    card.classList.toggle('en-carrito', cantidad > 0);
    card.querySelector('.producto-card-btn-wrap').innerHTML = btnWrapHTML(producto, cantidad);
    const badge = card.querySelector('.badge-en-carrito');
    if (badge) badge.remove();
    if (cantidad > 0) card.querySelector('.producto-card-img-wrap').insertAdjacentHTML('beforeend', badgeCarritoHTML(cantidad));
  });
}

/* =============================================
   GRILLA (resultados de búsqueda / página de categoría)
   ============================================= */
function renderizarProductos() {
  const grid = document.getElementById("productos-grid");
  if (!grid) return;
  const busqueda = (document.getElementById("filtro-nombre")?.value || "").toLowerCase().trim();
  const filas = document.getElementById("categorias-filas");
  const verMasWrap = document.getElementById("ver-mas-wrap");

  // En la portada sin búsqueda: carruseles por categoría
  if (!CATEGORIA_PAGINA && !busqueda && filas) {
    filas.hidden = false;
    grid.hidden = true;
    if (verMasWrap) verMasWrap.hidden = true;
    if (!filas.dataset.listo) renderizarFilas();
    else refrescarTarjetasFilas();
    return;
  }

  // Grilla: búsqueda o página de categoría
  if (filas) filas.hidden = true;
  grid.hidden = false;
  if (verMasWrap) verMasWrap.hidden = false;

  let filtrados = [...productosActivos];
  if (CATEGORIA_PAGINA && CATEGORIA_PAGINA !== 'todos') {
    filtrados = filtrados.filter(p => p.categoria === CATEGORIA_PAGINA);
  }
  if (busqueda) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(busqueda));

  if (filtrados.length === 0) {
    grid.innerHTML = "<p style='text-align:center;color:#888;padding:3rem 0'>No se encontraron productos.</p>";
    actualizarVerMas(0, 0);
    return;
  }

  const total = filtrados.length;
  // En las páginas de categoría se ven TODAS las fotos de una (sin "Ver más")
  const mostrados = CATEGORIA_PAGINA ? total : Math.min(productosVisibles, total);
  const inicioNuevo = esVerMas ? Math.max(0, mostrados - PRODUCTOS_POR_TANDA) : 0;

  grid.innerHTML = filtrados.slice(0, mostrados).map((p, i) => {
    const yaVisible = i < inicioNuevo;
    const posNueva = i - inicioNuevo;
    return tarjetaHTML(p, {
      animar: true,
      visible: yaVisible,
      delay: (!yaVisible && posNueva < 8) ? posNueva * 60 : 0,
      lazy: i >= 6,
    });
  }).join("");

  activarClickTarjetas(grid);
  setTimeout(() => grid.querySelectorAll(".animar").forEach(el => el.classList.add("visible")), 50);
  actualizarVerMas(mostrados, total);
}

function actualizarVerMas(mostrados, total) {
  const wrap = document.getElementById("ver-mas-wrap");
  if (!wrap) return;
  if (total === 0 || mostrados >= total) {
    wrap.innerHTML = total > 0 ? `<p class="ver-mas-info">Mostrando las ${total} joyas</p>` : "";
    return;
  }
  const siguiente = Math.min(PRODUCTOS_POR_TANDA, total - mostrados);
  wrap.innerHTML = `
    <p class="ver-mas-info">Mostrando ${mostrados} de ${total} joyas</p>
    <button class="btn-ver-mas" onclick="verMas()">
      Ver ${siguiente} más
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>`;
}

function verMas() {
  esVerMas = true;
  productosVisibles += PRODUCTOS_POR_TANDA;
  renderizarProductos();
  esVerMas = false;
}

/* =============================================
   PANEL DE DETALLE
   ============================================= */
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
      <p class="detalle-categoria">${etiquetaCategoria(producto.categoria)}</p>
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

/* =============================================
   CLIENTES SATISFECHOS — carrusel de reseñas
   (Editable: cambia nombres, comunas, textos o fotos aquí)
   ============================================= */
const TESTIMONIOS = [
  { nombre: "Carolina M.", edad: 34, comuna: "Antofagasta", estrellas: 5, pedido: "Lote de conjuntos", texto: "Compré el lote de conjuntos para mi emprendimiento y volaron en una semana. La calidad de la plata es tal cual se ve en las fotos." },
  { nombre: "Javiera R.", edad: 27, comuna: "Puerto Montt", estrellas: 5, pedido: "Collares coquette", foto: "img/f59aada8-1ebf-4672-890c-8e861df5aa33.jpg", texto: "Llevo 6 meses comprando y siempre responden al tiro por WhatsApp. El despacho llegó en 2 días hasta el sur." },
  { nombre: "Marcela P.", edad: 45, comuna: "Providencia", estrellas: 5, pedido: "3 lotes en bodega", texto: "Fui a la bodega y la atención fue excelente. Revisé todo antes de llevarlo y salí feliz. Muy recomendados." },
  { nombre: "Daniela S.", edad: 31, comuna: "La Serena", estrellas: 4, pedido: "Aros Goldfield 18K", foto: "img/e79f4258-cf77-484c-b40a-c582c0728ef4.jpg", texto: "Los aros goldfield se venden solos. Me hubiera gustado más variedad de argollas grandes, pero la calidad 10/10." },
  { nombre: "Paulina V.", edad: 38, comuna: "Concepción", estrellas: 5, pedido: "Pulseras tenis", texto: "Las pulseras tenis son mi producto estrella en la feria. Precio mayorista real, se nota la diferencia con otros proveedores." },
  { nombre: "Katherine L.", edad: 29, comuna: "Temuco", estrellas: 5, pedido: "Collares de hombre", foto: "img/edfa520d-4008-41cd-83a3-ad8029697e16.jpg", texto: "Pedí collares de hombre para probar y mis clientes quedaron felices. El código de seguimiento llegó altiro." },
  { nombre: "Francisca A.", edad: 33, comuna: "Iquique", estrellas: 5, pedido: "Medio kilo mixto", texto: "El medio kilo mixto es la mejor inversión para empezar a revender. Llegó todo perfecto y bien embalado." },
  { nombre: "Valentina C.", edad: 26, comuna: "Rancagua", estrellas: 5, pedido: "Lote 11 conjuntos", foto: "img/c9621c1b-ea8d-4295-908d-15a368375ef0.jpg", texto: "Súper contenta, ya es mi tercer pedido. La plata SL 925 mantiene el brillo y no se pone negra como otras." },
  { nombre: "Constanza D.", edad: 41, comuna: "Valdivia", estrellas: 5, pedido: "Rosarios oro 18K", texto: "Los rosarios en oro goldfield son preciosos y se venden muy bien para regalo. Atención de primera." },
  { nombre: "Camila F.", edad: 30, comuna: "Coquimbo", estrellas: 4, pedido: "Pulseras + argollas", texto: "Buena relación precio-calidad. El envío por Starken llegó en 3 días hábiles tal como dijeron." },
];

function estrellasHTML(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function renderizarTestimonios() {
  const track = document.getElementById("testimonios-track");
  if (!track) return;
  const tarjetas = TESTIMONIOS.map(t => `
    <div class="testi-card${t.foto ? '' : ' testi-solo-texto'}">
      <div class="testi-top">
        <span class="testi-avatar">${t.nombre.charAt(0)}</span>
        <div class="testi-datos">
          <strong>${t.nombre}</strong>
          <small>${t.edad} años · ${t.comuna}</small>
        </div>
        <span class="testi-check" title="Compra verificada">✓</span>
      </div>
      <div class="testi-estrellas" aria-label="${t.estrellas} de 5 estrellas">${estrellasHTML(t.estrellas)}</div>
      <p class="testi-texto">“${t.texto}”</p>
      ${t.foto ? `<img class="testi-producto" src="${t.foto}" alt="Pedido de ${t.nombre}" loading="lazy" decoding="async">` : ''}
      <p class="testi-pedido">🛍️ Compró: <strong>${t.pedido}</strong></p>
    </div>`).join("");
  track.innerHTML = tarjetas + tarjetas;
}

function inicializarFiltros() {
  // La búsqueda alterna entre carruseles y grilla de resultados
  document.getElementById("filtro-nombre")?.addEventListener("input", () => {
    reiniciarPaginacion();
    renderizarProductos();
  });
}

async function inicializarCatalogo() {
  // Página de categoría: título según ?c=
  if (CATEGORIA_PAGINA) {
    const titulo = document.getElementById("catalogo-titulo");
    if (titulo) titulo.textContent = etiquetaCategoria(CATEGORIA_PAGINA);
    document.title = etiquetaCategoria(CATEGORIA_PAGINA) + " — Joyería Aravena";
  }

  renderizarProductos();
  renderizarTestimonios();
  inicializarFiltros();
  // Nota: NO se llama a inicializarAnimaciones() aquí. main.js ya la llama
  // justo después de esta función (con los productos ya en el DOM).

  document.getElementById("producto-detalle-overlay")?.addEventListener("click", cerrarDetalleProducto);
  document.getElementById("producto-detalle-cerrar")?.addEventListener("click",  cerrarDetalleProducto);
}

// Fuente de productos activa — se baraja al cargar para que el orden sea aleatorio
let productosActivos = typeof productos !== 'undefined' ? barajar([...productos]) : [];

// Página de categoría: categoria.html#collares (el hash sobrevive a las
// redirecciones "clean URL" del servidor, que descartan ?c=)
const CATEGORIA_PAGINA = /categoria/.test(location.pathname)
  ? (location.hash.replace('#','') || new URLSearchParams(location.search).get('c') || '')
  : '';

// Orden por precio en las páginas de categoría: "" | "asc" | "desc"
let ordenPrecio = "";

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
  // Esta agrupa por material, no por tipo de joya
  { key: "oro-gf",      label: "Oro GF 18K", material: "oro-goldfit" },
  { key: "exhibidores", label: "Insumos" },
];

function etiquetaCategoria(key) {
  return (CATEGORIAS_META.find(c => c.key === key) || {}).label || key;
}

/* Devuelve los productos de una categoría. Algunas agrupan por material
   (Oro GF 18K) en vez de por tipo de joya. */
function productosDeCategoria(key, fuente) {
  const lista = fuente || productosActivos;
  if (!key || key === "todos") return [...lista];
  const meta = CATEGORIAS_META.find(c => c.key === key);
  if (meta && meta.material) return lista.filter(p => p.material === meta.material);
  return lista.filter(p => p.categoria === key);
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
      : productosDeCategoria(cat.key);
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
  if (typeof inicializarCarruseles === "function") inicializarCarruseles(cont);
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

  let filtrados = CATEGORIA_PAGINA
    ? productosDeCategoria(CATEGORIA_PAGINA)
    : [...productosActivos];
  if (busqueda) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(busqueda));

  // Orden por precio (solo en las páginas de categoría). Los productos sin
  // precio quedan al final en ambos sentidos: no aportan a la comparación.
  if (ordenPrecio) {
    filtrados.sort((a, b) => {
      if (!a.precio) return 1;
      if (!b.precio) return -1;
      return ordenPrecio === "asc" ? a.precio - b.precio : b.precio - a.precio;
    });
  }

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
/* =============================================
   DESCRIPCIÓN DEL PRODUCTO
   En el catálogo la descripción venía igual al nombre, así que no
   aportaba nada. Se arma con la información real de cada material
   (la misma del FAQ) para que el cliente sepa qué está comprando.
   ============================================= */
const MATERIALES_INFO = {
  'plata-italiana': {
    etiqueta: 'Plata Italiana 925',
    texto: '92,5% de plata sólida de alta pureza, importada desde Italia. Es fundible y tiene garantía de por vida.',
  },
  'plata-nacional': {
    etiqueta: 'Plata Nacional SL 925',
    texto: 'Laminado en plata con sello «SL 925» sobre base de alpaca o latón, con barniz diamante protector para más brillo y duración. Garantía de 1 año.',
  },
  'oro-goldfit': {
    etiqueta: 'Oro Laminado GF 18K',
    texto: 'Laminado de oro italiano 18K con sello «GF 18K» sobre base de latón. Garantía de 2 años.',
  },
  accesorio: {
    etiqueta: 'Insumo',
    texto: 'Complemento para exhibir, guardar o presentar tus joyas.',
  },
};

const CATEGORIA_SINGULAR = {
  collares: 'collares', pulseras: 'pulseras', aros: 'aros',
  colgantes: 'colgantes', conjuntos: 'conjuntos', anillos: 'anillos',
  exhibidores: 'insumos',
};

function descripcionProducto(p) {
  // Si algún día hay una descripción escrita a mano, esa manda
  if (p.descripcion && p.descripcion.trim() !== p.nombre.trim()) return p.descripcion;

  const mat = MATERIALES_INFO[p.material];
  const cat = CATEGORIA_SINGULAR[p.categoria] || 'joyas';
  const esLote = /lote|set|pack/i.test(p.nombre);

  const partes = [];
  if (esLote) {
    partes.push(`Lote de ${cat}${mat ? ' en ' + mat.etiqueta : ''}, pensado para revender con buen margen: recibes varias piezas a precio mayorista en una sola compra.`);
  } else if (mat) {
    partes.push(`${p.nombre}, elaborado en ${mat.etiqueta}.`);
  }
  if (mat) partes.push(mat.texto);

  return partes.join(' ');
}

/* Lo que la empresa entrega junto al producto. Reemplaza a los tres
   badges sueltos ("Envíos a todo Chile / Joyería mayorista / Precio de
   lote"), que repetían lo mismo sin decir nada concreto. */
function beneficiosProducto(p) {
  const mat = MATERIALES_INFO[p.material];
  const garantias = {
    'plata-italiana': 'Garantía de por vida contra fallas de fábrica',
    'plata-nacional': 'Garantía de 1 año contra fallas de fábrica',
    'oro-goldfit':    'Garantía de 2 años contra fallas de fábrica',
  };

  const items = [];
  if (garantias[p.material]) {
    items.push({ icono: '🛡️', titulo: garantias[p.material],
                 detalle: 'Broche suelto, oscurecimiento o corte en el conector' });
  }
  items.push(
    { icono: '💰', titulo: 'Precio mayorista real',
      detalle: 'El mismo valor que en bodega, sin intermediarios' },
    { icono: '🚚', titulo: 'Despachamos a todo Chile',
      detalle: 'Martes, jueves y sábado · llega en 1 a 3 días hábiles' },
    { icono: '🎁', titulo: 'Regalos desde $50.000',
      detalle: 'Se suman solos a tu carrito al llegar al monto' },
    { icono: '💳', titulo: 'Paga con débito, crédito o transferencia',
      detalle: 'Compra mínima: 1 lote' },
    { icono: '🏬', titulo: 'También puedes retirar en bodega',
      detalle: 'Fidel Oteiza 1921, Of. 1003 · Metro Pedro de Valdivia' },
  );
  return items;
}

function abrirDetalleProducto(id) {
  const producto = productosActivos.find(p => p.id === id);
  if (!producto) return;

  const panel    = document.getElementById("producto-detalle-panel");
  const overlay  = document.getElementById("producto-detalle-overlay");
  const contenido = document.getElementById("producto-detalle-contenido");

  contenido.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" class="detalle-imagen">
    <div class="detalle-info">
      <p class="detalle-categoria">${etiquetaCategoria(producto.categoria)}</p>
      <h2 class="detalle-nombre">${producto.nombre}</h2>
      <p class="detalle-precio">${producto.precio > 0 ? '$' + producto.precio.toLocaleString("es-CL") + ' CLP' : '<span class="precio-consultar">Consultar precio</span>'}</p>
      <p class="detalle-descripcion">${descripcionProducto(producto)}</p>
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
      <div class="detalle-beneficios">
        <p class="detalle-beneficios-titulo">Comprando en Joyería Aravena</p>
        ${beneficiosProducto(producto).map(b => `
        <div class="detalle-beneficio">
          <span class="detalle-beneficio-icono">${b.icono}</span>
          <span class="detalle-beneficio-txt">
            <strong>${b.titulo}</strong>
            <small>${b.detalle}</small>
          </span>
        </div>`).join('')}
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
  if (typeof inicializarCarruseles === "function") inicializarCarruseles(track.parentElement);
}

function inicializarFiltros() {
  // La búsqueda alterna entre carruseles y grilla de resultados
  document.getElementById("filtro-nombre")?.addEventListener("input", () => {
    reiniciarPaginacion();
    renderizarProductos();
  });

  // Orden por precio (páginas de categoría)
  document.getElementById("orden-botones")?.addEventListener("click", e => {
    const btn = e.target.closest(".orden-btn");
    if (!btn) return;
    ordenPrecio = btn.dataset.orden;
    document.querySelectorAll(".orden-btn").forEach(b => b.classList.toggle("activo", b === btn));
    reiniciarPaginacion();
    renderizarProductos();
  });
}

async function inicializarCatalogo() {
  /* Los navegadores restauran el texto de los formularios al volver atrás
     (y a veces al recargar). Si el buscador arranca con texto, la portada
     muestra la grilla de resultados y esconde TODAS las categorías: ese
     era el bug intermitente en celular. Se limpia antes de pintar. */
  const buscador = document.getElementById("filtro-nombre");
  if (buscador && buscador.value) buscador.value = "";

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

  /* Al volver con el botón "atrás" la página sale de la caché sin volver a
     inicializarse: hay que limpiar el buscador y repintar a mano. */
  window.addEventListener("pageshow", e => {
    if (!e.persisted) return;
    const inp = document.getElementById("filtro-nombre");
    if (inp && inp.value) { inp.value = ""; reiniciarPaginacion(); }
    renderizarProductos();
  });
}

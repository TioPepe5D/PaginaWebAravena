/* =============================================
   BUSCADOR GLOBAL
   Funciona en todas las páginas: sugiere productos, categorías y
   páginas del sitio. En la portada, además filtra la grilla (eso lo
   hace catalog.js con su propio listener sobre #filtro-nombre).
   ============================================= */

const BUSCADOR_MAX_PRODUCTOS = 6;

// Páginas del sitio, con palabras clave para que se encuentren igual
// aunque el cliente no escriba el título exacto.
const PAGINAS_SITIO = [
  { titulo: "Inicio",                  href: "index.html",       claves: "inicio portada home principal" },
  { titulo: "Preguntas frecuentes",    href: "faq.html",         claves: "preguntas frecuentes faq dudas ayuda consultas" },
  { titulo: "Políticas de envío",      href: "faq.html#envios",  claves: "envio envios despacho starken chilexpress entrega demora plazo seguimiento" },
  { titulo: "Cambios y devoluciones",  href: "faq.html#cambios", claves: "cambio cambios devolucion devoluciones garantia reembolso" },
  { titulo: "Contacto",                href: "contacto.html",    claves: "contacto whatsapp correo mail telefono escribir hablar" },
  { titulo: "Mi carrito",              href: "carrito.html",     claves: "carrito compra pedido pagar checkout" },
  { titulo: "Mi cuenta",               href: "perfil.html",      claves: "cuenta perfil usuario sesion favoritos pedidos" },
];

// "Cadenitas" y "Cadenita" deben encontrar lo mismo: se quitan tildes
// y se pasa a minúsculas antes de comparar.
const DIACRITICOS = new RegExp("[\u0300-\u036f]", "g");
function normalizar(texto) {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .trim();
}

function categoriasBuscables() {
  if (typeof CATEGORIAS_META === "undefined") return [];
  return CATEGORIAS_META.map(c => ({
    titulo: c.label,
    href: c.key === "todos" ? "categoria.html#todos" : "categoria.html#" + c.key,
    claves: c.key,
  }));
}

function buscarEnSitio(consulta) {
  const q = normalizar(consulta);
  if (q.length < 2) return { productos: [], enlaces: [] };

  // Cada palabra debe aparecer en algún campo: "collar plata" no exige el orden
  const palabras = q.split(/\s+/);
  const coincide = (texto) => {
    const t = normalizar(texto);
    return palabras.every(p => t.includes(p));
  };

  const lista = (typeof productos !== "undefined") ? productos : [];
  const encontrados = lista.filter(p =>
    coincide(`${p.nombre} ${p.categoria} ${p.material} ${p.descripcion || ""}`)
  );

  const enlaces = [...categoriasBuscables(), ...PAGINAS_SITIO]
    .filter(pg => coincide(`${pg.titulo} ${pg.claves}`))
    .slice(0, 4);

  return { productos: encontrados, enlaces };
}

function precioTextoBusqueda(p) {
  return p.precio > 0 ? "$" + p.precio.toLocaleString("es-CL") : "Consultar precio";
}

function pintarPanelBusqueda(panel, consulta) {
  const { productos: prods, enlaces } = buscarEnSitio(consulta);

  if (!prods.length && !enlaces.length) {
    panel.innerHTML = `<p class="bpanel-vacio">Sin resultados para “${consulta}”.</p>`;
    panel.classList.add("activo");
    return;
  }

  let html = "";

  if (prods.length) {
    html += `<p class="bpanel-titulo">Productos${prods.length > BUSCADOR_MAX_PRODUCTOS ? ` (${prods.length})` : ""}</p>`;
    html += prods.slice(0, BUSCADOR_MAX_PRODUCTOS).map(p => `
      <a class="bpanel-item" href="producto.html?id=${p.id}">
        <img src="${p.imagen}" alt="" loading="lazy" decoding="async">
        <span class="bpanel-item-txt">
          <strong>${p.nombre}</strong>
          <small>${precioTextoBusqueda(p)}</small>
        </span>
      </a>`).join("");
  }

  if (enlaces.length) {
    html += `<p class="bpanel-titulo">Secciones</p>`;
    html += enlaces.map(pg => `
      <a class="bpanel-item bpanel-item-link" href="${pg.href}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span class="bpanel-item-txt"><strong>${pg.titulo}</strong></span>
      </a>`).join("");
  }

  panel.innerHTML = html;
  panel.classList.add("activo");
}

function inicializarBuscadorGlobal() {
  const input = document.getElementById("filtro-nombre");
  const caja = input && input.closest(".header-buscador");
  if (!caja) return;

  const panel = document.createElement("div");
  panel.className = "buscador-panel";
  panel.id = "buscador-panel";
  caja.appendChild(panel);

  const cerrar = () => panel.classList.remove("activo");

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 2) { cerrar(); return; }
    pintarPanelBusqueda(panel, q);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim().length >= 2) pintarPanelBusqueda(panel, input.value.trim());
  });

  // Enter abre el primer resultado
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { cerrar(); input.blur(); return; }
    if (e.key === "Enter") {
      const primero = panel.querySelector(".bpanel-item");
      if (primero) { e.preventDefault(); window.location.href = primero.getAttribute("href"); }
    }
  });

  document.addEventListener("click", (e) => {
    if (!caja.contains(e.target)) cerrar();
  });
}

// Se auto-inicializa: hay páginas (carrito, perfil, producto…) que no cargan main.js
document.addEventListener("DOMContentLoaded", inicializarBuscadorGlobal);

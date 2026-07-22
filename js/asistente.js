/* =============================================
   ASISTENTE DE CONSULTAS RÁPIDAS
   Responde con la información que ya existe en el sitio (FAQ, datos de
   contacto y catálogo). No usa servicios externos: todo corre en el
   navegador, así que es instantáneo y nunca inventa datos.
   Si no encuentra respuesta, deriva a WhatsApp.
   ============================================= */

const ASIS_WHATSAPP = "https://wa.me/56966497904?text=Hola%2C%20tengo%20una%20consulta";

/* Base de conocimiento: cada tema tiene palabras clave y su respuesta.
   Las claves se comparan sin tildes y en minúsculas. */
const ASIS_TEMAS = [
  {
    id: "ubicacion",
    titulo: "¿Dónde están ubicados?",
    claves: "donde estan ubicacion ubicados direccion bodega local tienda oficina llegar metro presencial visitar",
    respuesta: `Estamos en <strong>Fidel Oteiza 1921, piso 10, oficina 1003, Providencia</strong>, a pasos del 🚇 Metro Pedro de Valdivia.`,
    enlaces: [{ texto: "Ver en Google Maps", href: "https://www.google.com/maps/search/?api=1&query=Fidel+Oteiza+1921%2C+Providencia%2C+Santiago%2C+Chile", externo: true }],
  },
  {
    id: "horario",
    titulo: "¿Cuál es el horario?",
    claves: "horario hora abren cierran atienden atencion abierto dias sabado domingo",
    respuesta: `<strong>Lunes a viernes</strong> de 10:00 a 19:30 hrs.<br><strong>Sábado</strong> de 10:00 a 16:30 hrs.`,
  },
  {
    id: "atencion",
    titulo: "¿Cómo es la atención en bodega?",
    claves: "atencion bodega orden llegada carnet acompanante agende diego como comprar presencial reserva cita",
    respuesta: `La atención es <strong>por orden de llegada</strong> y debes traer tu carnet. Al llegar di <em>"Agende con Diego"</em> y un vendedor te atenderá. Máximo 1 acompañante por cliente.`,
  },
  {
    id: "pago",
    titulo: "¿Qué medios de pago aceptan?",
    claves: "pago pagar medios tarjeta credito debito efectivo transferencia mercadopago como pago formas",
    respuesta: `<strong>En bodega:</strong> efectivo y transferencia.<br><strong>En la web:</strong> tarjetas de débito y crédito por MercadoPago, o transferencia coordinándola por WhatsApp.`,
  },
  {
    id: "minimo",
    titulo: "¿Hay compra mínima?",
    claves: "minimo minima compra cantidad lote lotes cuanto minimo comprar mayorista por mayor",
    respuesta: `Sí, la compra mínima es <strong>1 lote</strong>. Todos nuestros precios son al por mayor.`,
  },
  {
    id: "envios",
    titulo: "¿Hacen envíos?",
    claves: "envio envios despacho despachan mandan region regiones starken bluexpress chilexpress correos envian",
    respuesta: `Sí, enviamos <strong>a todo Chile</strong> por Starken, Bluexpress, Chilexpress y Correos de Chile.`,
    enlaces: [{ texto: "Ver políticas de envío", href: "faq.html#envios" }],
  },
  {
    id: "demora",
    titulo: "¿Cuánto demora el envío?",
    claves: "demora cuanto tarda dias llega tiempo plazo despachan cuando envian seguimiento rastreo codigo",
    respuesta: `Despachamos <strong>martes, jueves y sábado</strong>. El pedido llega entre <strong>1 y 3 días hábiles</strong>. Te enviamos el código de seguimiento para que lo rastrees.`,
  },
  {
    id: "garantia",
    titulo: "¿Qué cubre la garantía?",
    claves: "garantia cubre falla fabrica broche suelta oscurece corta roto defecto",
    respuesta: `Cubre <strong>fallas de fábrica</strong>: broche que se suelta, producto que se oscurece o que se corta en el conector del broche o colgante. Válida por <strong>1 año</strong> desde la compra.<br><br>No cubre productos cortados por mal uso, contacto con ácidos o químicos, ni piedras que se caen.`,
    enlaces: [{ texto: "Ver garantía completa", href: "faq.html#cambios" }],
  },
  {
    id: "cambios",
    titulo: "¿Puedo cambiar o devolver?",
    claves: "cambio cambiar devolucion devolver devuelven reembolso dinero retracto arrepenti",
    respuesta: `Puedes cambiar <strong>máximo 1 producto no vendido por cada compra</strong>, siempre que esté en perfectas condiciones.<br><br>No realizamos devolución de dinero por ningún producto.`,
    enlaces: [{ texto: "Ver política de cambios", href: "faq.html#cambios" }],
  },
  {
    id: "plata-italiana",
    titulo: "¿Qué es la Plata Italiana 925?",
    claves: "plata italiana italia premium pureza fundible solida",
    respuesta: `Es nuestra <strong>línea premium</strong>: 92,5% de plata sólida de alta pureza, importada desde Italia, fundible y <strong>garantizada de por vida</strong>.`,
  },
  {
    id: "plata-nacional",
    titulo: "¿Qué es la Plata Nacional SL 925?",
    claves: "plata nacional sl925 925 laminado alpaca laton barniz diamante vendida",
    respuesta: `Nuestra <strong>línea más vendida</strong>: laminado en plata con sello "SL 925", base de alpaca o latón y barniz diamante protector. Garantía de <strong>1 año</strong>. La mejor opción precio-calidad.`,
  },
  {
    id: "oro",
    titulo: "¿Qué es el Oro Laminado GF 18K?",
    claves: "oro goldfit goldfield gf 18k laminado dorado amarillo",
    respuesta: `Laminado de oro italiano 18K con sello "GF 18K" sobre base de latón. Garantía de <strong>2 años</strong>. La alternativa accesible con look de oro.`,
  },
  {
    id: "cuidado",
    titulo: "¿Cómo cuido mis joyas?",
    claves: "cuidado cuidar limpiar mantener duren negro oxida guardar paño evitar quimicos agua piscina perfume",
    respuesta: `Límpialas con un paño de microfibra, guárdalas secas y por separado. Póntelas <strong>después</strong> de perfumes y cremas.<br><br>Evita cloro, alcohol, agua prolongada (piscina, mar, ducha), y dormir o hacer ejercicio con ellas.`,
    enlaces: [{ texto: "Ver todos los cuidados", href: "faq.html" }],
  },
  {
    id: "contacto",
    titulo: "Hablar con una persona",
    claves: "contacto telefono correo mail whatsapp hablar persona humano asesor vendedor llamar escribir",
    respuesta: `📱 <strong>+56 9 6649 7904</strong><br>✉️ <strong>Contacto@JoyasAravena.cl</strong>`,
    enlaces: [{ texto: "Escribir por WhatsApp", href: ASIS_WHATSAPP, externo: true }],
  },
];

// Temas que se ofrecen como botones al abrir el chat
const ASIS_SUGERENCIAS = ["envios", "demora", "ubicacion", "pago", "cambios", "minimo"];

const DIACRITICOS_ASIS = new RegExp("[\u0300-\u036f]", "g");
function asisNormalizar(t) {
  return (t || "").toString().normalize("NFD").replace(DIACRITICOS_ASIS, "").toLowerCase().trim();
}

/* Palabras vacías: aparecen en casi toda consulta y no distinguen nada */
const ASIS_VACIAS = new Set([
  "que", "como", "cual", "cuales", "cuanto", "cuanta", "donde", "para", "por",
  "los", "las", "una", "unos", "unas", "del", "con", "sin", "mas", "muy",
  "hay", "son", "esta", "estan", "tiene", "tienen", "puedo", "puede", "pueden",
  "quiero", "necesito", "hola", "buenas", "gracias", "porfa", "favor",
]);

/* Puntúa cada tema según las palabras de la consulta que aparecen en sus
   claves. Gana el de mayor puntaje; si nadie puntúa, no hay respuesta.
   Solo cuentan palabras de 4+ letras: con menos ("de", "o") cualquier tema
   coincidiría por accidente. */
// "despachar" y "despachan" comparten raíz: se comparan los primeros 5 caracteres
function asisMismaRaiz(a, b) {
  return a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5);
}

function asisBuscarTema(consulta) {
  const palabras = asisNormalizar(consulta)
    .split(/\s+/)
    .filter(p => p.length >= 3 && !ASIS_VACIAS.has(p));
  if (!palabras.length) return null;

  let mejor = null, mejorPuntaje = 0;
  ASIS_TEMAS.forEach(tema => {
    const claves = asisNormalizar(tema.claves + " " + tema.titulo)
      .split(/\s+/)
      .filter(c => c.length >= 3);
    let puntaje = 0;
    palabras.forEach(p => {
      if (claves.includes(p)) puntaje += 3;
      else if (claves.some(c => asisMismaRaiz(c, p))) puntaje += 2;
    });
    if (puntaje > mejorPuntaje) { mejorPuntaje = puntaje; mejor = tema; }
  });
  return mejorPuntaje >= 2 ? mejor : null;
}

// Además de las preguntas, el asistente busca productos del catálogo
function asisBuscarProductos(consulta) {
  if (typeof productos === "undefined") return [];
  const palabras = asisNormalizar(consulta).split(/\s+/).filter(p => p.length > 3);
  if (!palabras.length) return [];
  return productos.filter(p => {
    const texto = asisNormalizar(`${p.nombre} ${p.categoria} ${p.material}`);
    return palabras.some(w => texto.includes(w));
  }).slice(0, 3);
}

/* ── Interfaz ── */
function asisBurbuja(texto, quien) {
  return `<div class="asis-msg asis-msg-${quien}">${texto}</div>`;
}

function asisEnlacesHTML(enlaces) {
  if (!enlaces || !enlaces.length) return "";
  return `<div class="asis-acciones">` + enlaces.map(e =>
    `<a class="asis-accion" href="${e.href}"${e.externo ? ' target="_blank" rel="noopener"' : ''}>${e.texto}</a>`
  ).join("") + `</div>`;
}

function asisProductosHTML(lista) {
  if (!lista.length) return "";
  return `<div class="asis-productos">` + lista.map(p => `
    <a class="asis-prod" href="producto.html?id=${p.id}">
      <img src="${p.imagen}" alt="" loading="lazy">
      <span>
        <strong>${p.nombre}</strong>
        <small>${p.precio > 0 ? "$" + p.precio.toLocaleString("es-CL") : "Consultar precio"}</small>
      </span>
    </a>`).join("") + `</div>`;
}

function asisResponder(consulta) {
  const cuerpo = document.getElementById("asis-cuerpo");
  if (!cuerpo) return;

  cuerpo.insertAdjacentHTML("beforeend", asisBurbuja(consulta, "cliente"));

  const tema = asisBuscarTema(consulta);
  const prods = asisBuscarProductos(consulta);

  let html;
  if (tema) {
    html = tema.respuesta + asisEnlacesHTML(tema.enlaces) + asisProductosHTML(prods);
  } else if (prods.length) {
    html = `Encontré esto en el catálogo:` + asisProductosHTML(prods);
  } else {
    html = `No tengo esa respuesta a mano 😅 Escríbenos y te ayudamos al tiro.`
         + asisEnlacesHTML([{ texto: "Escribir por WhatsApp", href: ASIS_WHATSAPP, externo: true },
                            { texto: "Ver preguntas frecuentes", href: "faq.html" }]);
  }

  // Pequeña espera para que se lea como una conversación
  cuerpo.insertAdjacentHTML("beforeend", `<div class="asis-msg asis-msg-bot asis-escribiendo" id="asis-typing"><span></span><span></span><span></span></div>`);
  cuerpo.scrollTop = cuerpo.scrollHeight;

  setTimeout(() => {
    document.getElementById("asis-typing")?.remove();
    cuerpo.insertAdjacentHTML("beforeend", asisBurbuja(html, "bot"));
    cuerpo.scrollTop = cuerpo.scrollHeight;
  }, 420);
}

function asisSaludar() {
  const cuerpo = document.getElementById("asis-cuerpo");
  if (!cuerpo || cuerpo.dataset.saludado) return;
  cuerpo.dataset.saludado = "1";

  const chips = ASIS_SUGERENCIAS.map(id => {
    const t = ASIS_TEMAS.find(x => x.id === id);
    return t ? `<button type="button" class="asis-chip" data-tema="${t.id}">${t.titulo}</button>` : "";
  }).join("");

  cuerpo.insertAdjacentHTML("beforeend", asisBurbuja(
    `¡Hola! 👋 Soy el asistente de Joyería Aravena. Pregúntame sobre envíos, precios, materiales o busca un producto.
     <div class="asis-chips">${chips}</div>`, "bot"));
}

function asisAbrir() {
  document.getElementById("asis-panel")?.classList.add("activo");
  document.getElementById("asis-burbuja")?.classList.add("oculto");
  asisSaludar();
  document.getElementById("asis-input")?.focus();
}

function asisCerrar() {
  document.getElementById("asis-panel")?.classList.remove("activo");
  document.getElementById("asis-burbuja")?.classList.remove("oculto");
}

function inicializarAsistente() {
  // El widget se inyecta desde JS para no repetir el marcado en cada página
  const cont = document.createElement("div");
  cont.className = "asistente";
  cont.innerHTML = `
    <button type="button" class="asis-burbuja" id="asis-burbuja" aria-label="Abrir asistente de consultas">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span class="asis-burbuja-txt">¿Dudas?</span>
    </button>

    <section class="asis-panel" id="asis-panel" aria-label="Asistente de consultas">
      <header class="asis-head">
        <span class="asis-head-titulo">
          <span class="asis-punto" aria-hidden="true"></span>
          Asistente Aravena
        </span>
        <button type="button" class="asis-cerrar" id="asis-cerrar" aria-label="Cerrar">&times;</button>
      </header>
      <div class="asis-cuerpo" id="asis-cuerpo"></div>
      <form class="asis-pie" id="asis-form">
        <input type="text" id="asis-input" placeholder="Escribe tu consulta…" autocomplete="off">
        <button type="submit" class="asis-enviar" aria-label="Enviar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </section>`;
  document.body.appendChild(cont);

  document.getElementById("asis-burbuja").addEventListener("click", asisAbrir);
  document.getElementById("asis-cerrar").addEventListener("click", asisCerrar);

  document.getElementById("asis-form").addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("asis-input");
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    asisResponder(v);
  });

  // Los botones de temas se crean después: se escucha en el contenedor
  document.getElementById("asis-cuerpo").addEventListener("click", e => {
    const chip = e.target.closest(".asis-chip");
    if (!chip) return;
    const tema = ASIS_TEMAS.find(t => t.id === chip.dataset.tema);
    if (tema) asisResponder(tema.titulo);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") asisCerrar();
  });
}

document.addEventListener("DOMContentLoaded", inicializarAsistente);

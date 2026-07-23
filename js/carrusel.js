/* =============================================
   CARRUSELES ARRASTRABLES
   Reemplaza la animación CSS por desplazamiento real: así el cliente
   puede moverlos con el dedo en el celular y arrastrando con el mouse
   en computador, sin perder el movimiento automático.

   El contenido va duplicado (A B C A B C): al llegar a la mitad se
   vuelve al inicio, y el bucle no se nota.
   ============================================= */

const CARRUSEL_VELOCIDAD = 0.35;   // px por frame (~21 px/s a 60fps)
const CARRUSEL_PAUSA_MS  = 2500;   // espera antes de retomar tras soltar

function inicializarCarruseles(raiz) {
  const contenedor = raiz || document;
  contenedor.querySelectorAll(".marquee").forEach(marco => {
    if (marco.dataset.arrastrable) return;   // ya estaba activo
    const pista = marco.querySelector(".marquee-track");
    if (!pista) return;
    marco.dataset.arrastrable = "1";

    // La dirección la marcaba la clase de la animación CSS
    const haciaAtras = pista.classList.contains("marquee-der");
    pista.classList.remove("marquee-izq", "marquee-der");
    pista.style.animation = "none";

    activarCarrusel(marco, pista, haciaAtras);
  });
}

function activarCarrusel(marco, pista, haciaAtras) {
  let pausado   = false;
  let arrastrando = false;
  let reanudar  = null;
  let inicioX = 0, inicioScroll = 0, movido = 0;

  const mitad = () => pista.scrollWidth / 2;

  // Mantiene el scroll dentro de la primera copia para que el bucle sea continuo
  const normalizar = () => {
    const m = mitad();
    if (m <= 0) return;
    if (marco.scrollLeft >= m)  marco.scrollLeft -= m;
    else if (marco.scrollLeft <= 0) marco.scrollLeft += m;
  };

  /* El navegador redondea scrollLeft a enteros: si se le sumara 0.35 en
     cada frame, se perdería el decimal y no avanzaría nunca. Por eso la
     posición se lleva aparte con decimales y se vuelca ya redondeada. */
  let posicion = 1;
  requestAnimationFrame(() => { marco.scrollLeft = posicion; });

  const paso = () => {
    if (!marco.isConnected) return;          // el carrusel dejó de existir
    if (!pausado && !arrastrando) {
      const m = mitad();
      if (m > 0) {
        posicion += haciaAtras ? -CARRUSEL_VELOCIDAD : CARRUSEL_VELOCIDAD;
        if (posicion >= m) posicion -= m;
        else if (posicion <= 0) posicion += m;
        marco.scrollLeft = posicion;
      }
    } else {
      // Mientras el cliente lo mueve, manda su scroll
      posicion = marco.scrollLeft;
    }
    requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);

  const pausar = () => { pausado = true; clearTimeout(reanudar); };
  const soltar = () => {
    clearTimeout(reanudar);
    reanudar = setTimeout(() => { pausado = false; }, CARRUSEL_PAUSA_MS);
  };

  // Con el cursor encima se detiene para poder mirar o agregar al carrito
  marco.addEventListener("mouseenter", pausar);
  marco.addEventListener("mouseleave", () => { pausado = false; });

  /* ── Arrastre con mouse (en celular el scroll táctil ya es nativo) ── */
  marco.addEventListener("pointerdown", e => {
    if (e.pointerType === "touch") { pausar(); return; }  // el dedo lo maneja el navegador
    arrastrando = true;
    movido = 0;
    inicioX = e.clientX;
    inicioScroll = marco.scrollLeft;
    marco.classList.add("arrastrando");
    pausar();
  });

  marco.addEventListener("pointermove", e => {
    if (!arrastrando) return;
    const dx = e.clientX - inicioX;
    movido = Math.abs(dx);
    marco.scrollLeft = inicioScroll - dx;
    normalizar();
    if (movido > 3) e.preventDefault();   // no seleccionar texto ni arrastrar la imagen
  });

  const terminar = () => {
    if (!arrastrando) return;
    arrastrando = false;
    marco.classList.remove("arrastrando");
    soltar();
  };
  marco.addEventListener("pointerup", terminar);
  marco.addEventListener("pointercancel", terminar);
  marco.addEventListener("pointerleave", terminar);

  // Un arrastre no debe abrir el producto que quedó bajo el cursor
  marco.addEventListener("click", e => {
    if (movido > 5) { e.stopPropagation(); e.preventDefault(); movido = 0; }
  }, true);

  // Scroll táctil / rueda: se pausa mientras el cliente lo mueve
  marco.addEventListener("touchstart", pausar, { passive: true });
  marco.addEventListener("touchend", soltar,  { passive: true });
  marco.addEventListener("scroll", normalizar, { passive: true });
}

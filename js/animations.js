/* =============================================
   ANIMACIONES - JOYERÍA ARAVENA
   Loader, scroll reveal, header glass, parallax, counters
   ============================================= */

function inicializarAnimaciones() {
  initLoader();
  initScrollReveal();
  initHeaderScroll();
  initParallax();
  initCounters();
}

/* Loader inicial con brillo azul */
function initLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  const inicio = performance.now();
  const ocultar = () => {
    const transcurrido = performance.now() - inicio;
    const espera = Math.max(0, 800 - transcurrido);
    setTimeout(() => {
      loader.classList.add("oculto");
      setTimeout(() => loader.remove(), 600);
    }, espera);
  };
  if (document.readyState === "complete") ocultar();
  else window.addEventListener("load", ocultar);
  setTimeout(() => {
    if (document.body.contains(loader)) {
      loader.classList.add("oculto");
      setTimeout(() => loader.remove(), 600);
    }
  }, 1500);
}

/* Fade-in al hacer scroll (IntersectionObserver) */
function initScrollReveal() {
  const elementos = document.querySelectorAll(".animar");
  if (!elementos.length) return;

  // Detectar scroll rápido: si el usuario está scrolleando muy rápido,
  // mostrar todas las tarjetas inmediatamente sin animación.
  let scrollRapido = false;
  let ultimoY = window.scrollY;
  let ultimoT = performance.now();
  const onScroll = () => {
    const ahora = performance.now();
    const dy = Math.abs(window.scrollY - ultimoY);
    const dt = ahora - ultimoT;
    if (dt > 0 && dy / dt > 2.0) { // > 2 px/ms ≈ scroll muy rápido
      if (!scrollRapido) {
        scrollRapido = true;
        document.querySelectorAll(".animar:not(.visible)").forEach(el => {
          el.style.transitionDelay = "0ms";
          el.classList.add("visible");
        });
      }
    }
    ultimoY = window.scrollY;
    ultimoT = ahora;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // Observer con rootMargin grande para que las cards aparezcan
  // ANTES de llegar al viewport (300px de adelanto)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: "300px 0px 300px 0px" });
  elementos.forEach((el) => observer.observe(el));
}

/* Header con glassmorphism reforzado al hacer scroll */
function initHeaderScroll() {
  const header = document.querySelector(".header");
  if (!header) return;
  const toggle = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* Parallax leve en hero */
function initParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const capa = hero.querySelector("[data-parallax]") || hero;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, 600);
      capa.style.setProperty("--parallax-y", `${y * 0.15}px`);
      ticking = false;
    });
  }, { passive: true });
}

/* Animación de contadores en sección stats (las cifras suben de 0 al total) */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animar = (el) => {
    const destino = parseInt(el.dataset.count, 10) || 0;
    const duracion = 1800;
    const inicio = performance.now();
    const tick = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const eased = 1 - Math.pow(1 - progreso, 3);   // arranca rápido y frena al final
      el.textContent = Math.floor(destino * eased).toLocaleString("es-CL");
      if (progreso < 1) requestAnimationFrame(tick);
      else el.textContent = destino.toLocaleString("es-CL");
    };
    requestAnimationFrame(tick);
  };

  const arrancar = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animar(entry.target);
          observer.unobserve(entry.target);   // se cuenta una sola vez
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
  };

  // La barra de cifras queda visible apenas carga la página, así que el conteo
  // ocurría DETRÁS del loader y nadie lo veía. Se espera a que el loader se vaya.
  const loader = document.getElementById("page-loader");
  if (!loader) { arrancar(); return; }

  const listo = () => !document.body.contains(loader) || loader.classList.contains("oculto");
  if (listo()) { arrancar(); return; }

  const esperar = setInterval(() => {
    if (listo()) { clearInterval(esperar); arrancar(); }
  }, 100);
  // Respaldo: si algo falla con el loader, arrancar igual
  setTimeout(() => { clearInterval(esperar); arrancar(); }, 2500);
}

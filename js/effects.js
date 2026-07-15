/* =============================================
   EFECTO CHISPAS HERO  (sutil, tipo destello de joya)
   ============================================= */
(function () {
  const SYMBOLS = ['✦', '✧', '◆', '⋆'];

  function heroSparkles() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    hero.style.position = 'relative';
    hero.style.overflow = 'hidden';

    function spawn() {
      const el = document.createElement('span');
      el.className = 'hero-sparkle';
      el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

      const dur  = (Math.random() * 2 + 2).toFixed(2);
      const size = (Math.random() * 7 + 5).toFixed(0);

      el.style.cssText = `
        left: ${Math.random() * 90 + 5}%;
        top:  ${Math.random() * 80 + 10}%;
        font-size: ${size}px;
        --dur: ${dur}s;
      `;

      hero.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });

      // Menos frecuente y más calmado: 700–1500 ms
      setTimeout(spawn, Math.random() * 800 + 700);
    }

    spawn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', heroSparkles);
  } else {
    heroSparkles();
  }
})();


/* =============================================
   FONDO DE DIAMANTES  (pocos, lentos y elegantes)
   Reemplaza el antiguo campo de estrellas + nieve.
   ============================================= */
(function () {
  // Respeta preferencia de "menos movimiento" del sistema
  const prefiereQuieto = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement("canvas");
  canvas.id = "diamond-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0", left: "0",
    width: "100%", height: "100%",
    pointerEvents: "none",
    zIndex: "0",
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let W, H, diamantes;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function isLight() {
    return document.documentElement.classList.contains("light");
  }

  // Cantidad discreta: se escala con el ancho pero siempre pocos
  function cantidad() {
    const base = Math.round(window.innerWidth / 130); // ~10 en desktop
    return Math.max(6, Math.min(14, base));
  }

  function crearDiamante() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      size: rand(9, 22),
      alpha: 0,
      targetAlpha: rand(0.05, 0.16),   // muy sutil
      vy: rand(-0.14, -0.04),          // sube lento
      vx: rand(-0.05, 0.05),           // deriva mínima
      spin: rand(-0.004, 0.004),
      angle: rand(0, Math.PI * 2),
      life: 0,
      maxLife: rand(500, 1100),
      twPhase: rand(0, Math.PI * 2),
      twSpeed: rand(0.008, 0.02),
    };
  }

  function reset(d) { Object.assign(d, crearDiamante(), { x: rand(0, W), y: H + 30 }); }

  // Dibuja un diamante talla brillante: corona (rombo) + facetas
  function drawDiamante(d, t) {
    const s = d.size;
    const tw = 0.6 + 0.4 * Math.sin(t * d.twSpeed * 60 + d.twPhase);
    const a = d.alpha * tw;
    if (a <= 0.001) return;

    const cel = isLight() ? "40,120,210" : "150,225,255"; // celeste diamante
    const wht = isLight() ? "30,90,170"  : "235,250,255";

    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.angle);

    // Halo suave
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.9);
    glow.addColorStop(0, `rgba(${cel},${a * 0.5})`);
    glow.addColorStop(1, `rgba(${cel},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.9, 0, Math.PI * 2);
    ctx.fill();

    // Silueta del diamante (mesa + pabellón)
    const topY = -s * 0.55, tblY = -s * 0.2, botY = s;
    const halfTop = s * 0.9, halfTbl = s * 0.55;
    ctx.beginPath();
    ctx.moveTo(-halfTop, topY);
    ctx.lineTo(halfTop, topY);
    ctx.lineTo(halfTbl, tblY);
    ctx.lineTo(0, botY);
    ctx.lineTo(-halfTbl, tblY);
    ctx.closePath();
    ctx.fillStyle = `rgba(${cel},${a * 0.28})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${wht},${a})`;
    ctx.stroke();

    // Facetas internas
    ctx.beginPath();
    ctx.moveTo(-halfTop, topY); ctx.lineTo(-halfTbl, tblY); ctx.lineTo(halfTbl, tblY); ctx.lineTo(halfTop, topY);
    ctx.moveTo(-halfTbl, tblY); ctx.lineTo(0, botY); ctx.lineTo(halfTbl, tblY);
    ctx.moveTo(0, topY); ctx.lineTo(0, tblY);
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = `rgba(${wht},${a * 0.6})`;
    ctx.stroke();

    ctx.restore();
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    diamantes = Array.from({ length: cantidad() }, () => {
      const d = crearDiamante();
      d.life = rand(0, d.maxLife);      // arranque escalonado
      return d;
    });
  }

  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;

    diamantes.forEach((d) => {
      d.life++;
      d.x += d.vx;
      d.y += d.vy;
      d.angle += d.spin;

      const half = d.maxLife / 2;
      d.alpha = d.life < half
        ? Math.min(d.targetAlpha, (d.life / half) * d.targetAlpha)
        : Math.max(0, d.targetAlpha * (1 - (d.life - half) / half));

      if (d.life >= d.maxLife || d.y < -40) reset(d);

      drawDiamante(d, t);
    });

    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();

  if (prefiereQuieto) {
    // Dibuja un cuadro estático (sin animación) para accesibilidad
    diamantes.forEach((d) => { d.alpha = d.targetAlpha; drawDiamante(d, 0); });
  } else {
    loop();
  }
})();

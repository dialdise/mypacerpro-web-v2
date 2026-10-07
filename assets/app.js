/* ==========================================================================
   MY PACERPRO — sistema de movimiento
   Sin librerías. Un único bucle rAF para todo lo que depende del scroll, y
   IntersectionObserver para lo que solo ocurre una vez al entrar en pantalla.
   Solo se animan transform y opacity: nada toca el layout.
   Cadencia común: 620ms, curva (.22,.7,.28,1), 70ms entre elementos.
   ========================================================================== */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const STEP   = 70;

  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('menu');
  const wa     = document.getElementById('wa');
  const pace   = document.getElementById('pace');
  const track  = document.getElementById('mqTrack');

  /* ======================================================================
     1. MENÚ MÓVIL
     ====================================================================== */
  let open = false;
  const setMenu = (next) => {
    open = next;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('open'));
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { if (!open) menu.hidden = true; }, reduce ? 0 : 340);
    }
  };
  burger.addEventListener('click', () => setMenu(!open));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) { setMenu(false); burger.focus(); } });
  matchMedia('(min-width:1024px)').addEventListener('change', e => { if (e.matches && open) setMenu(false); });

  /* ======================================================================
     2. TITULARES POR LÍNEAS
     Cada línea lógica (separada por <br>) se envuelve en una máscara y sube
     desde abajo con la cadencia del sistema. Si el JS no corre, el titular
     se ve igual: la máscara solo existe cuando la creamos aquí.
     ====================================================================== */
  const headings = document.querySelectorAll('h1, h2');
  headings.forEach(h => {
    const parts = h.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    h.innerHTML = parts.map((p, i) =>
      `<span class="ln"><span class="ln-i" style="transition-delay:${i * STEP}ms">${p}</span></span>`
    ).join('');
    // la máscara ya oculta el texto: sobra el fade genérico
    h.classList.remove('rise');
    h.classList.add('lines');
  });
  document.documentElement.classList.add('motion-ready');

  /* ======================================================================
     3. CONTADOR DE PRECIOS
     El brief pedía cifras que aparecen progresivamente. El valor final ya
     está en el HTML; aquí solo se anima hasta él.
     ====================================================================== */
  const prices = [];
  document.querySelectorAll('.price').forEach(el => {
    const m = el.innerHTML.match(/S\/(\d+)/);
    if (!m) return;
    const to = +m[1];
    el.innerHTML = el.innerHTML.replace(/S\/(\d+)/, `S/<span class="num">${to}</span>`);
    prices.push({ node: el.querySelector('.num'), to, done: false });
  });
  const countUp = (p) => {
    if (p.done) return; p.done = true;
    if (reduce) { p.node.textContent = p.to; return; }
    const dur = 900, t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);           // easeOutCubic
      p.node.textContent = Math.round(p.to * e);
      if (k < 1) requestAnimationFrame(tick);
      else p.node.textContent = p.to;
    };
    p.node.textContent = '0';
    requestAnimationFrame(tick);
  };

  /* ======================================================================
     4. REVELADOS AL ENTRAR EN PANTALLA
     ====================================================================== */
  const revealables = document.querySelectorAll('.rise, .lines, .wipe, .tri-grid, .price');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('in'));
    prices.forEach(p => { p.done = true; p.node.textContent = p.to; });
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        const p = prices.find(x => x.node && e.target.contains(x.node));
        if (p) countUp(p);
        io.unobserve(e.target);              // una sola vez: no re-animar al volver
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    revealables.forEach(el => io.observe(el));
  }

  /* ======================================================================
     4b. PASOS QUE SE ENCIENDEN AL BAJAR
     En escritorio basta el hover, pero en móvil no existe. Se enciende la
     cifra cuando el paso cruza el centro de la pantalla y se queda encendida.
     ====================================================================== */
  const steps = document.querySelectorAll('.step');
  if (steps.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      steps.forEach(s => s.classList.add('lit'));
    } else {
      const ioStep = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('lit');
          ioStep.unobserve(e.target);
        }
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      steps.forEach(s => ioStep.observe(s));
    }
  }

  /* ======================================================================
     5. MARQUESINA REACTIVA A LA VELOCIDAD DE SCROLL
     Avanza sola; cuando haces scroll rápido acelera y se inclina levemente.
     Es el único elemento que justifica un bucle continuo, así que se detiene
     cuando sale de pantalla o cuando la pestaña no está visible.
     ====================================================================== */
  let mqX = 0, baseW = 0, mqOn = false;
  if (track && !reduce) {
    const originals = [...track.children].map(n => n.cloneNode(true));
    const fill = () => {
      // restaurar una sola copia y volver a duplicar según el ancho actual
      track.innerHTML = '';
      originals.forEach(n => track.appendChild(n.cloneNode(true)));
      baseW = track.scrollWidth;
      let guard = 0;
      while (track.scrollWidth < innerWidth * 2 + baseW && guard++ < 24) {
        originals.forEach(n => track.appendChild(n.cloneNode(true)));
      }
    };
    fill();
    new IntersectionObserver(es => { mqOn = es[0].isIntersecting; })
      .observe(track.parentElement);
    addEventListener('resize', () => { mqX = 0; fill(); }, { passive: true });
  }

  /* ======================================================================
     6. BUCLE ÚNICO: progreso, nav, parallax, marquesina
     ====================================================================== */
  const pars = [...document.querySelectorAll('[data-par]')].map(el => ({
    el, k: parseFloat(el.dataset.par) || 0.1
  }));

  let lastY = scrollY, vel = 0, hidden = false;

  const frame = () => {
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    vel += (dy - vel) * 0.18;                 // velocidad suavizada

    // barra de ritmo
    const max = document.documentElement.scrollHeight - innerHeight;
    if (pace) pace.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;

    // nav: fondo, y se esconde al bajar
    nav.classList.toggle('scrolled', y > 24);
    if (!open) {
      const shouldHide = dy > 2 && y > 420;
      const shouldShow = dy < -2 || y < 420;
      if (shouldHide && !hidden) { hidden = true;  nav.classList.add('hide'); }
      if (shouldShow && hidden)  { hidden = false; nav.classList.remove('hide'); }
    }

    // botón flotante de WhatsApp
    wa.classList.toggle('show', y > 520);

    // parallax (pocos elementos, coste despreciable)
    if (!reduce) {
      for (const p of pars) {
        const r = p.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        const mid = r.top + r.height / 2 - innerHeight / 2;
        p.el.style.transform = `translate3d(0, ${(-mid * p.k).toFixed(2)}px, 0)`;
      }
    }

    // marquesina
    if (mqOn && baseW > 0 && !document.hidden) {
      const speed = 0.6 + Math.min(6, Math.abs(vel) * 0.18);
      mqX -= speed * (vel < -0.5 ? -1 : 1);     // invierte el sentido al subir
      if (mqX <= -baseW) mqX += baseW;
      if (mqX > 0) mqX -= baseW;
      const skew = Math.max(-4, Math.min(4, vel * 0.09));
      track.style.transform = `translate3d(${mqX.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  /* ======================================================================
     7. BOTONES MAGNÉTICOS (solo puntero fino)
     El contenido del botón se desplaza un poco hacia el cursor. Sutil: 6px.
     ====================================================================== */
  if (fine && !reduce) {
    document.querySelectorAll('.btn').forEach(btn => {
      const inner = document.createElement('span');
      inner.className = 'mag';
      while (btn.firstChild) inner.appendChild(btn.firstChild);
      btn.appendChild(inner);

      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        inner.style.transform = `translate(${(x * 12).toFixed(1)}px, ${(y * 6).toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => { inner.style.transform = ''; });
    });
  }
})();

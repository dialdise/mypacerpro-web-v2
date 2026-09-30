/* MY PACERPRO — comportamiento mínimo. Sin librerías: rendimiento antes que efectos. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- navbar: estado al hacer scroll ---------------------------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 24);
    wa.classList.toggle('show', scrollY > 520);
  };

  /* --- menú móvil ------------------------------------------------------- */
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('menu');
  const wa     = document.getElementById('wa');
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
      // esperar a que termine la transición antes de sacarlo del árbol
      setTimeout(() => { if (!open) menu.hidden = true; }, reduce ? 0 : 340);
    }
  };

  burger.addEventListener('click', () => setMenu(!open));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) { setMenu(false); burger.focus(); } });
  // si se pasa a desktop con el menú abierto, devolver el scroll del body
  matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches && open) setMenu(false); });

  /* --- aparición al hacer scroll ---------------------------------------- */
  const risers = document.querySelectorAll('.rise');
  if (reduce || !('IntersectionObserver' in window)) {
    risers.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);          // una sola vez: no re-animar al volver
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    risers.forEach(el => io.observe(el));
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

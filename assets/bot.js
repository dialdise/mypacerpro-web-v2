/* ==========================================================================
   MY PACERPRO — asistente
   El sitio es estático y público: no puede llevar una clave de API de ningún
   modelo, quedaría a la vista en el código fuente. Así que el asistente
   responde desde una base de conocimiento con los datos confirmados de la
   web. No improvisa: lo que no está aquí, lo deriva a WhatsApp.
   ========================================================================== */
(() => {
  'use strict';

  const WA   = 'https://wa.me/51995847851';
  const waLink = (t) => `${WA}?text=${encodeURIComponent(t)}`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- normalización: sin tildes, sin signos, en minúsculas -------------- */
  const norm = (s) => s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

  /* --- base de conocimiento --------------------------------------------- */
  const KB = [
    { id:'precios', k:['precio','precios','cuanto','cuesta','cuestan','vale','valen','tarifa','tarifas','costo','cobran','mensualidad'],
      a:`Estas son las tarifas mensuales:
         <ul>
           <li><b>Running presencial</b> — S/175</li>
           <li><b>Running virtual</b> — S/160</li>
           <li><b>Natación presencial</b> — S/280</li>
           <li><b>Natación semipresencial</b> — S/195</li>
           <li><b>Triatlón</b> — S/630</li>
         </ul>
         ¿Te cuento qué incluye alguno?`,
      chips:['¿Qué incluye Running?','¿Qué incluye Natación?','Triatlón'] },

    { id:'running', s:['running','correr','corredor','maraton'],
      k:['corro','carrera','fondo','trote'],
      a:`En <b>Running</b> hay dos modalidades, ambas con entrenamiento 1:1:
         <ul>
           <li><b>Presencial — S/175/mes.</b> Todo el servicio individual más acceso a las sesiones del equipo.</li>
           <li><b>Virtual — S/160/mes.</b> Lo mismo, pero ejecutas las sesiones por tu cuenta desde donde estés.</li>
         </ul>
         En ambas tienes coach personal asignado, reunión introductoria, plan mensual, programación por TrainingPeaks, seguimiento semanal, fuerza y movilidad, y charlas pre y post carrera.`,
      chips:['¿Qué días entrenan?','¿Dónde es?','Quiero empezar'] },

    { id:'natacion', s:['natacion','nadar','piscina'],
      k:['nado','mar','agua','aguas abiertas','crol'],
      a:`En <b>Natación</b>:
         <ul>
           <li><b>Presencial — S/280/mes.</b> 12 sesiones al mes: 2 por semana en piscina y 1 en mar.</li>
           <li><b>Semipresencial — S/195/mes.</b></li>
         </ul>
         La piscina es trabajo técnico y específico; el mar suma resistencia, confianza y adaptación a distintas condiciones.
         <p>Del detalle de la modalidad semipresencial te cuentan mejor por WhatsApp — todavía no está publicado acá.</p>`,
      chips:['Horarios de natación','¿Dónde nadan?','Quiero natación'] },

    { id:'triatlon', s:['triatlon','triathlon','ironman','acuatlon'],
      k:['tres disciplinas'],
      a:`El plan de <b>Triatlón</b> cuesta <b>S/630 al mes</b> e integra las tres disciplinas:
         <ul>
           <li>Running — S/175</li>
           <li>Ciclismo — S/175</li>
           <li>Natación — S/280</li>
         </ul>
         <p>Sobre el detalle del componente de ciclismo —horarios y metodología— mejor te lo confirman directamente, no quiero darte un dato que no tengo.</p>`,
      chips:['Hablar por WhatsApp','¿Qué incluye Natación?'] },

    { id:'horarios', k:['horario','horarios','dia','dias','cuando','hora','entrenan','entrenamos','sesiones','madrugada'],
      a:`Los entrenamientos presenciales:
         <ul>
           <li><b>Running</b> — miércoles y sábados, 4:50 a. m. en punto. Son los <b>únicos</b> dos días presenciales de running.</li>
           <li><b>Natación, piscina</b> — lunes y viernes, 4:50 a. m.</li>
           <li><b>Natación, mar</b> — domingos, 5:50 a. m.</li>
         </ul>
         El resto de tu semana lo trabajas según tu plan personalizado.`,
      chips:['¿Dónde son?','¿Es obligatorio ir?','Quiero empezar'] },

    { id:'lugares', k:['donde','lugar','punto','encuentro','direccion','ubicacion','parque','playa','queda','maria reiche','miraflores','chorrillos','san isidro'],
      a:`Los puntos de encuentro:
         <ul>
           <li><b>Running</b> — Parque María Reiche, Miraflores.</li>
           <li><b>Natación, piscina</b> — Piscina Alfonso Ugarte, San Isidro.</li>
           <li><b>Natación, mar</b> — Playa Pescadores, Chorrillos.</li>
         </ul>`,
      chips:['¿Qué días entrenan?','Quiero empezar'] },

    { id:'obligatorio', k:['obligatorio','obligatoria','tengo que ir','asistencia','faltar','si no voy','puedo faltar'],
      a:`No, la asistencia a las sesiones presenciales <b>no es obligatoria</b>. Es una parte importante de la experiencia del equipo, pero el resto de tu semana se trabaja según tu plan individual.`,
      chips:['Running virtual','¿Qué días entrenan?'] },

    { id:'principiante', k:['principiante','empezar de cero','nunca','experiencia','novato','recien','sedentario','nivel','puedo entrar','apto'],
      a:`No necesitas experiencia previa. El plan se construye desde <b>tu</b> nivel actual, tu disponibilidad y tu objetivo — por eso la programación es individual y no una rutina común para todo el equipo.`,
      chips:['¿Cómo funciona?','Precios'] },

    { id:'fuera', s:['provincia','extranjero'],
      k:['fuera de lima','no vivo','vivo en','otro pais','otra ciudad','viaje','remoto','a distancia','virtual','desde casa','no estoy en lima','afuera'],
      a:`Sí puedes. La modalidad <b>virtual de running (S/160/mes)</b> mantiene coach asignado, plan personalizado y seguimiento semanal; ejecutas las sesiones por tu cuenta desde donde estés.`,
      chips:['¿Qué incluye Running?','Quiero empezar'] },

    { id:'funciona', k:['como funciona','como empiezo','proceso','pasos','inscribir','inscripcion','empezar','sumarme','unirme','registro'],
      a:`Son cuatro pasos:
         <ul>
           <li><b>01</b> — Eliges tu disciplina.</li>
           <li><b>02</b> — Conocemos tu objetivo: nivel, disponibilidad, experiencia y próximas competencias.</li>
           <li><b>03</b> — Te asignamos un coach, que crea y supervisa tu planificación.</li>
           <li><b>04</b> — Empiezas a entrenar y arranca el seguimiento.</li>
         </ul>
         Lo más rápido es escribirles por WhatsApp y te orientan con el plan que te conviene.`,
      chips:['Hablar por WhatsApp','Precios'] },

    { id:'plan', k:['trainingpeaks','plataforma','app','como recibo','planificacion','programacion','me mandan','seguimiento'],
      a:`La programación se entrega por <b>TrainingPeaks</b>, y la comunicación con tu coach es constante por WhatsApp. El plan se ajusta según tu rendimiento y cómo vas respondiendo.`,
      chips:['¿Tengo coach asignado?','Precios'] },

    { id:'coach', s:['coach','coaches','entrenador','entrenadores'],
      k:['quien entrena','profesor','staff','equipo tecnico'],
      a:`Tienes un <b>coach personal asignado</b> desde el inicio, con una reunión introductoria antes de empezar. El equipo:
         <ul>
           <li><b>Crisha</b> — running y trail running</li>
           <li><b>Jesús Navarro</b> — triatlón y natación</li>
           <li><b>Bruno Díaz</b> — fondo y preparación física</li>
         </ul>
         Puedes ver su formación completa en la sección de coaches.`,
      chips:['Ver coaches','¿Cómo funciona?'], scroll:'#coaches' },

    { id:'individual', k:['1 1','uno a uno','individual','personalizado','grupal','mismo plan','todos igual','rutina'],
      a:`Entrenan juntos, pero <b>el plan es tuyo</b>. Cada corredor tiene coach personal, programación individual, sus propios ritmos, su propio volumen y su propio seguimiento. Lo que se comparte son las sesiones presenciales y el equipo.`,
      chips:['¿Qué días entrenan?','Precios'] },

    { id:'carrera', k:['carrera objetivo','preparar','competencia','competir','meta','21k','42k','10k','media maraton'],
      a:`Sí. El plan se arma alrededor de tus competencias objetivo y se ajusta según tu rendimiento. Además hay charlas pre y post carrera con el equipo.`,
      chips:['¿Cómo funciona?','Quiero empezar'] },

    { id:'pago', k:['pago','pagar','pagos','transferencia','yape','plin','tarjeta','efectivo','deposito','como se paga'],
      a:`Las formas de pago todavía no están publicadas acá, y prefiero no inventarte un dato. Escríbeles por WhatsApp y te confirman al toque.`,
      chips:['Hablar por WhatsApp'] },

    { id:'saludo', k:['hola','buenas','hey','holi','buenos dias','buenas tardes','buenas noches','que tal'],
      a:`¡Hola! Soy el asistente de MY PACERPRO. Puedo contarte de precios, horarios, lugares, planes y coaches. ¿Qué te gustaría saber?`,
      chips:['Precios','¿Qué días entrenan?','¿Cómo funciona?'] },

    { id:'gracias', k:['gracias','buenisimo','genial','perfecto','ok gracias','vale'],
      a:`¡Con gusto! Si quieres arrancar o resolver algo más puntual, escríbeles por WhatsApp y te atienden directo.`,
      chips:['Hablar por WhatsApp'] },
  ];

  const FALLBACK = {
    a:`Esa no la tengo confirmada y prefiero no inventártela. Te paso con el equipo por WhatsApp, que te responde directo.`,
    chips:['Precios','¿Qué días entrenan?','Hablar por WhatsApp']
  };

  const match = (q) => {
    const t = ' ' + norm(q) + ' ';
    let best = null, bestScore = 0;
    for (const topic of KB) {
      let score = 0;
      for (const kw of (topic.k || [])) {
        const k = norm(kw);
        if (t.includes(' ' + k + ' ') || t.includes(' ' + k)) score += k.length > 5 ? 2.2 : 1.4;
      }
      // las palabras "fuertes" nombran la entidad concreta (triatlón, natación,
      // coach) y deben ganarle siempre a la intención genérica (cuánto, precio)
      for (const kw of (topic.s || [])) {
        const k = norm(kw);
        if (t.includes(' ' + k + ' ') || t.includes(' ' + k)) score += 5;
      }
      if (score > bestScore) { bestScore = score; best = topic; }
    }
    return bestScore >= 1.4 ? best : FALLBACK;
  };

  /* --- interfaz ---------------------------------------------------------- */
  const orb   = document.getElementById('orb');
  const panel = document.getElementById('chat');
  const veil  = document.getElementById('chatVeil');
  const log   = document.getElementById('chatLog');
  const chips = document.getElementById('chatChips');
  const form  = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  if (!orb || !panel) return;

  let open = false, greeted = false;

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  const push = (html, who='bot') => {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerHTML = html;
    log.appendChild(d); scrollDown();
    return d;
  };

  const setChips = (list=[]) => {
    chips.innerHTML = '';
    list.forEach(label => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.addEventListener('click', () => {
        if (/whatsapp/i.test(label)) { window.open(waLink('Hola MY PACERPRO, quiero más información.'), '_blank', 'noopener'); return; }
        send(label);
      });
      chips.appendChild(b);
    });
  };

  const typing = () => {
    const t = document.createElement('div');
    t.className = 'typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t); scrollDown();
    return t;
  };

  const answer = (q) => {
    const topic = match(q);
    const t = typing();
    const wait = reduce ? 0 : 420 + Math.min(600, q.length * 12);
    setTimeout(() => {
      t.remove();
      push(topic.a);
      setChips(topic.chips || []);
      if (topic.scroll) {
        const target = document.querySelector(topic.scroll);
        if (target) {
          const go = document.createElement('div');
          go.className = 'msg bot';
          go.innerHTML = `<a href="${topic.scroll}">Ir a la sección de coaches →</a>`;
          log.appendChild(go); scrollDown();
          go.querySelector('a').addEventListener('click', () => setOpen(false));
        }
      }
    }, wait);
  };

  const send = (text) => {
    const q = (text || '').trim();
    if (!q) return;
    push(q.replace(/[<>]/g, ''), 'me');
    setChips([]);
    answer(q);
  };

  const greet = () => {
    if (greeted) return; greeted = true;
    push(`¡Hola! Soy el asistente de <b>MY PACERPRO</b>. Te puedo resolver precios, horarios, lugares, planes y coaches.`);
    setChips(['Precios','¿Qué días entrenan?','¿Cómo funciona?','¿Dónde entrenan?']);
  };

  const setOpen = (next) => {
    open = next;
    orb.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false; veil.hidden = false;
      requestAnimationFrame(() => { panel.classList.add('open'); veil.classList.add('show'); });
      greet();
      if (matchMedia('(min-width:1024px)').matches) setTimeout(() => input.focus(), 320);
      if (innerWidth < 1024) document.body.style.overflow = 'hidden';
    } else {
      panel.classList.remove('open'); veil.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => { if (!open) { panel.hidden = true; veil.hidden = true; } }, reduce ? 0 : 420);
      orb.focus();
    }
  };

  orb.addEventListener('click', () => setOpen(!open));
  veil.addEventListener('click', () => setOpen(false));
  document.getElementById('chatClose').addEventListener('click', () => setOpen(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });
  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); input.value = ''; });
})();

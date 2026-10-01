# MY PACERPRO — web oficial

Primera versión funcional de la home. HTML, CSS y JS planos: sin build, sin dependencias,
sin peticiones externas. Todo se sirve como archivos estáticos.

**En vivo:** https://dialdise.github.io/mypacerpro-web-v2/

Para trabajar en local, desde la raíz del repo:

```bash
python3 -m http.server 8910 --bind 127.0.0.1
```

→ http://localhost:8910/

## Estructura

```
index.html            home completa
terminos.html         Términos y Condiciones (borrador, pendiente de revisión legal)
privacidad.html       Política de Privacidad (borrador, pendiente de revisión legal)
assets/style.css      sistema visual (mobile-first)
assets/app.js         nav, menú móvil, reveal al scroll, botón WhatsApp
assets/fonts/         Barlow Condensed 600/700/800 + Inter 400/500/600/700 (subconjunto latino)
assets/img/           10 fotos reales del equipo + wordmark + favicon
```

## Sistema visual

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#111315` | fondo base |
| `--lime` | `#c8f135` | CTA, precios, datos, hover, estados activos |
| `--text` | `#eef0ea` | texto principal |
| `--muted` | `#9aa3a8` | texto secundario |

Titulares en **Barlow Condensed 800** en mayúsculas. Texto en **Inter**. El lima aparece
solo en botones, precios, numeración y acentos: la base se mantiene oscura.

Esquinas de 2px, sin degradados decorativos, sin tarjetas flotantes, sin emojis.

## Decisiones tomadas

**Titular del hero.** De las tres opciones, se eligió **"Tu objetivo. Tu plan. Tu equipo."**
Es la única que dice el diferencial completo —plan individual *más* comunidad— en tres golpes,
funciona en condensada a gran tamaño y cae en tres líneas limpias en móvil. "Entrena con un
propósito" es más genérica y "No es solo entrenar, es saber cómo llegar" es buena frase pero
más larga y abstracta para una primera pantalla. La tercera línea va en lima porque la
pertenencia es el gancho emocional; el plan es el argumento racional.

**Escrim sobre la fotografía.** La sesión se tomó bajo el cielo plano de Lima, casi blanco.
Medido sobre los píxeles reales, el subtítulo del hero daba **1.46:1** en móvil: ilegible.
Con el escrim actual todos los elementos del hero pasan WCAG AA:

| Elemento | Antes (peor caso) | Ahora | Mínimo |
|---|---|---|---|
| H1 | 2.76:1 | 3.66:1 | 3:1 |
| Subtítulo | 1.46:1 | 5.39:1 | 4.5:1 |
| Disciplinas | — | 6.81:1 | 4.5:1 |
| Logo y nav | — | 14.7:1 | 4.5:1 |

**Sección 1:1.** Se resolvió como dos columnas enfrentadas —*Individual* contra *Compartido*—
porque el punto del brief es exactamente esa distinción. Lo individual lleva viñetas lima; lo
compartido, grises.

**Triatlón.** Composición Run + Bike + Swim con el signo `+` entre celdas y el total debajo,
para que la suma se lea sin explicarla.

## Información usada como confirmada

- Precios: Running S/175 y S/160 · Natación S/280 y S/195 · Triatlón S/630 (175+175+280)
- Running presencial: **solo miércoles y sábados**, 4:50 a. m., Parque María Reiche, Miraflores
- Natación piscina: lunes y viernes, 4:50 a. m., Piscina Alfonso Ugarte, San Isidro
- Natación mar: domingos, 5:50 a. m., Playa Pescadores
- 12 sesiones al mes en natación presencial
- TrainingPeaks como plataforma de programación
- WhatsApp +51 995 847 851 e Instagram @mypacerpro — tomados del perfil público de Instagram.
  **Confirmar que el número es el correcto para captación**, aparece en 11 enlaces.

## Pendiente de completar

Marcado en la web con una etiqueta visible «pendiente de confirmar».

1. **Apellido de Crisha** — se entregó solo el nombre de pila; el resto de la ficha está completa.
2. **Resultados y testimonios** — 3 fichas de ejemplo, sin contenido inventado.
3. **Natación semipresencial / virtual** — solo figura precio y modalidad, como se indicó.
4. **Ciclismo** — aparece únicamente como los S/175 que componen el triatlón. Sin horarios,
   sin metodología, sin sesiones.
5. **Formas de pago** — pregunta creada en el FAQ, respuesta pendiente.
6. **Dominio real** — `og:url`, `canonical` y `og:image` apuntan a `www.mypacerpro.com`.
7. **Páginas legales** — redactadas sobre la Ley N° 29571 y la Ley N° 29733, pero son
   **borradores**: faltan razón social, RUC, domicilio fiscal, código RNPDP y plazos, y
   deben pasar por un abogado colegiado en Perú antes de darlas por definitivas.

No se inventó ningún dato en ninguno de esos puntos.

## SEO y accesibilidad

- Un solo `<h1>`, jerarquía `h2`/`h3` por sección, HTML semántico (`header`, `main`, `section`, `footer`).
- `title`, `description`, Open Graph, Twitter Card, `canonical`, favicon SVG.
- JSON-LD `SportsActivityLocation` con las tres sedes, el teléfono y las cinco ofertas con precio.
- `alt` descriptivo en todas las fotos; enlace «saltar al contenido»; foco visible en lima;
  `aria-expanded` en el menú; FAQ con `<details>` nativo (funciona sin JS).
- La arquitectura cubre *running coach Lima*, *entrenamiento running Lima*, *natación Lima* y
  *entrenamiento triatlón Lima* de forma natural, sin repetición forzada.

## Sistema de movimiento

Todo el movimiento comparte una sola cadencia — 620ms, curva `(.22,.7,.28,1)` y 70ms entre
elementos, como una zancada constante. Sin librerías: un único bucle `requestAnimationFrame`
para lo que depende del scroll e `IntersectionObserver` para lo que ocurre una vez.

| Pieza | Qué hace |
|---|---|
| Línea de ritmo | Barra lima de 2px arriba con el progreso de lectura |
| Titulares | Revelado línea por línea con máscara, escalonado |
| Marquesina | Banda cinética que acelera y se inclina con la velocidad del scroll, e invierte el sentido al subir |
| Fotografía | Barrido con `clip-path` al entrar y parallax a distinta velocidad que el texto |
| Precios | Cuentan desde cero al aparecer |
| Triatlón | Las tres celdas se ensamblan desde su lado y los `+` aparecen después |
| Coaches | Formación completa plegada en `<details>`; funciona sin JS |
| Botones | Relleno lima que barre de abajo arriba; en escritorio el contenido se imanta al cursor |
| Nav | Se esconde al bajar y vuelve al subir |
| Grano | Textura fija al 3.8% para quitar el plano digital |

Solo se animan `transform` y `opacity`: nada toca el layout. La marquesina se detiene cuando
sale de pantalla o la pestaña no está visible. Con `prefers-reduced-motion` todo queda estático
y la barra de ritmo desaparece.

## Rendimiento

- Sin librerías. `app.js` son 212 líneas, un solo bucle rAF.
- Fuentes autoalojadas, solo subconjunto latino, con `preload` de las dos críticas.
- Foto del hero con `fetchpriority="high"`; el resto en `loading="lazy"`.
- Reveal por `IntersectionObserver`, que se desconecta tras la primera aparición.
- Se respeta `prefers-reduced-motion`: sin animación y sin transiciones.

## Verificación

Renderizada con Chrome sin interfaz, en escritorio (1440) y móvil (390):
**0 errores de JS, 0 peticiones fallidas, 0 peticiones externas, sin scroll horizontal.**

## Historial

Este repositorio contenía antes una versión basada en la maquetación de `day1-run.webflow.io`,
rebrandeada. Se retiró al publicar esta web, que es código propio escrito desde el brief.
Aquella versión sigue disponible en el historial de git (commit `6af8b28` y anteriores).

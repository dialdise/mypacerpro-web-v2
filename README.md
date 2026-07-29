# MyPacerPro — Web V2

Motion-led direction for [@mypacerpro](https://www.instagram.com/mypacerpro/), built on the layout
and animation system of `day1-run.webflow.io` and rebranded end to end.

Runs fully offline. Sibling to `../MyPacerPro Web`, which is untouched — keep both and pick.

## Run it

```bash
python3 -m http.server 8905 --bind 127.0.0.1 --directory "/Volumes/Eligens/HideInMoscow-Projects/MyPacerPro Web V2"
```

Then open <http://localhost:8905/www/index.html>. Serve from the repo root, not from `www/` —
asset paths climb one level.

## Pages

| Page | Was |
|---|---|
| `www/index.html` | home |
| `www/runs/running.html` | dusseldorf |
| `www/runs/bicicleta.html` | munich |
| `www/runs/natacion.html` | cologne |
| `www/runs/trail.html` | frankfurt |
| `www/runs/fondo.html` | berlin |

## Brand system

Everything MyPacerPro-specific lives in `brand/` so the underlying layout CSS stays re-derivable.

- **`brand/brand.css`** — loaded after the Webflow bundle. Tokens, font wiring, display-type
  retargeting, and the handful of layout corrections the rebrand needed. Each block says why.
- **`brand/fonts/`** — Barlow + Barlow Condensed, latin subset, self-hosted (103 KB total).
- **`brand/logo-*.svg`, `brand/mark-white.svg`** — the wordmark, white / dark / red.
- **`brand/photos/`** — 6 Instagram photos + 9 Unsplash.
- **`brand/favicon.svg`**

### Colour

| Token | Value | Was |
|---|---|---|
| `--mpp-ink` | `#0F0A0A` | `#0e0d0d` |
| `--mpp-surface` | `#241717` | `#2f2f2f` |
| `--mpp-red` | `#DC2626` | `#c75d5f` |
| `--mpp-red-deep` | `#991B1B` | `#7d1316` |
| `--mpp-muted` | `#9C9090` | `#919191` |

Gold `#FBBF24` is new — the source design had only one accent level.

### Type

Barlow (body) and Barlow Condensed (display), matching the current MyPacerPro site. day one®'s
licensed `.woff2` files were deleted, not reused. The bundle's two `@font-face` rules were
repointed at Barlow, so every existing rule kept working; `brand.css` then retargets the display
tiers to Condensed, since the identity is condensed and the source design was not.

### Logo

The real wordmark is only published as a 150×150 Instagram avatar, far too low-res to use. It was
redrawn as SVG in Barlow Condensed 800 with `PRO` italic and the trailing period. Because these
load through `<img>` — an isolated document that cannot reach page fonts — each logo embeds the
font as a data URI, which is why they are ~40 KB each.

## What changed from the source

- All day one® photography, hero video and licensed fonts **deleted**, not reskinned.
- Wordmarks, signature and slogan SVGs regenerated **at their original paths**, so the GSAP
  animations bound to those elements keep working.
- 81 inline hand-lettering SVGs (`Join the Run`, `Shop Now`, `You vs You`…) replaced with
  typographic equivalents. Each keeps a dummy `<path>` so DrawSVG has a target and does not throw.
- Copy rewritten to Spanish throughout, from the real account: *Planes virtuales y presenciales —
  RUNNING | BICICLETA | NATACIÓN*, Lima, WhatsApp `+51 995 847 851`.
- `gear-up` (apparel) became **Planes**, reusing the Base / Rendimiento / Campeón tiers from the
  current MyPacerPro site. Five German city pages became the five disciplines.
- day one®'s agency credits (Somefolk, FutureThree, Eduard Bodak) replaced with MyPacerPro contact
  details — leaving another studio's credits on this site would have been wrong.

## Known gaps

- **The hero is a still, not video.** The source used a full-bleed autoplay clip and MyPacerPro has
  no footage in hand. `u-hero.jpg` stands in as the poster. A 10–15s loop would restore the
  original effect and is the single highest-impact upgrade.
- **Only 6 Instagram photos.** Logged-out Instagram caps the grid at 6, and all six are wide group
  shots — no action, cycling or swimming. They carry the community sections well; everything else
  is Unsplash. Dropping a folder of real photos in `brand/photos/` and re-pointing the `<img>` srcs
  is the fix.
- **Session dates, times and meeting points are placeholders.** `Costa Verde`, `Malecón de
  Miraflores`, `Ciclovía Costanera` are plausible Lima locations, not confirmed ones, and the dates
  are inherited from the source. Verify before publishing.
- **Plan pricing is absent** — the current MyPacerPro site has none either.
- **The Webflow badge still makes 2 requests.** Hidden via CSS; the URLs are hardcoded in
  `webflow.js`.
- **Structure is still day one®'s.** Markup, Webflow CSS and the Slater choreography are theirs;
  this is a rebrand of their build, not an independent implementation. Fine as an internal
  direction, worth a rewrite before it becomes the public mypacerpro.com.

## Verification

Driven headless through Playwright against a local server, logging every non-localhost request:
all 6 pages render with **zero failed responses and zero page errors**, at multiple scroll depths.

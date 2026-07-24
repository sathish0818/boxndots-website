# BoxnDots — Creative & Branding Studio

The official website for **BoxnDots**, an independent creative & branding studio.
We build brands people remember — identity, design, motion, digital & strategy.

A dark, minimal, boldly-typographic single-page site built with vanilla web tech.

## Live sections

- **Hero** — oversized editorial statement + call to action
- **Studio** — intro statement with scroll-scrubbed word highlight + animated stats
- **Services** — compact 9-item grid
- **Reviews** — auto-playing testimonial carousel
- **Team** — 3-up photo carousel with paging arrows
- **Clients** — infinite rolling logo ticker
- **Contact** — big call-to-action + validated contact form

## Tech

- **HTML5 / CSS3 / vanilla JavaScript** — no framework, no build step
- **GSAP + ScrollTrigger** (via CDN) — hero reveal, scroll animations, count-up
- **Lenis** (via CDN) — smooth scrolling
- **Google Fonts** — Space Grotesk (display), Inter (body), Instrument Serif (accent)
- CSS custom properties for theming — dark default with a light theme toggle
- Fully responsive (desktop-first breakpoints) and `prefers-reduced-motion` aware

## Run locally

It is fully static — serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
.
├── index.html
├── css/
│   ├── style.css        # design system + components
│   ├── animations.css   # keyframes + motion utilities
│   └── responsive.css   # breakpoints
├── js/
│   ├── main.js          # app logic, content, carousels, forms, loader
│   ├── animation.js     # GSAP hero + scroll reveals + count-up
│   ├── theme.js         # dark/light theme manager
│   ├── cursor.js        # (disabled) custom cursor
│   └── particles.js     # (disabled) particle layer
└── assets/
    ├── vectors/         # logo + favicon
    ├── textures/        # grain overlay
    └── images/          # team, testimonials, portfolio (SVG placeholders)
```

## Deploy (GitHub Pages)

Settings → Pages → Deploy from branch → `main` / root. The site is CDN-driven, so no build is required.

---

© BoxnDots — Creative & Branding Studio.

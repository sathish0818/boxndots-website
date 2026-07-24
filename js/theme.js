/* ==========================================================================
   BoxnDots — Theme manager (Dark Obsidian / Light Luxury Glass)
   Persists to localStorage, respects system preference on first visit, and
   smoothly transitions the whole site + the WebGL scene. No flashing.
   ========================================================================== */
(function () {
  const root = document.documentElement;
  const KEY = 'boxndots-theme';

  function apply(theme, animate) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    if (window.BoxnScene && window.BoxnScene.updateTheme) window.BoxnScene.updateTheme();
    if (animate && window.gsap) {
      gsap.fromTo('.service-card, .metric, .testi-card',
        { scale: 0.985 }, { scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.02 });
    }
  }

  // Minimal dark is the primary look — default to dark unless the user chose light.
  const stored = localStorage.getItem(KEY);
  const initial = stored || 'dark';
  apply(initial, false);

  // Retint the 3D scene once it is ready (it may still be initialising above)
  const wait = setInterval(() => {
    if (window.BoxnScene && window.BoxnScene.updateTheme) { window.BoxnScene.updateTheme(); clearInterval(wait); }
  }, 120);
  setTimeout(() => clearInterval(wait), 4000);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    apply(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
  });

  matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(KEY)) apply(e.matches ? 'light' : 'dark', true);
  });
})();

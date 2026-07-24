/* ==========================================================================
   BoxnDots — GSAP animation layer ("Studio" redesign)
   Hero reveal, word-by-word intro highlight, editorial reveals, count-up,
   magnetic buttons, ripple, and the signature PINNED HORIZONTAL work scroll.
   Runs after main.js fires 'boxn:loaded'. Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  function splitWords(el) {
    const text = el.textContent.replace(/\s+/g, ' ').trim(); el.textContent = '';
    const frag = document.createDocumentFragment();
    text.split(' ').forEach((word, i) => { if (i) frag.appendChild(document.createTextNode(' ')); const s = document.createElement('span'); s.className = 'split-char'; s.textContent = word; frag.appendChild(s); });
    el.appendChild(frag);
    return el.querySelectorAll('.split-char');
  }

  function countUp(el) {
    if (el.dataset.counted) return; el.dataset.counted = '1';
    const target = +el.dataset.count;
    if (reduced || !hasGSAP) { el.textContent = target; return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.floor(o.v); } });
  }
  function countInit() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (!hasGSAP || !window.ScrollTrigger) { nums.forEach(countUp); return; }
    nums.forEach((n) => ScrollTrigger.create({ trigger: n, start: 'top 92%', once: true, onEnter: () => countUp(n) }));
  }

  /* ---------- Hero entrance ---------- */
  function heroIn() {
    if (!hasGSAP) { document.querySelectorAll('[data-reveal]').forEach((e) => (e.style.opacity = 1)); return; }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.nav', { autoAlpha: 0, duration: 1, ease: 'power2.out' }, 0.1);
    tl.from('.hero-top .label', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.2);
    tl.from('.hero-statement [data-hero-line]', { yPercent: 115, opacity: 0, duration: 1.15, stagger: 0.09 }, 0.25);
    tl.from('.hero-sub', { y: 22, opacity: 0, duration: 0.8 }, 0.7);
    tl.from('.hero-actions', { y: 22, opacity: 0, duration: 0.8 }, 0.8);
    tl.from('.seal', { scale: 0.5, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, 0.7);
  }

  /* ---------- Reveals (refresh-proof fromTo) ---------- */
  function scrollReveals() {
    if (!hasGSAP || !window.ScrollTrigger) { document.querySelectorAll('[data-reveal]').forEach((e) => (e.style.opacity = 1)); return; }
    const reveal = (targets, from, to, trigger, start = 'top 86%') => {
      const items = typeof targets === 'string' ? gsap.utils.toArray(targets) : targets;
      if (!items.length) return;
      gsap.fromTo(items, from, { ...to, immediateRender: false, scrollTrigger: { trigger: trigger || items[0], start, toggleActions: 'play none none none' } });
    };

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      if (el.closest('#hero')) return;
      reveal([el], { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, el, 'top 90%');
    });
    gsap.utils.toArray('.section-head h2, .contact-huge').forEach((h) => {
      const words = splitWords(h);
      reveal(words, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, h, 'top 85%');
    });
    reveal('.svc-row', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, '.svc-list', 'top 82%');
    reveal('.work-row', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, '.work-list', 'top 82%');
    reveal('.stat', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, '.stats', 'top 85%');

    /* Intro statement: words fade from mute → full as you scroll through */
    const intro = document.querySelector('[data-words]');
    if (intro && !reduced) {
      const words = splitWords(intro);
      words.forEach((w) => w.classList.add('w'));
      // keep the serif accent styling
      ScrollTrigger.create({
        trigger: intro, start: 'top 78%', end: 'bottom 55%', scrub: 0.6,
        onUpdate: (self) => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); },
      });
    } else if (intro) { splitWords(intro).forEach((w) => w.classList.add('w', 'on')); }
  }

  /* ---------- Signature: pinned horizontal work scroll ----------
     gsap.matchMedia enables the pin on desktop and cleans it up on mobile
     (where CSS provides native horizontal swipe) — robust across resizes. */
  function horizontalWork() {
    if (reduced || !hasGSAP || !window.ScrollTrigger || !gsap.matchMedia) return;
    const pin = document.getElementById('work-pin');
    const track = document.getElementById('work-track');
    if (!pin || !track) return;
    const cards = track.querySelectorAll('.work-card').length || 1;
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
    gsap.matchMedia().add('(min-width: 861px)', () => {
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '#work', start: 'top top', end: () => '+=' + dist(),
          pin: pin, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => {
            const bar = document.getElementById('work-bar');
            if (bar) bar.style.width = (12 + self.progress * 88) + '%';
            const count = document.getElementById('work-count');
            if (count) count.textContent = String(Math.min(cards, Math.floor(self.progress * cards) + 1)).padStart(2, '0');
          },
        },
      });
      return () => tw.scrollTrigger && tw.scrollTrigger.kill(true);
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function magnetics() {
    if (reduced || !matchMedia('(hover:hover)').matches) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      if (el.dataset.magBound) return; el.dataset.magBound = '1';
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.4, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: 'power3.out' }); });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }));
    });
  }

  /* ---------- Ripple ---------- */
  function ripples() {
    document.querySelectorAll('[data-ripple]').forEach((btn) => {
      if (btn.dataset.rippleBound) return; btn.dataset.rippleBound = '1';
      btn.addEventListener('pointerdown', (e) => { const r = btn.getBoundingClientRect(), span = document.createElement('span'); span.className = 'ripple'; const size = Math.max(r.width, r.height); span.style.width = span.style.height = size + 'px'; span.style.left = (e.clientX - r.left - size / 2) + 'px'; span.style.top = (e.clientY - r.top - size / 2) + 'px'; btn.appendChild(span); setTimeout(() => span.remove(), 600); });
    });
  }

  document.addEventListener('boxn:loaded', () => {
    heroIn(); scrollReveals(); countInit(); horizontalWork(); magnetics(); ripples();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
  window.BoxnAnim = { refresh() { magnetics(); ripples(); if (window.ScrollTrigger) ScrollTrigger.refresh(); } };
})();

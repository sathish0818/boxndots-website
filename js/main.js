/* ==========================================================================
   BoxnDots — Main app logic ("Studio" redesign)
   Lenis smooth scroll, loader, content injection (services list, horizontal
   work showcase, big testimonial carousel, client logos), modal, forms,
   mobile menu, scroll UI. Horizontal-scroll pinning lives in animation.js.
   ========================================================================== */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- Lenis smooth scroll -------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.5 });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  window.BoxnLenis = lenis;

  /* -------- Data -------- */
  const SERVICES = [
    { title: 'Brand Identity', desc: 'Logos, systems and visual languages that make you unmistakable.' },
    { title: 'Graphic Design', desc: 'Print, packaging and campaign design crafted to the pixel.' },
    { title: 'Motion Graphics', desc: 'Kinetic type and brand films that command attention.' },
    { title: 'Video Editing', desc: 'Cinematic edits, colour and sound for launches.' },
    { title: 'UX / UI Design', desc: 'Interfaces engineered for delight and conversion.' },
    { title: 'Digital Marketing', desc: 'Full-funnel campaigns that turn attention into growth.' },
    { title: 'SEO', desc: 'Technical + content SEO that keeps you on top.' },
    { title: 'Social Media', desc: 'Always-on content that builds real audiences.' },
    { title: 'Creative Strategy', desc: 'Positioning and narrative that give your brand a backbone.' },
  ];
  const PROJECTS = [
    { img: 1, cat: 'Branding', title: 'Nova Identity', client: 'Nova Labs', year: '2025', scope: 'Brand · Identity', desc: 'A living identity system for a deep-tech studio — modular marks and a full brand world.' },
    { img: 2, cat: 'Motion', title: 'Orbit Launch Film', client: 'Orbit', year: '2025', scope: 'Motion · Film', desc: 'A 60-second launch film that announced a category-defining product.' },
    { img: 3, cat: 'UX / UI', title: 'Pixel Dashboard', client: 'Pixel', year: '2024', scope: 'Product · UX/UI', desc: 'An analytics product reimagined into a calm, powerful interface.' },
    { img: 4, cat: 'Branding', title: 'Vertex Rebrand', client: 'Vertex', year: '2024', scope: 'Brand · Strategy', desc: 'A full rebrand that repositioned Vertex as the premium choice.' },
    { img: 5, cat: 'Marketing', title: 'Lumen Campaign', client: 'Lumen', year: '2025', scope: 'Marketing · Social', desc: 'An always-on campaign that tripled engagement in a quarter.' },
    { img: 6, cat: 'Motion', title: 'Zenith Sizzle', client: 'Zenith', year: '2024', scope: 'Motion · 3D', desc: 'A bold product sizzle reel used across launch and retail.' },
    { img: 7, cat: 'UX / UI', title: 'Flow Mobile App', client: 'Flow', year: '2025', scope: 'Product · Mobile', desc: 'A finance app redesigned around trust, speed and motion.' },
    { img: 8, cat: 'Marketing', title: 'Aura Growth', client: 'Aura', year: '2024', scope: 'SEO · Growth', desc: 'Technical SEO + content that lifted organic traffic 240%.' },
  ];
  const TESTIMONIALS = [
    { avatar: 1, name: 'Dr. Rajarajan B', role: 'Pain Specialist · Personal Branding', quote: 'Box & Dots completely transformed my personal brand — every detail looked premium and professional.' },
    { avatar: 2, name: 'Rajesh Murugan', role: 'ADS Infraa · Social Media Marketing', quote: 'They built us a strong, consistent social presence. Better visibility, great audience feedback — highly recommended.' },
    { avatar: 3, name: 'Meena Sathya Kumar', role: 'Brand Identity', quote: 'They perfectly captured my brand\'s vision. The identity felt unique, memorable and truly mine.' },
    { avatar: 4, name: 'Bharath Chandar', role: 'Construction Company · Brand Identity', quote: 'We wanted a brand that reflected trust and professionalism — Box & Dots delivered exactly that.' },
    { avatar: 5, name: 'Deepak', role: 'Influencer Branding', quote: 'Box & Dots gave me a personal brand that truly represents me — clean, creative work that elevated my online presence.' },
  ];

  /* -------- Services list -------- */
  const svc = $('#svc-list');
  if (svc) svc.innerHTML = SERVICES.map((s, i) => `
    <div class="svc-row" data-cursor>
      <span class="svc-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="svc-title">${s.title}</span>
      <span class="svc-desc">${s.desc}</span>
      <span class="svc-arrow"><svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </div>`).join('');

  /* -------- Our clients (single rolling LOGO ticker — distinct from the hero marquee) -------- */
  const clientTrack = $('#client-track');
  if (clientTrack) {
    const MARKS = [
      '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>',
      '<rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="2"/>',
      '<circle cx="12" cy="12" r="7.5" fill="currentColor"/>',
      '<rect x="6.5" y="6.5" width="11" height="11" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="2"/>',
      '<path d="M12 4 20.5 19H3.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      '<g fill="currentColor"><circle cx="8" cy="8" r="2.6"/><circle cx="16" cy="8" r="2.6"/><circle cx="8" cy="16" r="2.6"/><circle cx="16" cy="16" r="2.6"/></g>',
      '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
      '<rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    ];
    const set = PROJECTS.map((p, i) => `<span class="client-logo"><svg class="cl-mark" viewBox="0 0 24 24" fill="none">${MARKS[i % MARKS.length]}</svg><b>${p.client}</b></span>`).join('');
    clientTrack.innerHTML = set + set;   // duplicated for a seamless infinite loop
  }

  /* -------- Team -------- */
  const TEAM = [
    { name: 'Avinash S', role: 'Founder & CEO', img: 1 },
    { name: 'Balaji G', role: 'Creative Head', img: 2 },
    { name: 'Archana Devi', role: 'Sr. UX/UI Designer', img: 3 },
    { name: 'Suma Jayasree JS', role: 'Visual Designer', img: 4 },
    { name: 'Ratha Krishnan', role: 'Full Stack Developer', img: 5 },
    { name: 'Kavimani K', role: 'Digital Marketing Manager', img: 6 },
  ];
  const teamGrid = $('#team-grid');
  if (teamGrid) {
    teamGrid.innerHTML = TEAM.map((m) => `
      <figure class="team-card" data-reveal>
        <div class="photo"><img src="assets/images/team/member-${m.img}.jpg" onerror="this.onerror=null;this.src='assets/images/team/member-${m.img}.svg'" alt="${m.name}, ${m.role}" loading="lazy" /></div>
        <figcaption><h4>${m.name}</h4><span>${m.role}</span></figcaption>
      </figure>`).join('');

    /* carousel: 3 visible (2 on tablet, 1 on phone), arrows page one card at a time */
    const prev = $('#team-prev'), next = $('#team-next');
    let idx = 0;
    const visible = () => (innerWidth <= 560 ? 1 : innerWidth <= 860 ? 2 : 3);
    const maxIdx = () => Math.max(0, TEAM.length - visible());
    function update() {
      idx = Math.min(idx, maxIdx());
      const card = teamGrid.querySelector('.team-card');
      const gap = parseFloat(getComputedStyle(teamGrid).columnGap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      teamGrid.style.transform = `translateX(${-idx * step}px)`;
      if (prev) prev.disabled = idx <= 0;
      if (next) next.disabled = idx >= maxIdx();
    }
    prev?.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
    next?.addEventListener('click', () => { idx = Math.min(maxIdx(), idx + 1); update(); });
    addEventListener('resize', update, { passive: true });
    update(); addEventListener('load', update);   // set initial state immediately (rAF-independent)
  }

  /* modal (retained but unused — clients link to contact) */
  const backdrop = $('#modal-backdrop');
  function openModal(i) {
    const p = PROJECTS[i]; if (!p) return;
    $('#modal-thumb').style.cssText = `background-image:url(assets/images/portfolio/project-${p.img}.svg);background-size:cover;background-position:center;`;
    $('#modal-cat').textContent = p.cat; $('#modal-title').textContent = p.title;
    $('#modal-desc').textContent = p.desc; $('#modal-client').textContent = p.client;
    $('#modal-year').textContent = p.year; $('#modal-scope').textContent = p.scope;
    backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lenis?.stop();
  }
  function closeModal() { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lenis?.start(); }
  /* client rows link to #contact (handled by the anchor-scroll handler) — no case-study modal */
  $('#modal-close')?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* -------- Testimonials (big fade carousel) -------- */
  const testiTrack = $('#testi-track'), testiNav = $('#testi-nav');
  if (testiTrack) {
    testiTrack.innerHTML = TESTIMONIALS.map((t, i) => `
      <blockquote class="testi-slide ${i === 0 ? 'active' : ''}" data-i="${i}">
        <p class="testi-quote-big">“${t.quote}”</p>
        <div class="testi-author"><img src="assets/images/testimonials/avatar-${t.avatar}.svg" alt="${t.name}" loading="lazy" /><div><b>${t.name}</b><span>${t.role}</span></div></div>
      </blockquote>`).join('');
    testiNav.innerHTML = TESTIMONIALS.map((_, i) => `<button class="testi-dot ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Testimonial ${i + 1}" data-cursor></button>`).join('');
    const slides = $$('.testi-slide', testiTrack); let active = 0, timer;
    const go = (i) => { active = (i + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('active', k === active)); $$('.testi-dot', testiNav).forEach((d, k) => d.classList.toggle('active', k === active)); };
    testiNav.addEventListener('click', (e) => { const d = e.target.closest('.testi-dot'); if (d) { go(+d.dataset.i); restart(); } });
    const auto = () => { timer = setInterval(() => go(active + 1), 5000); };
    const restart = () => { clearInterval(timer); auto(); };
    if (!reduced) auto();
  }

  /* -------- Client logos -------- */
  const logos = $('#client-logos');
  if (logos) logos.innerHTML = [1, 2, 3, 4, 5, 6].map((c) => `<img src="assets/images/about/client-${c}.svg" alt="Client logo" loading="lazy" />`).join('');

  /* -------- Mobile menu -------- */
  const burger = $('#nav-burger'), mobile = $('#mobile-menu');
  burger?.addEventListener('click', () => { const open = mobile.classList.toggle('open'); burger.setAttribute('aria-expanded', open); });
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => mobile.classList.remove('open')));

  /* -------- Anchor links -------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = document.querySelector(id); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.2 }); else t.scrollIntoView({ behavior: 'smooth' });
    mobile?.classList.remove('open');
  }));

  /* -------- Scroll UI (progress, nav hide/show, active) -------- */
  const bar = $('#scroll-progress'), nav = $('#nav');
  const links = $$('.nav-links a'), sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (y > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    nav.classList.toggle('hidden', y > lastY && y > 400); lastY = y;
    const mid = y + innerHeight * 0.4; let cur = sections[0];
    for (const s of sections) if (s.offsetTop <= mid) cur = s;
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + cur?.id));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* -------- Forms -------- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const form = $('#contact-form'), status = $('#form-status');
  function validateField(field) {
    const input = field.querySelector('input, textarea'); if (!input || !input.required) return true;
    let ok = input.value.trim().length > 0; if (input.type === 'email') ok = emailRe.test(input.value.trim());
    field.classList.toggle('invalid', !ok); return ok;
  }
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$$('.field', form).map(validateField).every(Boolean)) { status.textContent = 'Please fix the highlighted fields.'; status.style.color = '#ff6b8a'; return; }
    const btn = $('.form-submit', form); btn.style.pointerEvents = 'none'; status.style.color = 'var(--accent-strong)'; status.textContent = 'Sending…';
    setTimeout(() => { status.textContent = '✓ Thank you! We\'ll reply within one business day.'; form.reset(); btn.style.pointerEvents = ''; }, 1200);
  });
  form?.addEventListener('input', (e) => { const f = e.target.closest('.field'); if (f?.classList.contains('invalid')) validateField(f); });
  const news = $('#news-form');
  news?.addEventListener('submit', (e) => {
    e.preventDefault(); const ns = $('#news-status'), email = $('#news-email').value.trim();
    if (!emailRe.test(email)) { ns.textContent = 'Enter a valid email.'; ns.style.color = '#ff6b8a'; return; }
    ns.style.color = 'var(--accent-strong)'; ns.textContent = '✓ Subscribed! Welcome.'; news.reset();
  });

  /* -------- Footer year -------- */
  $('#year').textContent = new Date().getFullYear();

  /* -------- Loader -------- */
  (function loader() {
    const el = $('#loader'), fill = $('#loader-fill'), pct = $('#loader-percent');
    if (!el) { document.dispatchEvent(new CustomEvent('boxn:loaded')); return; }
    let progress = 0, done = false;
    const timer = setInterval(() => { if (done) return; progress += Math.max(0.6, (100 - progress) * 0.05); if (progress > 99) progress = 99; paint(); }, 40);
    function paint() { const p = Math.floor(progress); if (pct) pct.textContent = p; if (fill) fill.style.width = p + '%'; }
    function finish() {
      if (done) return; done = true; clearInterval(timer); progress = 100; paint();
      setTimeout(() => { el.classList.add('done'); document.body.classList.add('loaded'); document.dispatchEvent(new CustomEvent('boxn:loaded')); setTimeout(() => el.remove(), 900); }, 350);
    }
    if (document.readyState === 'complete') setTimeout(finish, 600); else addEventListener('load', () => setTimeout(finish, 600));
    setTimeout(finish, 5000);
  })();

  requestAnimationFrame(() => window.BoxnAnim?.refresh());
})();

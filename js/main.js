/* ==========================================================================
   BoxnDots — "Louder Design" interactions (vanilla, dependency-light)
   Mobile menu, nav behaviour, hero reveal, scroll reveals, manifesto word
   highlight, process timeline, testimonials, team, form (mailto), magnetics,
   cursor label, SVG line draw. Honors prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* -------- data -------- */
  const TEAM = [
    { name: 'Avinash S', role: 'Founder & CEO', img: 1 },
    { name: 'Balaji G', role: 'Creative Head', img: 2 },
    { name: 'Archana Devi', role: 'Visual Designer', img: 3 },
    { name: 'Suma Jayasree JS', role: 'Visual Designer', img: 4 },
    { name: 'Ratha Krishnan', role: 'Full Stack Developer', img: 5 },
    { name: 'Kavimani K', role: 'Digital Marketing Manager', img: 6 },
  ];
  const TESTIMONIALS = [
    { name: 'Dr. Rajarajan B', role: 'Pain Specialist · Personal Branding', quote: 'Box & Dots completely transformed my personal brand — every detail looked premium and professional.' },
    { name: 'Rajesh Murugan', role: 'ADS Infraa · Social Media Marketing', quote: 'They built us a strong, consistent social presence. Better visibility, great audience feedback — highly recommended.' },
    { name: 'Meena Sathya Kumar', role: 'Brand Identity', quote: 'They perfectly captured my brand’s vision — unique, memorable and truly mine.' },
    { name: 'Bharath Chandar', role: 'Construction Company · Brand Identity', quote: 'We wanted a brand that reflected trust and professionalism — Box & Dots delivered exactly that.' },
    { name: 'Deepak', role: 'Influencer Branding', quote: 'Clean, creative work that made my profile stand out and elevated my online presence.' },
  ];

  /* -------- team render -------- */
  const teamGrid = $('#team-grid');
  if (teamGrid) {
    teamGrid.innerHTML = TEAM.map((m) => `
      <article class="member" data-reveal>
        <div class="member__photo"><img src="assets/images/team/member-${m.img}.jpg" alt="${m.name}, ${m.role}" loading="lazy" /></div>
        <h3 class="member__name">${m.name}</h3>
        <p class="member__role">${m.role}</p>
      </article>`).join('');
  }

  /* -------- testimonials render + carousel -------- */
  const stage = $('#testi-stage'), tnav = $('#testi-nav');
  if (stage && tnav) {
    stage.innerHTML = TESTIMONIALS.map((t, i) => `
      <blockquote class="testi__slide ${i === 0 ? 'active' : ''}" data-i="${i}" aria-hidden="${i !== 0}">
        <p class="testi__q">“${t.quote}”</p>
        <div class="testi__who"><span class="mk" aria-hidden="true">${t.name[0]}</span><div><b>${t.name}</b><span>${t.role}</span></div></div>
      </blockquote>`).join('');
    tnav.innerHTML = TESTIMONIALS.map((_, i) => `<button class="testi__dot ${i === 0 ? 'active' : ''}" role="tab" aria-label="Testimonial ${i + 1}" aria-selected="${i === 0}"></button>`).join('');
    const slides = $$('.testi__slide', stage), dots = $$('.testi__dot', tnav);
    let cur = 0, timer;
    const go = (n) => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('active', k === cur); s.setAttribute('aria-hidden', k !== cur); });
      dots.forEach((d, k) => { d.classList.toggle('active', k === cur); d.setAttribute('aria-selected', k === cur); });
    };
    const start = () => { if (!reduced) timer = setInterval(() => go(cur + 1), 6000); };
    const stop = () => clearInterval(timer);
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); stop(); start(); }));
    tnav.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { go(cur + 1); stop(); start(); }
      if (e.key === 'ArrowLeft') { go(cur - 1); stop(); start(); }
    });
    start();
  }

  /* -------- mobile menu -------- */
  const burger = $('#burger'), mm = $('#mobile-menu');
  burger?.addEventListener('click', () => {
    const open = mm.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => {
    mm.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }));

  /* -------- nav scroll behaviour + active link -------- */
  const nav = $('#nav');
  const navLinks = $$('.nav-links a');
  const secs = navLinks.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  let lastY = 0;
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('shrunk', y > 30);
    nav.classList.toggle('hidden', y > lastY && y > 480 && !mm.classList.contains('open'));
    lastY = y;
    const mid = y + innerHeight * 0.35;
    let id = secs[0]?.id;
    for (const s of secs) if (s.offsetTop <= mid) id = s.id;
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- hero reveal + SVG draw -------- */
  requestAnimationFrame(() => $('.hero')?.classList.add('in'));
  $$('.draw').forEach((p) => {
    const len = p.getTotalLength ? p.getTotalLength() : 200;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = reduced ? 0 : len;
  });

  /* -------- scroll reveals -------- */
  const revIO = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('seen');
      $$('.draw', e.target).forEach((p) => { p.style.transition = 'stroke-dashoffset 1s var(--ease)'; p.style.strokeDashoffset = 0; });
      revIO.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((el) => revIO.observe(el));
  // draw hero arrow once hero is in view
  const heroArrow = $('.hero__arrow');
  if (heroArrow && !reduced) setTimeout(() => $$('.draw', heroArrow).forEach((p) => { p.style.transition = 'stroke-dashoffset 1.1s var(--ease)'; p.style.strokeDashoffset = 0; }), 700);

  /* -------- manifesto word highlight on scroll -------- */
  const man = $('#manifesto');
  if (man) {
    const words = man.textContent.trim().split(/\s+/);
    man.innerHTML = words.map((w) => {
      const blue = /feel/i.test(w);
      return `<span class="w${blue ? ' blue' : ''}">${w}</span>`;
    }).join(' ');
    const ws = $$('.w', man);
    if (reduced) { ws.forEach((w) => w.classList.add('on')); }
    else {
      const upd = () => {
        const r = man.getBoundingClientRect();
        const prog = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.4)));
        const n = Math.round(prog * ws.length);
        ws.forEach((w, i) => w.classList.toggle('on', i < n));
      };
      addEventListener('scroll', upd, { passive: true }); upd();
    }
  }

  /* -------- process timeline -------- */
  const steps = $('#steps');
  if (steps) {
    const fill = $('#steps-fill'), stepEls = $$('[data-step]', steps);
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        if (fill && !reduced) fill.style.transform = 'scaleX(1)';
        stepEls.forEach((s, i) => setTimeout(() => s.classList.add('on'), reduced ? 0 : 250 + i * 260));
        io.disconnect();
      });
    }, { threshold: 0.3 });
    io.observe(steps);
  }

  /* -------- magnetic buttons (fine pointer only) -------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* -------- cursor-following label on project media (desktop) -------- */
  const cl = $('#cursor-label');
  if (cl && finePointer) {
    $$('.proj__media').forEach((m) => {
      m.addEventListener('pointerenter', () => { cl.textContent = 'View'; cl.classList.add('show'); });
      m.addEventListener('pointermove', (e) => { cl.style.left = e.clientX + 'px'; cl.style.top = e.clientY + 'px'; });
      m.addEventListener('pointerleave', () => cl.classList.remove('show'));
    });
  }

  /* -------- hero sticker parallax (subtle) -------- */
  const stageEl = $('.hero__stage');
  if (stageEl && finePointer && !reduced) {
    stageEl.addEventListener('pointermove', (e) => {
      const r = stageEl.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      $$('[data-float]', stageEl).forEach((s, i) => { s.style.marginLeft = dx * (6 + i * 3) + 'px'; s.style.marginTop = dy * (6 + i * 3) + 'px'; });
    });
    stageEl.addEventListener('pointerleave', () => $$('[data-float]', stageEl).forEach((s) => { s.style.marginLeft = ''; s.style.marginTop = ''; }));
  }

  /* -------- contact form (validate → mailto; no fake success) -------- */
  const form = $('#form'), status = $('#form-status');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validate(field) {
    const input = field.querySelector('input,select,textarea');
    if (!input || !input.required) return true;
    let ok = input.value.trim().length > 0;
    if (input.type === 'email') ok = emailRe.test(input.value.trim());
    field.classList.toggle('invalid', !ok);
    return ok;
  }
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = $$('.field', form);
    const allOk = fields.map(validate).every(Boolean);
    if (!allOk) { status.textContent = 'Almost — please fix the highlighted fields.'; status.className = 'form__status bad'; return; }
    const v = (n) => (form.elements[n]?.value || '').trim();
    const subject = `New project enquiry — ${v('name')}`;
    const body = [
      `Name: ${v('name')}`, `Email: ${v('email')}`, `Company/brand: ${v('company') || '—'}`,
      `Service: ${v('service') || '—'}`, `Budget: ${v('budget') || '—'}`, '', 'Details:', v('details'),
    ].join('\n');
    window.location.href = `mailto:hello@boxndots.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = '✓ Opening your email app… if nothing happens, write to hello@boxndots.com';
    status.className = 'form__status ok';
  });
  form?.addEventListener('input', (e) => { const f = e.target.closest('.field'); if (f?.classList.contains('invalid')) validate(f); });

  /* -------- footer year -------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();

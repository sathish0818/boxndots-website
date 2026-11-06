/* BoxnDots - interactions: mobile menu + testimonials carousel */
(function () {
  'use strict';

  /* ---- mobile menu ---- */
  var burger = document.querySelector('.nav__burger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    var closeBtn = menu.querySelector('.menu__close');
    var openMenu = function () {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    var closeMenu = function () {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });
  }

  /* ---- book a call modal (Google Meet scheduling) ---- */
  var bookBtns = document.querySelectorAll('[data-book]');
  var modal = document.getElementById('bookModal');
  if (modal && bookBtns.length) {
    var frame = modal.querySelector('iframe');
    var openModal = function (e) {
      if (e) e.preventDefault();
      if (frame && !frame.src && frame.getAttribute('data-src')) frame.src = frame.getAttribute('data-src');
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    var closeModal = function () { modal.hidden = true; document.body.style.overflow = ''; };
    bookBtns.forEach(function (b) { b.addEventListener('click', openModal); });
    modal.querySelectorAll('[data-close]').forEach(function (c) { c.addEventListener('click', closeModal); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  }

  /* ---- testimonials carousel (mobile) ---- */
  var testi = document.querySelector('[data-testi]');
  if (testi) {
    var track = testi.querySelector('.testi__track');
    var cards = Array.prototype.slice.call(track.children);
    var ctrl = testi.querySelector('.testi__ctrl');
    var dotsWrap = testi.querySelector('[data-dots]');

    if (cards.length > 1 && ctrl && dotsWrap) {
      cards.forEach(function (card, i) {
        var b = document.createElement('button');
        b.className = 'testi__dot' + (i === 0 ? ' is-active' : '');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        b.addEventListener('click', function () { scrollToCard(i); });
        dotsWrap.appendChild(b);
      });
      var dots = Array.prototype.slice.call(dotsWrap.children);
      ctrl.hidden = false;

      var scrollToCard = function (i) {
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      };
      var currentIndex = function () {
        var center = track.scrollLeft + track.clientWidth / 2;
        var best = 0, bd = Infinity;
        cards.forEach(function (c, i) {
          var cc = c.offsetLeft + c.clientWidth / 2;
          var d = Math.abs(cc - center);
          if (d < bd) { bd = d; best = i; }
        });
        return best;
      };
      var sync = function () {
        var idx = currentIndex();
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      };
      var ticking = false;
      track.addEventListener('scroll', function () {
        if (!ticking) { window.requestAnimationFrame(function () { sync(); ticking = false; }); ticking = true; }
      }, { passive: true });

      var prev = testi.querySelector('[data-prev]');
      var next = testi.querySelector('[data-next]');
      if (prev) prev.addEventListener('click', function () { scrollToCard(Math.max(0, currentIndex() - 1)); });
      if (next) next.addEventListener('click', function () { scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)); });
    }
  }

  /* ---- scroll reveal (subtle fade-up, staggered) ---- */
  var SEL = '.sec-title,.sec-intro,.team__kicker,.svc,.proj,.member,.testi__card,' +
            '.hero__title,.hero__lead,.hero__note,.contact__title,.contact__email,.contact__actions';
  var reveal = Array.prototype.slice.call(document.querySelectorAll(SEL));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    // stagger items inside a group (services, team, testimonials, projects)
    reveal.forEach(function (el) {
      if (el.matches('.svc, .member, .testi__card, .proj') && el.parentElement) {
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.matches && c.matches('.svc, .member, .testi__card, .proj');
        });
        var i = sibs.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i, 8) * 55 + 'ms';
      }
    });
    // Robust reveal: three independent layers so content can never stay
    // hidden (which would read as big blank gaps). 1) IntersectionObserver
    // for the staggered fade-in, 2) a scroll/resize sweep as backup, and
    // 3) a guaranteed safety timeout that reveals anything still hidden.
    var pending = reveal.slice();
    function show(el) {
      el.classList.add('is-visible');
      var k = pending.indexOf(el);
      if (k > -1) pending.splice(k, 1);
    }
    function sweep() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = pending.length - 1; i >= 0; i--) {
        if (pending[i].getBoundingClientRect().top < vh * 0.92) show(pending[i]);
      }
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
      reveal.forEach(function (el) { io.observe(el); });
    }
    var ticking = false;
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { sweep(); ticking = false; }); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', sweep);
    sweep();
    // Safety net: whatever the observer or scroll missed, reveal it.
    setTimeout(function () { reveal.forEach(function (el) { el.classList.add('is-visible'); }); }, 2000);
  }

})();

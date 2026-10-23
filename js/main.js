/* BoxnDots — interactions: mobile menu + testimonials carousel */
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

  if (!('IntersectionObserver' in window) || reduce) {
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
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  }
})();

(function () {
  var BACK_TO_TOP_THRESHOLD = 200;

  function updateBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    if (window.scrollY > BACK_TO_TOP_THRESHOLD) {
      btn.classList.remove('is-hidden');
    } else {
      btn.classList.add('is-hidden');
    }
  }

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function dismissIntro(overlay) {
    overlay.classList.add('intro-overlay--done');
    try {
      sessionStorage.setItem('introSeen', '1');
    } catch (e) {}
  }

  function initIntro() {
    var overlay = document.getElementById('intro-overlay');
    if (!overlay) return;
    var closeBtn = document.getElementById('intro-close');
    try {
      if (sessionStorage.getItem('introSeen') === '1') {
        overlay.classList.add('intro-overlay--done');
        return;
      }
    } catch (e) {}

    var dismissed = false;
    function dismissOnce() {
      if (dismissed) return;
      dismissed = true;
      dismissIntro(overlay);
    }

    overlay.addEventListener('click', function () {
      dismissOnce();
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        dismissOnce();
      });
    }
    // Allow users to dismiss intro just by scrolling.
    window.addEventListener('wheel', dismissOnce, { passive: true, once: true });
    window.addEventListener('touchmove', dismissOnce, { passive: true, once: true });
    window.addEventListener('scroll', dismissOnce, { passive: true, once: true });
    window.setTimeout(function () {
      dismissOnce();
    }, 5600);
  }

  function initCursorSparkle() {
    // Run on home page (hero) and photography pages (city-page)
    var hasHero = !!document.getElementById('hero');
    var hasCityPage = !!document.querySelector('.city-page');
    if (!hasHero && !hasCityPage) return;
    var active = 0;
    var maxSparkles = 30;
    var lastTime = 0;
    var THROTTLE_MS = 40;

    document.addEventListener('pointermove', function (event) {
      var now = window.performance && performance.now ? performance.now() : Date.now();
      if (now - lastTime < THROTTLE_MS) return;
      lastTime = now;
      if (active >= maxSparkles) return;

      for (var i = 0; i < 3; i++) {
        var s = document.createElement('span');
        s.className = 'cursor-sparkle';
        var offsetX = (Math.random() - 0.5) * 14;
        var offsetY = (Math.random() - 0.5) * 14;
        s.style.left = (event.clientX + offsetX) + 'px';
        s.style.top = (event.clientY + offsetY) + 'px';
        document.body.appendChild(s);
        active++;
        window.setTimeout((function (sparkle) {
          return function () {
            if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
            active--;
          };
        })(s), 280);
      }
    });
  }

  function initSlideStrips() {
    var galleries = document.querySelectorAll('.case-study-slides');
    if (!galleries.length) return;

    function setup(gallery) {
      var track = gallery.querySelector('.case-study-slides-track');
      if (!track) return;
      var prev = gallery.querySelector('.case-study-slides-nav--prev');
      var next = gallery.querySelector('.case-study-slides-nav--next');
      var slides = track.querySelectorAll('.case-study-slide');
      if (!slides.length) return;

      var prefersReduced = false;
      try {
        prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) {}

      var currentIndex = 0;

      function goToIndex(index) {
        var count = slides.length;
        if (!count) return;
        currentIndex = ((index % count) + count) % count;
        var slide = slides[currentIndex];
        if (!slide) return;
        var targetLeft = slide.offsetLeft - track.offsetLeft;
        track.scrollTo({
          left: targetLeft,
          behavior: prefersReduced ? 'auto' : 'smooth'
        });
      }

      // Keep currentIndex in sync when user scrolls manually
      track.addEventListener('scroll', function () {
        var closestIndex = currentIndex;
        var minDist = Infinity;
        for (var i = 0; i < slides.length; i++) {
          var s = slides[i];
          var center = s.offsetLeft - track.offsetLeft;
          var dist = Math.abs(track.scrollLeft - center);
          if (dist < minDist) {
            minDist = dist;
            closestIndex = i;
          }
        }
        currentIndex = closestIndex;
      }, { passive: true });

      if (prev) {
        prev.style.display = 'inline-flex';
        prev.addEventListener('click', function () {
          goToIndex(currentIndex - 1);
        });
      }
      if (next) {
        next.style.display = 'inline-flex';
        next.addEventListener('click', function () {
          goToIndex(currentIndex + 1);
        });
      }
    }

    if (galleries.forEach) {
      galleries.forEach(setup);
    } else {
      Array.prototype.forEach.call(galleries, setup);
    }
  }

  function initProjectFilters() {
    var filters = document.querySelectorAll('.projects-hero-filter');
    if (!filters.length) return;
    var cards = document.querySelectorAll('.case-study-card[data-type]');
    if (!cards.length) return;
    var categoryBlocks = document.querySelectorAll('.projects-category-block');

    function clearCardDisplay() {
      for (var c = 0; c < cards.length; c++) {
        cards[c].style.display = '';
      }
    }

    function scrollToFilterTarget(type) {
      window.setTimeout(function () {
        if (type === 'all') {
          var hero = document.getElementById('projects-heading');
          if (hero) {
            hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
        var block = document.querySelector('.projects-category-block[data-category="' + type + '"]');
        if (block) {
          block.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }

    function applyFilter(type) {
      if (categoryBlocks.length) {
        for (var b = 0; b < categoryBlocks.length; b++) {
          var block = categoryBlocks[b];
          var cat = block.getAttribute('data-category');
          if (type === 'all' || cat === type) {
            block.style.display = '';
          } else {
            block.style.display = 'none';
          }
        }
        clearCardDisplay();
        return;
      }

      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var cardType = card.getAttribute('data-type');
        if (type === 'all' || cardType === type) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      }
    }

    function handleClick(event) {
      var btn = event.currentTarget;
      var type = btn.getAttribute('data-filter') || 'all';

      for (var i = 0; i < filters.length; i++) {
        filters[i].classList.remove('projects-hero-filter--active');
      }
      btn.classList.add('projects-hero-filter--active');
      applyFilter(type);
      scrollToFilterTarget(type);
    }

    for (var j = 0; j < filters.length; j++) {
      filters[j].addEventListener('click', handleClick);
    }

    applyFilter('all');
  }

  function initCaseStudyToc() {
    var toc = document.querySelector('.case-study-toc');
    if (!toc) return;
    var links = toc.querySelectorAll('.case-study-toc-link');
    if (!links.length) return;

    function handleClick(event) {
      var targetId = event.currentTarget.getAttribute('data-section-target');
      if (!targetId) return;
      var section = document.querySelector(targetId);
      if (!section) return;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', handleClick);
    }

    var sections = [];
    for (var j = 0; j < links.length; j++) {
      var id = links[j].getAttribute('data-section-target');
      if (!id) continue;
      var el = document.querySelector(id);
      if (el) {
        sections.push({ id: id, el: el, link: links[j] });
      }
    }
    if (!sections.length) return;

    function updateActive() {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var viewportMid = scrollY + window.innerHeight / 3;
      var best = null;
      for (var k = 0; k < sections.length; k++) {
        var rect = sections[k].el.getBoundingClientRect();
        var top = rect.top + scrollY;
        if (top <= viewportMid) {
          if (!best || top > best.top) {
            best = { top: top, item: sections[k] };
          }
        }
      }
      if (!best) {
        best = { item: sections[0] };
      }
      for (var m = 0; m < sections.length; m++) {
        sections[m].link.classList.remove('is-active');
        sections[m].link.removeAttribute('aria-current');
      }
      best.item.link.classList.add('is-active');
      best.item.link.setAttribute('aria-current', 'true');
    }

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  function initEducationMilanCarousel() {
    var root = document.querySelector('[data-education-milan-carousel]');
    if (!root) return;
    var viewport = root.querySelector('.education-milan-carousel-viewport');
    var slides = root.querySelectorAll('.education-milan-carousel-slide');
    var prevBtn = root.querySelector('.education-milan-carousel-btn--prev');
    var nextBtn = root.querySelector('.education-milan-carousel-btn--next');
    var currentEl = root.querySelector('.education-milan-carousel-current');
    var totalEl = root.querySelector('.education-milan-carousel-total');
    var dotsContainer = root.querySelector('.education-milan-carousel-dots');
    if (!viewport || !slides.length || !prevBtn || !nextBtn || !currentEl || !dotsContainer) return;

    var n = slides.length;
    if (totalEl) totalEl.textContent = String(n);

    var dots = [];
    var d;
    for (d = 0; d < n; d++) {
      (function (index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'education-milan-carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Photo ' + (index + 1) + ' of ' + n);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        if (index === 0) dot.classList.add('is-active');
        dot.addEventListener('click', function () {
          goTo(index, true);
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      })(d);
    }

    function getIndex() {
      var w = viewport.clientWidth;
      if (w <= 0) return 0;
      var i = Math.round(viewport.scrollLeft / w);
      if (i < 0) i = 0;
      if (i >= n) i = n - 1;
      return i;
    }

    function goTo(index, smooth) {
      if (index < 0) index = n - 1;
      if (index >= n) index = 0;
      var w = viewport.clientWidth;
      viewport.scrollTo({
        left: index * w,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }

    function syncUI() {
      var idx = getIndex();
      currentEl.textContent = String(idx + 1);
      for (var j = 0; j < dots.length; j++) {
        var on = j === idx;
        dots[j].classList.toggle('is-active', on);
        dots[j].setAttribute('aria-selected', on ? 'true' : 'false');
      }
    }

    prevBtn.addEventListener('click', function () {
      goTo(getIndex() - 1, true);
    });
    nextBtn.addEventListener('click', function () {
      goTo(getIndex() + 1, true);
    });

    viewport.addEventListener(
      'scroll',
      function () {
        window.requestAnimationFrame(syncUI);
      },
      { passive: true }
    );

    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(getIndex() - 1, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(getIndex() + 1, true);
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        var idx = getIndex();
        goTo(idx, false);
        syncUI();
      }, 100);
    });

    syncUI();
  }

  function initPhotographyRegionToggle() {
    var toggle = document.querySelector('.photo-region-toggle');
    if (!toggle) return;
    var buttons = toggle.querySelectorAll('.photo-region-toggle__btn');
    var panels = document.querySelectorAll('.photo-region-panel');
    if (!buttons.length || !panels.length) return;

    function activate(region) {
      for (var i = 0; i < buttons.length; i++) {
        var activeBtn = buttons[i].getAttribute('data-region') === region;
        buttons[i].classList.toggle('is-active', activeBtn);
        buttons[i].setAttribute('aria-pressed', activeBtn ? 'true' : 'false');
      }
      for (var j = 0; j < panels.length; j++) {
        var activePanel = panels[j].getAttribute('data-region-panel') === region;
        panels[j].classList.toggle('is-active', activePanel);
      }
    }

    for (var k = 0; k < buttons.length; k++) {
      buttons[k].addEventListener('click', function (event) {
        var region = event.currentTarget.getAttribute('data-region');
        if (!region) return;
        activate(region);
      });
    }

    activate('south');
  }

  function init() {
    initYear();
    updateBackToTop();
    initIntro();
    initCursorSparkle();
    initSlideStrips();
    initProjectFilters();
    initCaseStudyToc();
    initPhotographyRegionToggle();
    initEducationMilanCarousel();
    window.addEventListener('scroll', updateBackToTop, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

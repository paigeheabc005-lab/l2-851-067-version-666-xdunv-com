(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('nav-scrolled');
    } else {
      header.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  if (menuButton && mobileNav && header) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      header.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
    var rail = wrap.querySelector('[data-rail]');
    var left = wrap.querySelector('[data-rail-left]');
    var right = wrap.querySelector('[data-rail-right]');
    if (!rail) {
      return;
    }
    function scrollByStep(direction) {
      rail.scrollBy({
        left: direction * Math.min(420, rail.clientWidth * 0.85),
        behavior: 'smooth'
      });
    }
    if (left) {
      left.addEventListener('click', function () {
        scrollByStep(-1);
      });
    }
    if (right) {
      right.addEventListener('click', function () {
        scrollByStep(1);
      });
    }
  });

  document.querySelectorAll('[data-filter-grid]').forEach(function (grid) {
    var panel = grid.parentElement.querySelector('.filter-panel');
    if (!panel) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var category = panel.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var empty = grid.parentElement.querySelector('[data-filter-empty]');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      var query = valueOf(input);
      var selectedYear = valueOf(year);
      var selectedRegion = valueOf(region);
      var selectedCategory = valueOf(category);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !selectedYear || (card.getAttribute('data-year') || '').toLowerCase() === selectedYear;
        var matchesRegion = !selectedRegion || (card.getAttribute('data-region') || '').toLowerCase() === selectedRegion;
        var matchesCategory = !selectedCategory || (card.getAttribute('data-category') || '').toLowerCase() === selectedCategory;
        var show = matchesQuery && matchesYear && matchesRegion && matchesCategory;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, region, category].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    var video = shell.querySelector('video[data-player-src]');
    var button = shell.querySelector('[data-play-button]');
    var initialized = false;
    var hlsInstance = null;

    function initialize() {
      if (!video || initialized) {
        return;
      }
      initialized = true;
      var source = video.getAttribute('data-player-src');
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      initialize();
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();


(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });

    setSlide(0);
    startTimer();
  }

  var quickSearchForms = document.querySelectorAll('[data-quick-search]');

  quickSearchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      } else {
        window.location.href = './search.html';
      }
    });
  });

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var input = filterRoot.querySelector('[data-filter-input]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var empty = filterRoot.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    function checkCard(card, text, type, region) {
      var haystack = card.getAttribute('data-search') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var textOk = !text || haystack.indexOf(text) !== -1;
      var typeOk = !type || cardType === type;
      var regionOk = !region || cardRegion === region;
      return textOk && typeOk && regionOk;
    }

    function applyFilter() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var visible = checkCard(card, text, type, region);
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var stage = player.querySelector('[data-video]');
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var overlay = player.querySelector('.play-overlay');
    var stream = stage ? stage.getAttribute('data-video') : '';
    var started = false;
    var hls = null;

    function startVideo() {
      if (!video || !stream) {
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = stream;
      }

      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startVideo();
      });
    }

    if (stage) {
      stage.addEventListener('click', function (event) {
        if (!started || event.target === overlay) {
          startVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }
})();

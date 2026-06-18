(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function openMenu() {
    var menu = document.querySelector('[data-nav-menu]');
    if (menu) {
      menu.classList.toggle('open');
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    if (button) {
      button.addEventListener('click', openMenu);
    }
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        var action = form.getAttribute('action') || './search.html';
        window.location.href = action + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function applyFilter(query) {
    var grid = document.querySelector('[data-search-grid]');
    if (!grid) {
      return;
    }
    var cards = selectAll('[data-card]', grid);
    var value = normalized(query);
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !value || cardText(card).indexOf(value) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function setupFilterPage() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('[data-search-input]');
    if (input && query) {
      input.value = query;
    }
    applyFilter(query);

    selectAll('[data-filter-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip') || chip.textContent;
        selectAll('[data-filter-chip]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        if (input) {
          input.value = value;
        }
        applyFilter(value);
      });
    });

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var url = player.getAttribute('data-video');
      var ready = false;
      var hlsInstance = null;

      function attachMedia() {
        if (ready || !video || !url) {
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          video.src = url;
        }
      }

      function playVideo() {
        attachMedia();
        player.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      if (button && video) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('click', function () {
          attachMedia();
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilterPage();
    setupPlayers();
  });
})();

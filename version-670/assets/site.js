
(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        play();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  const localFilter = document.querySelector('[data-local-filter]');
  const typeFilter = document.querySelector('[data-filter-type]');
  const yearFilter = document.querySelector('[data-filter-year]');

  function applyLocalFilter() {
    const query = localFilter ? localFilter.value.trim().toLowerCase() : '';
    const type = typeFilter ? typeFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';
    document.querySelectorAll('[data-movie-card]').forEach(function (card) {
      const text = (card.getAttribute('data-search-text') || '').toLowerCase();
      const cardType = card.getAttribute('data-type') || '';
      const cardYear = card.getAttribute('data-year') || '';
      const visible = (!query || text.indexOf(query) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
      card.classList.toggle('is-hidden-card', !visible);
    });
  }

  [localFilter, typeFilter, yearFilter].forEach(function (item) {
    if (item) {
      item.addEventListener('input', applyLocalFilter);
      item.addEventListener('change', applyLocalFilter);
    }
  });

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      const video = box.querySelector('video');
      const trigger = box.querySelector('[data-play-trigger]');
      const src = box.getAttribute('data-video');

      function bindSource() {
        if (!video || !src || video.dataset.ready === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else {
          video.src = src;
        }
        video.dataset.ready = '1';
      }

      function start() {
        if (!video) {
          return;
        }
        bindSource();
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        video.controls = true;
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') {
          playing.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
      }
    });
  }

  setupPlayers();

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + escapeHtml(movie.file) + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</em>' +
      '<span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>';
  }

  const searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.SITE_MOVIES) {
    const searchInput = document.querySelector('[data-global-search]');
    const globalType = document.querySelector('[data-global-type]');
    const globalYear = document.querySelector('[data-global-year]');
    const summary = document.querySelector('[data-search-summary]');
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q') || '';

    if (searchInput) {
      searchInput.value = queryParam;
    }

    function runSearch() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const type = globalType ? globalType.value : '';
      const year = globalYear ? globalYear.value : '';
      const items = window.SITE_MOVIES.filter(function (movie) {
        const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return (!query || text.indexOf(query) !== -1) && (!type || movie.type === type) && (!year || movie.year === year);
      }).slice(0, 200);
      searchResults.innerHTML = items.map(renderSearchCard).join('');
      if (summary) {
        summary.textContent = items.length ? '已找到相关影片' : '没有找到匹配影片';
      }
    }

    [searchInput, globalType, globalYear].forEach(function (item) {
      if (item) {
        item.addEventListener('input', runSearch);
        item.addEventListener('change', runSearch);
      }
    });

    runSearch();
  }
})();

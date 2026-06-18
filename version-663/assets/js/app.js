(function () {
  var searchIndex = window.MOVIE_SEARCH_INDEX || [];

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function closeSuggestions() {
    qsa('[data-search-suggest]').forEach(function (box) {
      box.classList.remove('is-open');
      box.innerHTML = '';
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function findMovies(query, limit) {
    var q = normalize(query);
    if (!q) {
      return [];
    }
    return searchIndex.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(' '),
        item.oneLine
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, limit || 30);
  }

  function renderSuggest(input) {
    var form = input.closest('form');
    var box = form ? qs('[data-search-suggest]', form) : null;
    if (!box) {
      return;
    }
    var results = findMovies(input.value, 8);
    if (!results.length) {
      box.classList.remove('is-open');
      box.innerHTML = '';
      return;
    }
    box.innerHTML = results.map(function (item) {
      return '<a href="' + item.href + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><em>' + item.region + ' · ' + item.year + '</em></span>' +
        '</a>';
    }).join('');
    box.classList.add('is-open');
  }

  function initSearch() {
    qsa('[data-search-box]').forEach(function (input) {
      input.addEventListener('input', function () {
        renderSuggest(input);
      });
      input.addEventListener('focus', function () {
        renderSuggest(input);
      });
    });

    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !normalize(input.value)) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-search-form]')) {
        closeSuggestions();
      }
    });

    if (document.body.dataset.page === 'search') {
      renderSearchPage();
    }
  }

  function renderSearchPage() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = qs('[data-search-page-input]');
    var target = qs('#search-results');
    if (input) {
      input.value = query;
    }
    if (!target) {
      return;
    }
    var results = findMovies(query, 96);
    if (!normalize(query)) {
      target.innerHTML = '<p class="empty-state">请输入关键词开始搜索。</p>';
      return;
    }
    if (!results.length) {
      target.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
      return;
    }
    target.innerHTML = results.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="movie-cover" href="' + item.href + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
        '<span class="movie-type">' + item.type + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="' + item.href + '">' + item.title + '</a></h3>' +
        '<div class="movie-meta"><span>' + item.region + '</span><span>' + item.year + '</span></div>' +
        '<p>' + item.oneLine + '</p>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    prev && prev.addEventListener('click', function () {
      show(index - 1);
      start();
    });
    next && next.addEventListener('click', function () {
      show(index + 1);
      start();
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var button = qs('.play-cover', box);
      var stream = box.getAttribute('data-stream');
      var attached = false;
      var hls = null;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        attached = true;
      }

      function play() {
        attach();
        box.classList.add('is-playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
          box.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearch();
    initHero();
    initPlayers();
  });
})();

(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        if (!Number.isNaN(index)) {
          show(index);
          start();
        }
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-local-search]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-tag]"));
      var activeTag = "";

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var tag = normalize(activeTag);
        cards.forEach(function (card) {
          var hay = normalize(card.getAttribute("data-search"));
          var ok = true;
          if (keyword && hay.indexOf(keyword) === -1) {
            ok = false;
          }
          if (tag && hay.indexOf(tag) === -1) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeTag = chip.getAttribute("data-filter-tag") || "";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

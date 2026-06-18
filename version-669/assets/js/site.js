(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (menuButton && navLinks) {
      menuButton.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        var scope = input.closest("main") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
        });
      });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var source = player.getAttribute("data-m3u8");
      var mounted = false;
      var hls = null;

      function mount() {
        if (!video || !source || mounted) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        mounted = true;
      }

      function startPlayback() {
        mount();

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        video.setAttribute("controls", "controls");
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!mounted || video.paused) {
            startPlayback();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();

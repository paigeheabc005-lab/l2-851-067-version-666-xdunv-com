(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function norm(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = links.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function initRails() {
        var rail = document.querySelector("[data-movie-rail]");
        var left = document.querySelector("[data-rail-left]");
        var right = document.querySelector("[data-rail-right]");
        if (!rail) {
            return;
        }
        function scrollByCard(direction) {
            rail.scrollBy({
                left: direction * 360,
                behavior: "smooth"
            });
        }
        if (left) {
            left.addEventListener("click", function () {
                scrollByCard(-1);
            });
        }
        if (right) {
            right.addEventListener("click", function () {
                scrollByCard(1);
            });
        }
    }

    function initRedirectSearch() {
        document.querySelectorAll("[data-search-redirect]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-redirect") || "./search.html";
                var value = input ? input.value.trim() : "";
                window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
            });
        });
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));
        if (!grids.length) {
            return;
        }
        var search = document.querySelector(".site-search");
        var category = document.querySelector(".category-filter");
        var type = document.querySelector(".type-filter");
        var year = document.querySelector(".year-filter");
        var empty = document.querySelector(".empty-state");
        var query = new URLSearchParams(window.location.search).get("q");
        if (search && query) {
            search.value = query;
        }

        function apply() {
            var term = norm(search && search.value);
            var selectedCategory = norm(category && category.value);
            var selectedType = norm(type && type.value);
            var selectedYear = norm(year && year.value);
            var visible = 0;
            grids.forEach(function (grid) {
                Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
                    var keywords = norm(card.getAttribute("data-keywords"));
                    var cardCategory = norm(card.getAttribute("data-category"));
                    var cardType = norm(card.getAttribute("data-type"));
                    var cardYear = norm(card.getAttribute("data-year"));
                    var ok = true;
                    if (term && keywords.indexOf(term) === -1) {
                        ok = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        ok = false;
                    }
                    if (selectedType && cardType.indexOf(selectedType) === -1 && keywords.indexOf(selectedType) === -1) {
                        ok = false;
                    }
                    if (selectedYear && cardYear.indexOf(selectedYear) === -1 && keywords.indexOf(selectedYear) === -1) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, category, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (config) {
        ready(function () {
            var player = document.querySelector(".movie-player");
            if (!player || !config || !config.source) {
                return;
            }
            var video = player.querySelector("video");
            var button = player.querySelector(".play-layer");
            var started = false;
            var hls = null;

            function requestPlay() {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            function attach() {
                if (started) {
                    requestPlay();
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = config.source;
                    requestPlay();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(config.source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        requestPlay();
                    });
                } else {
                    video.src = config.source;
                    requestPlay();
                }
            }

            function begin() {
                if (button) {
                    button.classList.add("is-hidden");
                }
                attach();
            }

            if (button) {
                button.addEventListener("click", begin);
            }
            video.addEventListener("click", function () {
                if (!started) {
                    begin();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initRails();
        initRedirectSearch();
        initFilters();
    });
})();

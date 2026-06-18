(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector(".js-hero-slider");
        if (!slider) {
            return;
        }
        var slides = selectAll(".hero-slide", slider);
        var dots = selectAll(".hero-dot", slider);
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            timer = window.setInterval(function() {
                show(active + 1);
            }, 5200);
        }

        function reset(index) {
            if (timer) {
                window.clearInterval(timer);
            }
            show(index);
            start();
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                reset(index);
            });
        });
        start();
    }

    function setupFilters() {
        var grids = selectAll(".js-card-grid");
        if (!grids.length) {
            return;
        }
        var searchInput = document.querySelector(".js-search");
        var filters = selectAll(".js-filter");
        var empty = document.querySelector(".js-empty");
        var cards = selectAll(".js-movie-card");

        function matchesSearch(card, keyword) {
            if (!keyword) {
                return true;
            }
            var content = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year")
            ].join(" ").toLowerCase();
            return content.indexOf(keyword) !== -1;
        }

        function matchesFilters(card) {
            return filters.every(function(filter) {
                var key = filter.getAttribute("data-filter");
                var value = filter.value;
                if (!value || value === "all") {
                    return true;
                }
                return card.getAttribute("data-" + key) === value;
            });
        }

        function apply() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function(card) {
                var ok = matchesSearch(card, keyword) && matchesFilters(card);
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }
        filters.forEach(function(filter) {
            filter.addEventListener("change", apply);
        });
        apply();
    }

    window.setupVideoPlayer = function(url) {
        var video = document.querySelector(".js-player-video");
        var triggers = selectAll(".js-play-trigger");
        if (!video || !url) {
            return;
        }
        var overlay = document.querySelector(".player-overlay");
        var started = false;
        var hls = null;

        function playVideo() {
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function() {});
            }
        }

        function bindSource() {
            if (started) {
                return;
            }
            started = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
                video.src = url;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
            }
        }

        function start() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            bindSource();
            playVideo();
        }

        triggers.forEach(function(trigger) {
            trigger.addEventListener("click", start);
        });
        video.addEventListener("click", start);
        window.addEventListener("pagehide", function() {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function() {
        setupNavigation();
        setupHeroSlider();
        setupFilters();
    });
})();

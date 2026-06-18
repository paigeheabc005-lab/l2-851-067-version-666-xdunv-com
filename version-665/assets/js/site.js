(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function restartHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var previous = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
      restartHeroTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHeroTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartHeroTimer();
    });
  });

  if (slides.length) {
    showSlide(0);
    restartHeroTimer();
  }

  function filterCards(query) {
    var value = String(query || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-text') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', value.length > 0 && text.indexOf(value) === -1);
    });

    var target = document.getElementById('movie-list');
    if (target && value) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    var input = form.querySelector('[data-search-input]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(input ? input.value : '');
    });

    if (input) {
      input.addEventListener('input', function () {
        filterCards(input.value);
      });
    }
  });
}());

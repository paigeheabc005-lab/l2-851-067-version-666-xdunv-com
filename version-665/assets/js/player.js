function initMoviePlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var hls = null;

  if (!video || !source) {
    return;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function showCover() {
    if (cover) {
      cover.classList.remove('is-hidden');
    }
  }

  function attachSource() {
    if (video.getAttribute('data-ready') === 'true') {
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showCover();
        }
      });
    }
  }

  function playVideo() {
    attachSource();
    hideCover();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showCover();
      });
    }
  }

  attachSource();

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', hideCover);
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      showCover();
    }
  });
  video.addEventListener('ended', showCover);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

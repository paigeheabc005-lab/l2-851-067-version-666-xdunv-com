(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupPlayer(root) {
    var video = root.querySelector("video");
    var source = root.getAttribute("data-video");
    var message = root.querySelector("[data-player-message]");
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-play-toggle]"));
    var mute = root.querySelector("[data-mute-toggle]");
    var fullscreen = root.querySelector("[data-fullscreen]");
    var hls = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function bindSource() {
      if (!video || !source) {
        showMessage("视频暂时无法播放");
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else {
            showMessage("视频载入失败");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showMessage("视频暂时无法播放");
      }
    }

    function togglePlay() {
      if (!video) {
        return;
      }
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showMessage("点击画面即可播放");
          });
        }
      } else {
        video.pause();
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", togglePlay);
    });

    if (video) {
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        root.classList.add("playing");
        buttons.forEach(function (button) {
          if (button.textContent === "播放") {
            button.textContent = "暂停";
          }
        });
        showMessage("");
      });
      video.addEventListener("pause", function () {
        root.classList.remove("playing");
        buttons.forEach(function (button) {
          if (button.textContent === "暂停") {
            button.textContent = "播放";
          }
        });
      });
    }

    if (mute && video) {
      mute.addEventListener("click", function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    bindSource();
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();

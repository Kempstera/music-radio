/**
 * Radio Atlas — persistent audio player (fixed at bottom of screen)
 * Handles mp3/aac via HTMLAudioElement, m3u8/HLS via hls.js when available.
 */
(function () {
  "use strict";

  var audio = null;
  var hls = null;
  var current = null; // { name, url, codec, group, cat }
  var onStateChange = null;

  function isHls(url) {
    return /\.m3u8(\?|$)/i.test(url) || /\/(hls|live)\//i.test(url) && /m3u8/i.test(url);
  }

  function ensureAudio() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "none";
      audio.addEventListener("play", update);
      audio.addEventListener("pause", update);
      audio.addEventListener("playing", update);
      audio.addEventListener("waiting", function () { setStatus("buffering"); });
      audio.addEventListener("playing", function () { setStatus(""); });
      audio.addEventListener("error", function () {
        setStatus("error");
        if (onStateChange) onStateChange({ playing: false, name: current ? current.name : null });
      });
    }
    return audio;
  }

  function destroyHls() {
    if (hls) {
      try { hls.destroy(); } catch (e) { /* noop */ }
      hls = null;
    }
  }

  function setStatus(kind) {
    var el = document.getElementById("player-status");
    if (!el) return;
    var t = window.I18N ? window.I18N.t : function (k) { return k; };
    if (kind === "buffering") {
      el.innerHTML = '<span class="spin"></span>';
      el.setAttribute("aria-label", t("common.buffering"));
    } else if (kind === "error") {
      el.textContent = t("player.error");
    } else {
      el.textContent = "";
    }
  }

  function loadStation(station) {
    if (!station || !station.url) return;
    current = station;
    var a = ensureAudio();
    destroyHls();
    a.pause();
    a.src = "";

    if (isHls(station.url)) {
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(station.url);
        hls.attachMedia(a);
        hls.on(Hls.Events.ERROR, function (evt, data) {
          if (data && data.fatal) {
            setStatus("error");
          }
        });
      } else if (a.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        a.src = station.url;
      } else {
        setStatus("error");
        return;
      }
    } else {
      a.src = station.url;
    }

    var np = document.getElementById("np-name");
    if (np) {
      np.textContent = station.name;
      np.classList.remove("empty");
    }
    setStatus("buffering");
    a.play().then(function () { setStatus(""); })
      .catch(function () { setStatus("error"); });
    update();
  }

  function toggle() {
    if (!current) return;
    var a = ensureAudio();
    if (a.paused) {
      a.play().catch(function () { setStatus("error"); });
    } else {
      a.pause();
    }
  }

  function update() {
    var a = audio;
    var playing = !!(a && !a.paused && !a.ended && a.readyState > 2);
    var btn = document.getElementById("player-toggle");
    if (btn) {
      btn.classList.toggle("playing", playing);
      var icon = btn.querySelector("[data-icon]");
      if (icon) icon.textContent = playing ? "⏸" : "▶";
      var t = window.I18N ? window.I18N.t : function (k) { return k; };
      btn.setAttribute("aria-label", playing ? t("player.pause") : t("player.play"));
    }
    if (onStateChange) onStateChange({ playing: playing, name: current ? current.name : null });
  }

  function setVolume(v) {
    var a = ensureAudio();
    a.volume = v;
    var icon = document.getElementById("vol-icon");
    if (icon) {
      icon.textContent = v <= 0 ? "🔇" : v < 0.5 ? "🔉" : "🔊";
    }
  }

  function init() {
    var toggleBtn = document.getElementById("player-toggle");
    if (toggleBtn) toggleBtn.addEventListener("click", toggle);
    var vol = document.getElementById("vol-range");
    if (vol) {
      vol.addEventListener("input", function () { setVolume(parseFloat(vol.value)); });
    }
    setVolume(vol ? parseFloat(vol.value) : 0.8);
    // default "nothing playing" text
    var np = document.getElementById("np-name");
    if (np && window.I18N) {
      np.textContent = window.I18N.t("player.nothing");
      np.classList.add("empty");
    }
  }

  window.Player = {
    init: init,
    load: loadStation,
    toggle: toggle,
    current: function () { return current; },
    onStateChange: function (cb) { onStateChange = cb; }
  };
})();

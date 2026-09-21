/**
 * Music Radio — persistent audio player (fixed at bottom of screen)
 * Handles mp3/aac via HTMLAudioElement, m3u8/HLS via hls.js when available.
 * Auto-skips to the next station in the current list when a stream fails
 * or stalls (buffering) for too long. Shows a spinning indicator while
 * buffering so the UI never looks frozen.
 */
(function () {
  "use strict";

  var audio = null;
  var hls = null;
  var current = null; // { name, url, codec, group, cat }
  var queue = [];     // ordered stations for auto-skip
  var queueIndex = -1;
  var loadTimer = null; // dead-stream / stall watchdog
  var isBuffering = false;
  var stateCb = null;
  var skipCb = null;

  var SKIP_TIMEOUT_MS = 10000; // smart timeout: 10s of waiting/stalled

  function t(key) { return window.I18N ? window.I18N.t(key) : key; }

  function isHls(url) {
    return /\.m3u8(\?|$)/i.test(url) || (/\/(hls|live)\//i.test(url) && /m3u8/i.test(url));
  }

  function ensureAudio() {
    if (!audio) {
      audio = new Audio();
      // Default: don't waste bandwidth preloading anything until the user plays.
      audio.preload = "none";

      audio.addEventListener("play", function () {
        // User actually wants to hear this — start loading eagerly from now on.
        audio.preload = "auto";
        emit();
      });
      audio.addEventListener("pause", function () {
        clearTimer();
        setBuffering(false);
        emit();
      });
      audio.addEventListener("playing", onResumed);
      audio.addEventListener("canplay", onResumed);
      audio.addEventListener("waiting", onStalled);
      audio.addEventListener("stalled", onStalled);
      audio.addEventListener("error", function () {
        clearTimer();
        setBuffering(false);
        skipToNext();
      });
    }
    return audio;
  }

  function isPlaying() {
    var a = audio;
    return !!(a && !a.paused && !a.ended && a.readyState > 2);
  }

  function emit() {
    if (stateCb) stateCb({ playing: isPlaying(), name: current ? current.name : null });
    updateButton();
  }

  function setBuffering(on) {
    if (isBuffering === on) return;
    isBuffering = on;
    var btn = document.getElementById("player-toggle");
    if (btn) btn.classList.toggle("buffering", on);
  }

  function updateButton() {
    var btn = document.getElementById("player-toggle");
    if (!btn) return;
    var playing = isPlaying();
    btn.classList.toggle("playing", playing);
    var icon = btn.querySelector("[data-icon]");
    if (icon) icon.textContent = playing ? "⏸" : "▶";
    btn.setAttribute("aria-label", playing ? t("player.pause") : t("player.play"));
  }

  function clearTimer() {
    if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
  }

  function armTimer() {
    clearTimer();
    loadTimer = setTimeout(skipOnTimeout, SKIP_TIMEOUT_MS);
  }

  // --- buffering / stall handling ---

  function onStalled() {
    // Only react to genuine stalls while we're actively trying to play.
    if (!audio || audio.paused || audio.ended) return;
    if (!current) return;
    setBuffering(true);
    setStatus("buffering");
    armTimer();
    emit();
  }

  function onResumed() {
    clearTimer();
    setBuffering(false);
    setStatus("");
    emit();
  }

  function skipOnTimeout() {
    if (current) {
      console.warn(
        "[Music Radio] Stream timed out after " + (SKIP_TIMEOUT_MS / 1000) +
        "s of buffering — skipping: " + (current.name || current.url)
      );
    }
    skipToNext();
  }

  function destroyHls() {
    if (hls) { try { hls.destroy(); } catch (e) { /* noop */ } hls = null; }
  }

  function setStatus(kind) {
    var el = document.getElementById("player-status");
    if (!el) return;
    if (kind === "buffering") {
      el.innerHTML = '<span class="spin"></span>';
      el.setAttribute("aria-label", t("common.buffering"));
    } else if (kind === "error") {
      el.textContent = t("player.error");
    } else {
      el.textContent = "";
    }
  }

  function setNowPlaying(name, empty) {
    var np = document.getElementById("np-name");
    if (!np) return;
    np.textContent = name || t("player.nothing");
    np.classList.toggle("empty", !!empty);
  }

  function skipToNext() {
    clearTimer();
    setBuffering(false);
    if (!queue.length) { setStatus("error"); return; }
    queueIndex += 1;
    if (queueIndex >= queue.length) {
      current = null;
      queue = [];
      queueIndex = -1;
      setStatus("error");
      setNowPlaying(null, true);
      emit();
      return;
    }
    loadStation(queue[queueIndex]);
    if (skipCb) skipCb(queueIndex);
  }

  function loadStation(station) {
    if (!station || !station.url) return;
    current = station;
    var a = ensureAudio();
    destroyHls();
    clearTimer();
    try { a.pause(); } catch (e) { /* noop */ }
    a.src = "";

    if (isHls(station.url)) {
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(station.url);
        hls.attachMedia(a);
        hls.on(Hls.Events.ERROR, function (evt, data) {
          if (data && data.fatal) {
            destroyHls();
            skipToNext();
          }
        });
      } else if (a.canPlayType("application/vnd.apple.mpegurl")) {
        a.src = station.url; // Safari native HLS
      } else {
        setStatus("error");
        skipToNext();
        return;
      }
    } else {
      a.src = station.url;
    }

    setNowPlaying(station.name, false);
    setBuffering(true);
    setStatus("buffering");
    armTimer();
    a.play().catch(function () {
      clearTimer();
      setBuffering(false);
      setStatus("error");
    });
    emit();
  }

  function loadList(list, index) {
    queue = (list && list.length) ? list.slice() : [];
    queueIndex = (typeof index === "number" && index >= 0) ? index : 0;
    if (queue.length) loadStation(queue[queueIndex]);
  }

  function load(station) {
    loadList([station], 0);
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

  function setVolume(v) {
    var a = ensureAudio();
    a.volume = v;
    var icon = document.getElementById("vol-icon");
    if (icon) icon.textContent = v <= 0 ? "🔇" : v < 0.5 ? "🔉" : "🔊";
  }

  function init() {
    var tb = document.getElementById("player-toggle");
    if (tb) tb.addEventListener("click", toggle);
    var vol = document.getElementById("vol-range");
    if (vol) vol.addEventListener("input", function () { setVolume(parseFloat(vol.value)); });
    setVolume(vol ? parseFloat(vol.value) : 0.8);
    setNowPlaying(null, true);
    updateButton();
  }

  window.Player = {
    init: init,
    load: load,
    loadList: loadList,
    toggle: toggle,
    current: function () { return current; },
    onStateChange: function (cb) { stateCb = cb; },
    onAutoSkip: function (cb) { skipCb = cb; }
  };
})();

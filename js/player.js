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
  var loadTimer = null; // dead-stream / stall / mid-stream recovery watchdog
  var isBuffering = false;
  var userPaused = false; // deliberate user pause vs. dead-buffer auto-pause (iOS quirk)
  var autoplayArmed = false; // one-shot click/touch fallback for blocked autoplay
  var stateCb = null;
  var skipCb = null;

  var SKIP_TIMEOUT_MS = 15000; // smart timeout: wait a full 15s for the playing event
  var urlIndex = 0;            // which URL of the current station is being tried
  var pendingAutoplay = false; // autoplay flag carried across fallback attempts
  var VIP_LOOP_NAME = "Classic FM Calm"; // VIP station: infinite mirror loop, never skip

  function isVipStation(station) {
    return !!(station && station.name === VIP_LOOP_NAME);
  }

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
        if (userPaused) {
          // STRICT pause protection: destroy every watchdog, loading state and
          // pending fallback so the player stays silent until the user resumes.
          clearTimer();
          setBuffering(false);
          setStatus("");
          disarmFirstGesture();
        } else {
          // iOS/iPadOS quirk: a dead buffer flips paused=true all by itself
          // (no user input). Treat it as a stall and arm the 15s recovery
          // timer instead of killing it — this was the mid-stream deadlock.
          armTimer();
          setBuffering(true);
          setStatus("buffering");
        }
        emit();
      });
      audio.addEventListener("playing", onResumed);
      audio.addEventListener("canplay", onResumed);
      audio.addEventListener("waiting", onStalled);
      audio.addEventListener("stalled", onStalled);
      audio.addEventListener("error", function () {
        clearTimer();
        setBuffering(false);
        if (userPaused) {
          // User asked for silence — never auto-advance out of it.
          setStatus("");
          return;
        }
        tryNextUrl();
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
    // React to genuine stalls. NOTE: do NOT bail on audio.paused here —
    // on iOS/iPadOS a dead buffer flips paused=true on its own, and that is
    // exactly the mid-stream dropout we must recover from.
    if (!audio || audio.ended) return;
    if (!current) return;
    if (userPaused) return; // deliberate pause — never auto-recover
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

  // Autoplay was blocked (unmuted audio needs a user gesture). Arm a one-shot
  // listener so the very first click/tap anywhere starts the background music.
  var gestureResume = null;
  function armFirstGesture() {
    if (autoplayArmed) return;
    autoplayArmed = true;
    gestureResume = function () {
      autoplayArmed = false;
      gestureResume = null;
      if (!current || !audio) return;
      if (!audio.paused) return; // already playing
      if (userPaused) return;    // user asked for silence — do not resume
      setBuffering(true);
      setStatus("buffering");
      armTimer();
      audio.play().catch(function () { setStatus("error"); });
    };
    document.body.addEventListener("click", gestureResume, { once: true });
    document.body.addEventListener("touchstart", gestureResume, { once: true });
  }

  function disarmFirstGesture() {
    if (gestureResume) {
      document.body.removeEventListener("click", gestureResume);
      document.body.removeEventListener("touchstart", gestureResume);
      gestureResume = null;
    }
    autoplayArmed = false;
  }

  function skipOnTimeout() {
    if (userPaused) return; // silence requested — never auto-recover
    if (current) {
      console.warn(
        "[Music Radio] Stream timed out after " + (SKIP_TIMEOUT_MS / 1000) +
        "s of buffering — " + (current.name || current.url)
      );
    }
    tryNextUrl();
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
      updateMediaSession();
      return;
    }
    loadStation(queue[queueIndex]);
    if (skipCb) skipCb(queueIndex);
  }

  function stationUrls(station) {
    if (!station) return [];
    if (!station.url) return [];
    return Array.isArray(station.url) ? station.url.slice() : [station.url];
  }

  function loadStation(station, isAutoplay) {
    if (!station) return;
    var urls = stationUrls(station);
    if (!urls.length) return;
    current = station;
    urlIndex = 0;
    pendingAutoplay = !!isAutoplay;
    setNowPlaying(station.name, false);
    updateMediaSession();
    loadUrl();
  }

  function loadUrl() {
    var urls = stationUrls(current);
    var url = urls[urlIndex];
    if (!url) { skipToNext(); return; }
    var a = ensureAudio();
    destroyHls();
    clearTimer();
    userPaused = false;
    try { a.pause(); } catch (e) { /* noop */ }
    // Buffer flush: reset src + load() so the dead buffer can't linger.
    // Without this, iOS/iPadOS plays a system "ding" and refuses to resume.
    a.src = "";
    try { a.load(); } catch (e) { /* noop */ }

    if (isHls(url)) {
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(a);
        hls.on(Hls.Events.ERROR, function (evt, data) {
          if (data && data.fatal) {
            destroyHls();
            tryNextUrl();
          }
        });
      } else if (a.canPlayType("application/vnd.apple.mpegurl")) {
        a.src = url; // Safari native HLS
      } else {
        tryNextUrl();
        return;
      }
    } else {
      a.src = url;
    }

    setBuffering(true);
    setStatus("buffering");
    armTimer();
    a.play().catch(function () {
      clearTimer();
      setBuffering(false);
      if (pendingAutoplay) {
        // Autoplay blocked by the browser — wait for the first user gesture.
        armFirstGesture();
      } else {
        // Explicit user intent, but play() rejected — treat as a dead URL.
        tryNextUrl();
      }
    });
    emit();
  }

  // Dynamic retry limit: exhaust EVERY url in the station's array before
  // giving up (maxRetries = url.length - 1). A station with 14 mirrors gets
  // 14 chances; a plain string gets exactly 1. Still 15s per URL.
  function maxAttemptsFor(station) {
    return Math.max(1, stationUrls(station).length);
  }

  // Circuit breaker: advance to the next URL of the SAME station (silently),
  // or skip to the next station ONLY when every URL in the array is exhausted.
  // VIP stations (Classic FM Calm) never skip: they loop back to url[0]
  // infinitely until one of their mirrors works.
  function tryNextUrl() {
    if (!current) { skipToNext(); return; }
    if (userPaused) return; // silence requested — never auto-recover
    var urls = stationUrls(current);
    var next = urlIndex + 1;
    var maxAttempts = maxAttemptsFor(current);
    if (next >= maxAttempts) {
      if (isVipStation(current)) {
        console.warn(
          "[Music Radio] " + current.name + " exhausted all " + maxAttempts +
          " mirrors — restarting the loop from URL #1"
        );
        urlIndex = 0;
        loadUrl();
        return;
      }
      console.warn(
        "[Music Radio] " + (current.name || "Station") +
        " failed after " + maxAttempts + " URL attempt(s) — skipping to next station"
      );
      skipToNext();
      return;
    }
    urlIndex = next;
    console.warn(
      "[Music Radio] " + (current.name || "Station") +
      " URL #" + urlIndex + " failed — trying #" + (urlIndex + 1)
    );
    loadUrl();
  }

  function loadList(list, index) {
    queue = (list && list.length) ? list.slice() : [];
    queueIndex = (typeof index === "number" && index >= 0) ? index : 0;
    if (queue.length) loadStation(queue[queueIndex]);
  }

  function load(station) {
    loadList([station], 0);
  }

  // Background ambient track: try to play immediately, fall back to the first
  // user gesture if the browser blocks unmuted autoplay.
  function autoplay(station) {
    loadStation(station, true);
  }

  function toggle() {
    if (!current) return;
    var a = ensureAudio();
    if (a.paused) {
      userPaused = false;
      setBuffering(true);
      setStatus("buffering");
      armTimer();
      a.play().catch(function () {
        // Dead buffer on iOS: play() rejects after the system "ding".
        // Treat the current URL as dead and recover via the fallback chain.
        tryNextUrl();
      });
    } else {
      userPaused = true;
      a.pause();
    }
  }

  function setVolume(v) {
    var a = ensureAudio();
    a.volume = v;
    var icon = document.getElementById("vol-icon");
    if (icon) icon.textContent = v <= 0 ? "🔇" : v < 0.5 ? "🔉" : "🔊";
  }

  // --- Media Session API (lock screen / car steering wheel controls) ---
  var CATEGORY_KEYS = {
    classical: "nav.classical",
    jazz: "nav.jazz",
    vibes: "nav.vibes"
  };

  function mediaSessionSupported() {
    return "mediaSession" in navigator;
  }

  function categoryLabel() {
    var cat = document.body.getAttribute("data-category");
    if (cat && CATEGORY_KEYS[cat]) return t(CATEGORY_KEYS[cat]);
    return cat ? (cat.charAt(0).toUpperCase() + cat.slice(1)) : "Music Radio";
  }

  function artworkUrl() {
    try {
      return new URL("apple-touch-icon.png", window.location.href).href;
    } catch (e) {
      return "apple-touch-icon.png";
    }
  }

  function updateMediaSession() {
    if (!mediaSessionSupported()) return;
    if (!current) {
      navigator.mediaSession.metadata = null;
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.name,
        artist: categoryLabel(),
        album: "Music Radio",
        artwork: [{ src: artworkUrl(), sizes: "180x180", type: "image/png" }]
      });
    } catch (e) { /* older browsers without MediaMetadata */ }
  }

  function setupMediaSession() {
    if (!mediaSessionSupported()) return;
    try {
      navigator.mediaSession.setActionHandler("play", function () {
        if (!current || !audio) return;
        userPaused = false;
        setBuffering(true);
        setStatus("buffering");
        armTimer();
        audio.play().catch(function () { tryNextUrl(); });
      });
      navigator.mediaSession.setActionHandler("pause", function () {
        if (audio) { userPaused = true; audio.pause(); }
      });
      navigator.mediaSession.setActionHandler("nexttrack", function () {
        if (current) skipToNext();
      });
      // No previous-track support — hide the button rather than show a dead one.
      navigator.mediaSession.setActionHandler("previoustrack", null);
    } catch (e) { /* noop */ }
  }

  function init() {
    var tb = document.getElementById("player-toggle");
    if (tb) tb.addEventListener("click", toggle);
    var vol = document.getElementById("vol-range");
    if (vol) vol.addEventListener("input", function () { setVolume(parseFloat(vol.value)); });
    setVolume(vol ? parseFloat(vol.value) : 0.8);
    setNowPlaying(null, true);
    updateButton();
    setupMediaSession();
  }

  window.Player = {
    init: init,
    load: load,
    loadList: loadList,
    autoplay: autoplay,
    toggle: toggle,
    current: function () { return current; },
    onStateChange: function (cb) { stateCb = cb; },
    onAutoSkip: function (cb) { skipCb = cb; }
  };
})();

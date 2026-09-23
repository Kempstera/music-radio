/**
 * Music Radio — My Favorites (Supabase `user_favorites` table)
 * Heart toggle on every station card, 20-station cap, "My Favorites" page.
 * Guest clicks get a sign-in toast; logged-in users insert/delete rows.
 * Works standalone: creates its own supabase-js client (same project).
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://xivobmucjutdfoxmfjxu.supabase.co";
  var SUPABASE_ANON_KEY = "***";
  var MAX_FAVS = 20;

  // English fallback so the UI still works if i18n.js fails to load.
  var EN = {
    "fav.title": "My Favorites",
    "fav.subtitle": "Your saved stations, all in one place.",
    "fav.signin_required": "Please sign in to save your favorite stations.",
    "fav.limit": "You can only save up to 20 stations.",
    "fav.added": "Added to favorites",
    "fav.removed": "Removed from favorites",
    "fav.empty": "No favorites yet. Tap the heart on any station to save it."
  };

  var supabase = null;
  var user = null;
  var favSet = {};   // station_uuid -> true
  var favOrder = []; // station_uuid, newest first
  var toastEl = null;
  var toastTimer = null;

  function t(key) {
    if (window.I18N && window.I18N.t) return window.I18N.t(key);
    return EN[key] || key;
  }

  // Deterministic station id: FNV-1a hash of name|url. stations.json has no
  // uuid field, so derive one that is stable across pages and sessions.
  function stationUuid(s) {
    var key = (s.name || "") + "|" + (s.url || "");
    var h = 0x811c9dc5;
    for (var i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return "st_" + (h >>> 0).toString(16);
  }
  window.StationUuid = stationUuid;

  function initClient() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.warn("[Music Radio] Supabase JS client (CDN) not loaded — favorites disabled.");
    }
  }

  // ---------- toast ----------

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  // ---------- heart state ----------

  var HEART_SVG =
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
    '<path d="M12 21s-6.7-4.35-9.33-8.11C.9 10.36 1.98 6.5 5.28 5.5c1.94-.59 4.03.06 5.28 1.7l1.44 1.8 1.44-1.8c1.25-1.64 3.34-2.29 5.28-1.7 3.3 1 4.38 4.86 2.61 7.39C18.7 16.65 12 21 12 21z"/>' +
    '</svg>';

  function applyHeartState(btn) {
    var uuid = btn.getAttribute("data-uuid");
    var on = !!(uuid && favSet[uuid]);
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", t("fav.title"));
  }

  function syncHearts() {
    document.querySelectorAll(".card-heart").forEach(applyHeartState);
  }

  // ---------- toggle ----------

  async function toggleFavorite(btn) {
    var uuid = btn.getAttribute("data-uuid");
    if (!uuid || !supabase) return;
    if (!user) {
      showToast(t("fav.signin_required"));
      return;
    }
    if (favSet[uuid]) {
      var r1 = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("station_uuid", uuid);
      if (r1.error) { console.warn("[Favorites] delete failed", r1.error); return; }
      delete favSet[uuid];
      favOrder = favOrder.filter(function (u) { return u !== uuid; });
      showToast(t("fav.removed"));
    } else {
      if (Object.keys(favSet).length >= MAX_FAVS) {
        showToast(t("fav.limit"));
        return;
      }
      var r2 = await supabase
        .from("user_favorites")
        .insert([{ user_id: user.id, station_uuid: uuid }]);
      if (r2.error) { console.warn("[Favorites] insert failed", r2.error); return; }
      favSet[uuid] = true;
      favOrder.unshift(uuid);
      showToast(t("fav.added"));
    }
    syncHearts();
    if (isFavPage()) renderFavPage();
  }

  // ---------- favorites page ----------

  function isFavPage() {
    return document.body.getAttribute("data-page") === "favorites";
  }

  function flattenStations(data) {
    var out = [];
    Object.keys(data || {}).forEach(function (cat) {
      var groups = data[cat] || {};
      Object.keys(groups).forEach(function (g) {
        (groups[g] || []).forEach(function (s) { out.push(s); });
      });
    });
    return out;
  }

  function metaText(s) {
    var parts = [];
    if (s.country) parts.push(s.country);
    if (s.codec) parts.push(String(s.codec).toUpperCase());
    return parts.join(" · ");
  }

  var favRenderList = [];

  function makeFavCard(s, index) {
    var card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", s.name);
    card.setAttribute("data-index", index);

    var name = document.createElement("div");
    name.className = "c-name";
    name.textContent = s.name;

    var meta = document.createElement("div");
    meta.className = "c-meta";
    meta.textContent = metaText(s);

    var play = document.createElement("div");
    play.className = "c-play";
    play.textContent = "▶";

    var heart = document.createElement("button");
    heart.type = "button";
    heart.className = "card-heart active";
    heart.setAttribute("data-uuid", stationUuid(s));
    heart.innerHTML = HEART_SVG;
    applyHeartState(heart);

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(play);
    card.appendChild(heart);

    card.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".card-heart")) return;
      if (window.Player) window.Player.loadList(favRenderList, index);
    });
    card.addEventListener("keydown", function (e) {
      if (e.target.closest && e.target.closest(".card-heart")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (window.Player) window.Player.loadList(favRenderList, index);
      }
    });
    return card;
  }

  function renderFavPage() {
    var host = document.getElementById("fav-stations");
    if (!host) return;
    var emptyEl = document.getElementById("fav-empty");
    if (!user) {
      host.innerHTML = "";
      favRenderList = [];
      if (emptyEl) { emptyEl.textContent = t("fav.signin_required"); emptyEl.hidden = false; }
      return;
    }
    var uuids = favOrder.slice();
    if (!uuids.length) {
      host.innerHTML = "";
      favRenderList = [];
      if (emptyEl) { emptyEl.textContent = t("fav.empty"); emptyEl.hidden = false; }
      return;
    }
    fetch("stations.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var flat = flattenStations(data);
        var byUuid = {};
        flat.forEach(function (s) { byUuid[stationUuid(s)] = s; });
        var list = [];
        uuids.forEach(function (u) {
          if (byUuid[u]) list.push(byUuid[u]);
        });
        favRenderList = list;
        host.innerHTML = "";
        list.forEach(function (s, i) { host.appendChild(makeFavCard(s, i)); });
        if (emptyEl) {
          emptyEl.hidden = list.length > 0;
          if (!list.length) emptyEl.textContent = t("fav.empty");
        }
      })
      .catch(function () {
        if (emptyEl) { emptyEl.textContent = t("fav.empty"); emptyEl.hidden = false; }
      });
  }

  // ---------- header link ----------

  function updateLink() {
    var link = document.getElementById("favorites-link");
    if (link) link.hidden = !user;
  }

  // ---------- auth + session ----------

  function loadFavs() {
    if (!supabase || !user) {
      favSet = {};
      favOrder = [];
      syncHearts();
      updateLink();
      if (isFavPage()) renderFavPage();
      return;
    }
    supabase
      .from("user_favorites")
      .select("station_uuid, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) return;
        favSet = {};
        favOrder = [];
        (res.data || []).forEach(function (r) {
          if (!favSet[r.station_uuid]) {
            favSet[r.station_uuid] = true;
            favOrder.push(r.station_uuid);
          }
        });
        syncHearts();
        updateLink();
        if (isFavPage()) renderFavPage();
      });
  }

  // Hearts are re-created whenever a tab re-renders — keep them in sync.
  var obs = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.classList && n.classList.contains("card-heart")) applyHeartState(n);
        if (n.querySelectorAll) n.querySelectorAll(".card-heart").forEach(applyHeartState);
      });
    });
  });

  // Delegated click: hearts are dynamic, and card clicks must not fire when
  // the heart itself is clicked.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".card-heart") : null;
    if (btn) toggleFavorite(btn);
  });

  function onLangChange() {
    syncHearts();
    updateLink();
    if (isFavPage()) renderFavPage();
  }

  function init() {
    initClient();
    obs.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("langchange", onLangChange);
    updateLink();
    if (!supabase) return;
    supabase.auth.getSession().then(function (res) {
      user = res.data && res.data.session ? res.data.session.user : null;
      loadFavs();
    }).catch(function () { /* noop */ });
    supabase.auth.onAuthStateChange(function (event, session) {
      user = session ? session.user : null;
      loadFavs();
    });
  }

  window.Favorites = {
    init: init,
    stationUuid: stationUuid,
    syncHearts: syncHearts,
    heartSvg: function () { return HEART_SVG; },
    isFav: function (uuid) { return !!favSet[uuid]; }
  };

  init();
})();

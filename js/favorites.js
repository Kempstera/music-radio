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
    toastEl.classList.remove("toast-error");
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  // DIAGNOSTIC: surface the REAL Supabase error on screen (red, sticky, 10s)
  // so failures are never silent again. Also mirrored to the console.
  function showErrorToast(msg) {
    var m = String(msg || "unknown error");
    console.warn("[Favorites] " + m);
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "alert");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = "[Favorites] " + m;
    toastEl.classList.add("show", "toast-error");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show", "toast-error"); }, 10000);
  }

  // ---------- heart state ----------

  var HEART_SVG =
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
    '<path d="M12 21s-6.7-4.35-9.33-8.11C.9 10.36 1.98 6.5 5.28 5.5c1.94-.59 4.03.06 5.28 1.7l1.44 1.8 1.44-1.8c1.25-1.64 3.34-2.29 5.28-1.7 3.3 1 4.38 4.86 2.61 7.39C18.7 16.65 12 21 12 21z"/>' +
    '</svg>';

  // Actual Supabase column name for the station id — detected at runtime so
  // INSERT/SELECT never fail silently on `stationuuid` vs `station_uuid`.
  var UUID_COL = "station_uuid";

  function isColumnError(msg) {
    var m = String(msg || "").toLowerCase();
    return /column|attribute|field/.test(m) && /does not exist|not found|unknown/.test(m);
  }

  function queryFavs() {
    return supabase
      .from("user_favorites")
      .select(UUID_COL + ", created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
  }

  function insertFav(uuid) {
    var row = { user_id: user.id };
    row[UUID_COL] = uuid;
    return supabase.from("user_favorites").insert([row]).then(function (r) {
      if (r.error && isColumnError(r.error.message) && UUID_COL === "station_uuid") {
        UUID_COL = "stationuuid";
        var row2 = { user_id: user.id };
        row2[UUID_COL] = uuid;
        return supabase.from("user_favorites").insert([row2]);
      }
      return r;
    });
  }

  function deleteFav(uuid) {
    return supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq(UUID_COL, uuid)
      .then(function (r) {
        if (r.error && isColumnError(r.error.message) && UUID_COL === "station_uuid") {
          UUID_COL = "stationuuid";
          return supabase.from("user_favorites").delete().eq("user_id", user.id).eq(UUID_COL, uuid);
        }
        return r;
      });
  }

  function applyHeartState(btn) {
    var uuid = btn.getAttribute("data-uuid");
    var on = !!(uuid && favSet[uuid]);
    btn.classList.toggle("is-favorited", on);
    // Inline styles as a bulletproof fallback (some Android/WeChat browsers
    // ignore CSS class rules on SVG paths).
    btn.style.color = on ? "#FF3B30" : "";
    var path = btn.querySelector("svg path");
    if (path) {
      path.style.fill = on ? "#FF3B30" : "";
      path.style.stroke = on ? "#FF3B30" : "";
    }
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", t("fav.title"));
  }

  function syncHearts() {
    document.querySelectorAll(".card-heart").forEach(applyHeartState);
  }

  // ---------- toggle ----------

  function popHeart(btn) {
    btn.classList.remove("pop");
    void btn.offsetWidth; // restart the animation
    btn.classList.add("pop");
  }

  function toggleFavorite(btn) {
    var uuid = btn.getAttribute("data-uuid");
    if (!uuid || !supabase) return;
    if (btn.getAttribute("data-pending") === "1") return; // ignore double-taps in flight
    if (!user) {
      showToast(t("fav.signin_required"));
      return;
    }
    var adding = !favSet[uuid];
    if (adding && Object.keys(favSet).length >= MAX_FAVS) {
      showToast(t("fav.limit"));
      return;
    }

    // Optimistic UI: flip the heart, pop, toast — all instantly. Persist after.
    if (adding) {
      favSet[uuid] = true;
      favOrder.unshift(uuid);
    } else {
      delete favSet[uuid];
      favOrder = favOrder.filter(function (u) { return u !== uuid; });
    }
    applyHeartState(btn);
    popHeart(btn);
    showToast(adding ? t("fav.added") : t("fav.removed"));
    notifyChange();
    if (isFavPage()) renderFavPage();

    btn.setAttribute("data-pending", "1");
    var done = function () { btn.removeAttribute("data-pending"); };

    if (adding) {
      insertFav(uuid).then(function (r) {
        done();
        if (r.error) { showErrorToast("insert: " + (r.error.message || JSON.stringify(r.error))); revertToggle(uuid, true); }
      });
    } else {
      deleteFav(uuid).then(function (r) {
        done();
        if (r.error) { showErrorToast("delete: " + (r.error.message || JSON.stringify(r.error))); revertToggle(uuid, false); }
      });
    }
  }

  function revertToggle(uuid, wasAdding) {
    if (wasAdding) {
      delete favSet[uuid];
      favOrder = favOrder.filter(function (u) { return u !== uuid; });
    } else {
      favSet[uuid] = true;
      favOrder.unshift(uuid);
    }
    syncHearts();
    notifyChange();
    if (isFavPage()) renderFavPage();
  }

  // ---------- favorites page ----------

  function isFavPage() {
    return document.body.getAttribute("data-page") === "favorites";
  }

  // Cached stations.json fetch (shared by sidebar tab + favorites page).
  var stationsCache = null;
  function loadStations() {
    if (!stationsCache) {
      stationsCache = fetch("stations.json")
        .then(function (r) { return r.json(); })
        .catch(function () { return null; });
    }
    return stationsCache;
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

  // Resolve the user's favorite uuids to full station objects, in favOrder.
  function getFavStations(cb) {
    var uuids = favOrder.slice();
    if (!uuids.length) { cb([]); return; }
    loadStations().then(function (data) {
      if (!data) { cb([]); return; }
      var flat = flattenStations(data);
      var byUuid = {};
      flat.forEach(function (s) { byUuid[stationUuid(s)] = s; });
      var list = [];
      uuids.forEach(function (u) { if (byUuid[u]) list.push(byUuid[u]); });
      cb(list);
    });
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

    var heart = document.createElement("button");
    heart.type = "button";
    heart.className = "card-heart is-favorited";
    heart.setAttribute("data-uuid", stationUuid(s));
    heart.innerHTML = HEART_SVG;
    applyHeartState(heart);

    card.appendChild(name);
    card.appendChild(meta);
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
    getFavStations(function (list) {
      favRenderList = list;
      host.innerHTML = "";
      list.forEach(function (s, i) { host.appendChild(makeFavCard(s, i)); });
      if (emptyEl) {
        emptyEl.hidden = list.length > 0;
        if (!list.length) emptyEl.textContent = t("fav.empty");
      }
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
      notifyChange();
      if (isFavPage()) renderFavPage();
      return;
    }
    queryFavs().then(function (res) {
      if (res.error) {
        if (isColumnError(res.error.message) && UUID_COL === "station_uuid") {
          UUID_COL = "stationuuid";
          queryFavs().then(applyLoadedFavs);
          return;
        }
        showErrorToast("load: " + (res.error.message || JSON.stringify(res.error)));
        return;
      }
      applyLoadedFavs(res);
    });
  }

  function applyLoadedFavs(res) {
    favSet = {};
    favOrder = [];
    (res.data || []).forEach(function (r) {
      var u = r[UUID_COL] || r.station_uuid || r.stationuuid;
      if (u && !favSet[u]) {
        favSet[u] = true;
        favOrder.push(u);
      }
    });
    syncHearts();
    updateLink();
    notifyChange();
    if (isFavPage()) renderFavPage();
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

  var changeCbs = [];
  function notifyChange() {
    changeCbs.forEach(function (cb) { try { cb(); } catch (e) { /* noop */ } });
  }

  window.Favorites = {
    init: init,
    stationUuid: stationUuid,
    syncHearts: syncHearts,
    heartSvg: function () { return HEART_SVG; },
    isFav: function (uuid) { return !!favSet[uuid]; },
    isSignedIn: function () { return !!user; },
    count: function () { return favOrder.length; },
    uuids: function () { return favOrder.slice(); },
    getFavStations: getFavStations,
    toast: showToast,
    onChange: function (cb) { changeCbs.push(cb); }
  };

  init();
})();

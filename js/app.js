/**
 * Music Radio — station loading & rendering (shared across subpages)
 * Loads stations.json and renders cards grouped by region / sub-genre / scenario.
 *
 * Left-hand Category Navigation:
 *   - Desktop: sticky vertical sidebar
 *   - Mobile:  horizontally scrollable pill row (same markup, CSS switches)
 * Selecting a tab re-renders #stations in place (no page reload) with a fade-in.
 *
 * #stations is preserved as the render target so the persistent player,
 * auto-skip queue and scroll-into-view behaviour keep working unchanged.
 */
(function () {
  "use strict";

  var data = null; // parsed stations.json
  var CATEGORY = document.body.getAttribute("data-category"); // "classical" | "jazz" | "vibes"
  var GROUP_LABEL = document.body.getAttribute("data-group-label"); // i18n key
  var TOP_N = 20;

  var KEY_TOP = "__top__";
  var KEY_ALL = "__all__";

  var CLASSICAL_ORDER = [
    "UK", "USA", "Germany", "France", "Italy", "Spain", "Nordic",
    "Asia", "South America", "Africa", "Global / International"
  ];

  // Strict whitelist for the "Top 20 Selected" showcase — country codes only.
  var TOP20_COUNTRIES = ["GB", "IM", "JE", "GG", "US", "DE", "FR", "CH", "NL"];

  // Flat list of stations in render order — also the auto-skip queue source.
  var renderList = [];

  var navEl = null;
  var tabs = [];       // [{ key, label, render }]
  var activeTab = null;

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  function qualitySort(list) {
    return list.slice().sort(function (a, b) {
      return (b.clickcount - a.clickcount) || (b.votes - a.votes);
    });
  }

  function metaText(s) {
    var bits = [];
    if (s.country) bits.push(s.country);
    if (s.codec) bits.push(s.codec.toUpperCase());
    if (s.bitrate) bits.push(s.bitrate + " kbps");
    return bits.join(" · ");
  }

  function playAt(index) {
    var st = renderList[index];
    if (!st) return;
    window.Player.loadList(renderList, index);
    markActive(index);
  }

  function markActive(index) {
    document.querySelectorAll(".card.playing").forEach(function (c) {
      c.classList.remove("playing");
    });
    var card = document.querySelector('.card[data-index="' + index + '"]');
    if (card) card.classList.add("playing");
  }

  function scrollToIndex(index) {
    var card = document.querySelector('.card[data-index="' + index + '"]');
    if (card && typeof card.scrollIntoView === "function") {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function makeCard(s) {
    var index = renderList.length;
    renderList.push(s);

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

    // Favorites heart (toggled via document-level delegation in favorites.js)
    var heart = document.createElement("button");
    heart.type = "button";
    heart.className = "card-heart";
    heart.setAttribute("data-uuid", window.StationUuid ? window.StationUuid(s) : "");
    if (window.Favorites && window.Favorites.heartSvg) {
      heart.innerHTML = window.Favorites.heartSvg();
    } else {
      heart.textContent = "♥";
    }

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(play);
    card.appendChild(heart);

    card.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".card-heart")) return;
      playAt(index);
    });
    card.addEventListener("keydown", function (e) {
      if (e.target.closest && e.target.closest(".card-heart")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        playAt(index);
      }
    });

    return card;
  }

  function renderSection(wrap, title, stations) {
    var section = document.createElement("section");
    section.className = "station-section";

    var head = document.createElement("div");
    head.className = "section-head";
    var h2 = document.createElement("h2");
    h2.textContent = title;
    var count = document.createElement("span");
    count.className = "count";
    count.textContent = stations.length + " " + t(GROUP_LABEL || "home.stations");
    head.appendChild(h2);
    head.appendChild(count);
    section.appendChild(head);

    var grid = document.createElement("div");
    grid.className = "grid";
    stations.slice(0, TOP_N).forEach(function (s) { grid.appendChild(makeCard(s)); });
    section.appendChild(grid);

    if (stations.length > TOP_N) {
      var remaining = stations.length - TOP_N;
      var btn = document.createElement("button");
      btn.className = "view-all";
      btn.textContent = t("home.view_all") + " · " + remaining;
      btn.addEventListener("click", function () {
        stations.slice(TOP_N).forEach(function (s) { grid.appendChild(makeCard(s)); });
        btn.remove();
      });
      section.appendChild(btn);
    }

    wrap.appendChild(section);
  }

  function overallTop20() {
    var all = [];
    Object.keys(data[CATEGORY] || {}).forEach(function (g) {
      (data[CATEGORY][g] || []).forEach(function (s) {
        var cc = (s.country || "").toUpperCase();
        if (TOP20_COUNTRIES.indexOf(cc) !== -1) all.push(s);
      });
    });
    return qualitySort(all).slice(0, TOP_N);
  }

  // Group keys in display order (classical uses a fixed region order).
  function orderedGroups() {
    var buckets = data[CATEGORY] || {};
    var keys = Object.keys(buckets);
    if (CATEGORY === "classical") {
      var ordered = CLASSICAL_ORDER.filter(function (g) {
        return buckets[g] && buckets[g].length;
      });
      keys.slice().sort().forEach(function (g) {
        if (CLASSICAL_ORDER.indexOf(g) === -1 && buckets[g].length) ordered.push(g);
      });
      return ordered;
    }
    return keys.filter(function (g) { return buckets[g] && buckets[g].length; });
  }

  function fadeIn(el) {
    el.classList.remove("station-fade");
    void el.offsetWidth; // force reflow so the animation restarts on every switch
    el.classList.add("station-fade");
  }

  /* ---------- Tab definitions ---------- */

  function buildTabs() {
    var buckets = data[CATEGORY] || {};
    var groups = orderedGroups();
    var list = [];

    if (CATEGORY === "classical") {
      // Curated showcase first, then one tab per region.
      list.push({
        key: KEY_TOP,
        label: t("common.top_selected"),
        render: function (wrap) {
          var top = overallTop20();
          if (top.length) renderSection(wrap, t("common.top_selected"), top);
        }
      });
    } else {
      list.push({
        key: KEY_ALL,
        label: t("common.all"),
        render: function (wrap) {
          groups.forEach(function (g) {
            renderSection(wrap, g, qualitySort(buckets[g] || []));
          });
        }
      });
      list.push({
        key: KEY_TOP,
        label: t("common.top_selected"),
        render: function (wrap) {
          var top = overallTop20();
          if (top.length) renderSection(wrap, t("common.top_selected"), top);
        }
      });
    }

    groups.forEach(function (g) {
      list.push({
        key: g,
        label: g,
        render: function (wrap) {
          renderSection(wrap, g, qualitySort(buckets[g] || []));
        }
      });
    });

    return list;
  }

  function defaultTabKey() {
    return CATEGORY === "classical" ? KEY_TOP : KEY_ALL;
  }

  /* ---------- Navigation ---------- */

  function setActive(key) {
    activeTab = key;
    if (!navEl) return;
    navEl.querySelectorAll("[role=tab]").forEach(function (b) {
      var on = b.getAttribute("data-tab") === key;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      if (on && typeof b.scrollIntoView === "function") {
        // keep the active pill visible inside the scrollable mobile row
        b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    });
  }

  function renderTab(key) {
    var tab = null;
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].key === key) { tab = tabs[i]; break; }
    }
    if (!tab) return;

    var wrap = document.getElementById("stations");
    if (!wrap) return;

    wrap.innerHTML = "";
    renderList = [];
    tab.render(wrap);
    fadeIn(wrap);
    setActive(key);
    rehighlightCurrent();
    scrollToStations();
  }

  function scrollToStations() {
    var anchor = document.getElementById("category-nav");
    if (!anchor || typeof anchor.getBoundingClientRect !== "function") return;
    // Only pull the page back up when the tab row has scrolled out of view.
    if (anchor.getBoundingClientRect().bottom < 0) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function buildCategoryNav() {
    navEl = document.getElementById("category-nav");
    if (!navEl) return;
    navEl.innerHTML = "";

    tabs = buildTabs();

    tabs.forEach(function (tab) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("data-tab", tab.key);
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");

      var label = document.createElement("span");
      label.className = "cat-label";
      label.textContent = tab.label;

      var count = document.createElement("span");
      count.className = "cat-count";
      count.textContent = countFor(tab.key);

      btn.appendChild(label);
      btn.appendChild(count);
      btn.addEventListener("click", function () { renderTab(tab.key); });
      navEl.appendChild(btn);
    });

    renderTab(defaultTabKey());
  }

  function countFor(key) {
    var buckets = data[CATEGORY] || {};
    if (key === KEY_ALL) {
      return Object.keys(buckets).reduce(function (n, g) {
        return n + (buckets[g] || []).length;
      }, 0);
    }
    if (key === KEY_TOP) return overallTop20().length;
    return (buckets[key] || []).length;
  }

  function rehighlightCurrent() {
    if (!window.Player || !window.Player.current) return;
    if (!window.Player.current()) return;
    var cur = window.Player.current();
    for (var i = 0; i < renderList.length; i++) {
      if (renderList[i].url === cur.url) { markActive(i); break; }
    }
  }

  function init() {
    var statusEl = document.getElementById("loading");
    fetch("stations.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        data = json;
        if (statusEl) statusEl.style.display = "none";
        var groups = Object.keys(data[CATEGORY] || {});
        if (!groups.length) {
          var wrap = document.getElementById("stations");
          if (wrap) wrap.textContent = t("common.no_stations");
          return;
        }
        buildCategoryNav();
      })
      .catch(function (err) {
        if (statusEl) statusEl.textContent = t("common.no_stations") + " (" + err.message + ")";
      });

    if (window.Player && window.Player.onAutoSkip) {
      window.Player.onAutoSkip(function (index) {
        markActive(index);
        scrollToIndex(index);
      });
    }
  }

  // re-render on language change
  window.onLanguageChange = function () {
    if (!data) return;
    var keep = activeTab;
    buildCategoryNav();
    // buildCategoryNav() already re-renders the default tab; if the user had a
    // different tab open, restore it so switching language keeps their place.
    if (keep && keep !== defaultTabKey()) {
      var exists = tabs.some(function (x) { return x.key === keep; });
      if (exists) renderTab(keep);
    }
    rehighlightCurrent();
    var np = document.getElementById("np-name");
    if (np && window.Player && !window.Player.current()) {
      np.textContent = t("player.nothing");
      np.classList.add("empty");
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();

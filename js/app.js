/**
 * Music Radio — station loading & rendering (shared across subpages)
 * Loads stations.json and renders cards grouped by region / sub-genre / scenario.
 * Classical renders stacked sections in a fixed order (Top 20 overall first);
 * Jazz & Vibes render a filter-bar selector. Every section shows Top 20 + "View All".
 */
(function () {
  "use strict";

  var data = null; // parsed stations.json
  var CATEGORY = document.body.getAttribute("data-category"); // "classical" | "jazz" | "vibes"
  var GROUP_LABEL = document.body.getAttribute("data-group-label"); // i18n key
  var TOP_N = 20;

  var CLASSICAL_ORDER = [
    "UK", "USA", "Germany", "France", "Italy", "Spain", "Nordic",
    "Asia", "South America", "Africa", "Global / International"
  ];

  // Strict whitelist for the "Top 20 Selected" showcase — country codes only.
  var TOP20_COUNTRIES = ["GB", "IM", "JE", "GG", "US", "DE", "FR", "CH", "NL"];

  // Flat list of stations in render order — also the auto-skip queue source.
  var renderList = [];

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

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(play);

    card.addEventListener("click", function () { playAt(index); });
    card.addEventListener("keydown", function (e) {
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

  function renderClassical() {
    var wrap = document.getElementById("stations");
    if (!wrap) return;
    wrap.innerHTML = "";
    renderList = [];

    var top = overallTop20();
    if (top.length) renderSection(wrap, t("classical.top_overall"), top);

    var buckets = data[CATEGORY] || {};
    var ordered = CLASSICAL_ORDER.filter(function (g) {
      return buckets[g] && buckets[g].length;
    });
    Object.keys(buckets).sort().forEach(function (g) {
      if (CLASSICAL_ORDER.indexOf(g) === -1 && buckets[g].length) ordered.push(g);
    });
    ordered.forEach(function (g) {
      renderSection(wrap, g, qualitySort(buckets[g]));
    });
  }

  function buildFilterBar(groups) {
    var bar = document.getElementById("filter-bar");
    var wrap = document.getElementById("stations");
    if (!bar || !wrap) return;
    bar.innerHTML = "";

    groups.forEach(function (group) {
      var stations = data[CATEGORY][group] || [];
      var btn = document.createElement("button");
      btn.textContent = group + " (" + stations.length + ")";
      btn.addEventListener("click", function () {
        bar.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        wrap.innerHTML = "";
        renderList = [];
        renderSection(wrap, group, qualitySort(stations));
      });
      bar.appendChild(btn);
    });

    var first = bar.querySelector("button");
    if (first) first.click();
  }

  function rehighlightCurrent() {
    if (!window.Player || !window.Player.current()) return;
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
        if (CATEGORY === "classical") {
          var fb = document.getElementById("filter-bar");
          if (fb) fb.style.display = "none";
          renderClassical();
        } else {
          buildFilterBar(groups);
        }
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
    if (CATEGORY === "classical") {
      renderClassical();
    } else {
      var active = document.querySelector("#filter-bar button.active");
      if (active) active.click();
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

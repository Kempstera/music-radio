/**
 * Radio Atlas — station loading & rendering (shared across subpages)
 * Loads stations.json and renders cards grouped by category/region/sub-genre/scenario.
 */
(function () {
  "use strict";

  var data = null; // parsed stations.json
  var activeGroup = null;

  var CATEGORY = document.body.getAttribute("data-category"); // "classical" | "jazz" | "vibes"
  var GROUP_LABEL = document.body.getAttribute("data-group-label"); // i18n key

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGroup(group, stations) {
    var wrap = document.getElementById("stations");
    if (!wrap) return;
    wrap.innerHTML = "";

    var head = document.createElement("div");
    head.className = "section-head";
    var h2 = document.createElement("h2");
    h2.textContent = group;
    var count = document.createElement("span");
    count.className = "count";
    count.textContent = stations.length + " " + t(GROUP_LABEL || "home.stations");
    head.appendChild(h2);
    head.appendChild(count);
    wrap.appendChild(head);

    var grid = document.createElement("div");
    grid.className = "grid";

    stations.forEach(function (s) {
      var card = document.createElement("div");
      card.className = "card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", s.name);
      if (CATEGORY === "vibes") card.setAttribute("data-scenario", group);

      var name = document.createElement("div");
      name.className = "c-name";
      name.textContent = s.name;

      var meta = document.createElement("div");
      meta.className = "c-meta";
      var bits = [];
      if (s.country) bits.push(s.country);
      if (s.codec) bits.push(s.codec.toUpperCase());
      if (s.bitrate) bits.push(s.bitrate + " kbps");
      meta.textContent = bits.join(" · ");

      var play = document.createElement("div");
      play.className = "c-play";
      play.textContent = "▶";

      card.appendChild(name);
      card.appendChild(meta);
      card.appendChild(play);

      card.addEventListener("click", function () {
        window.Player.load({
          name: s.name,
          url: s.url,
          codec: s.codec,
          group: group,
          cat: CATEGORY
        });
        markActive(card);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });

      grid.appendChild(card);
    });

    wrap.appendChild(grid);
  }

  function markActive(card) {
    document.querySelectorAll(".card.playing").forEach(function (c) {
      c.classList.remove("playing");
    });
    card.classList.add("playing");
  }

  function buildFilterBar(groups) {
    var bar = document.getElementById("filter-bar");
    if (!bar) return;
    bar.innerHTML = "";
    var first = null;

    groups.forEach(function (group) {
      var stations = data[CATEGORY][group] || [];
      var btn = document.createElement("button");
      btn.textContent = group + " (" + stations.length + ")";
      if (!first) first = { group: group, btn: btn };
      btn.addEventListener("click", function () {
        activeGroup = group;
        bar.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderGroup(group, stations);
      });
      bar.appendChild(btn);
    });

    if (first) {
      first.btn.classList.add("active");
      activeGroup = first.group;
      renderGroup(first.group, data[CATEGORY][first.group] || []);
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
        buildFilterBar(groups);
      })
      .catch(function (err) {
        if (statusEl) statusEl.textContent = t("common.no_stations") + " (" + err.message + ")";
      });
  }

  // re-render current group on language change (for counts/labels)
  window.onLanguageChange = function () {
    if (data && activeGroup) {
      renderGroup(activeGroup, data[CATEGORY][activeGroup] || []);
      var statusEl = document.getElementById("loading");
      if (statusEl && statusEl.style.display !== "none") {
        statusEl.textContent = t("common.loading");
      }
      // refresh nothing-playing text
      var np = document.getElementById("np-name");
      if (np && !window.Player.current()) {
        np.textContent = t("player.nothing");
        np.classList.add("empty");
      }
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();

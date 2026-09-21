/**
 * Music Radio — context-aware background ambient track (all pages).
 * Each page greets the visitor with a thematic default as soon as the player
 * can start (or, if the browser blocks unmuted autoplay, on the first gesture):
 *   - Home & Classical: "Your Classical - Peaceful Piano" (exact name match)
 *   - Jazz: top-voted station matching "Smooth Jazz" / "Bossa Nova" / "Lounge"
 *   - Vibes: top-voted station matching "Lo-Fi" / "Chill" / "Study"
 * Matching prefers a keyword in the station name; if none, it falls back to a
 * keyword in the tags. Ties are broken by vote count (highest wins).
 * Ambient audio is optional — any failure is swallowed silently.
 */
(function () {
  "use strict";

  var CLASSICAL_NAME = "Your Classical - Peaceful Piano";
  var JAZZ_KEYWORDS = ["Smooth Jazz", "Bossa Nova", "Lounge"];
  var VIBES_KEYWORDS = ["Lo-Fi", "Chill", "Study"];

  var PAGE = (document.body && document.body.getAttribute("data-page")) || "home";

  function norm(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function flatten(cat, data) {
    var groups = data && data[cat];
    var out = [];
    if (!groups) return out;
    Object.keys(groups).forEach(function (g) {
      out = out.concat(groups[g] || []);
    });
    return out;
  }

  // Pick the top-voted station whose name (preferred) or tags contain any keyword.
  function pickByKeywords(list, keywords) {
    var keys = keywords.map(norm);
    var nameHits = [];
    var tagHits = [];
    list.forEach(function (s) {
      if (!s || !s.url) return;
      var nn = norm(s.name);
      var tt = norm(s.tags);
      var inName = keys.some(function (k) { return nn.indexOf(k) !== -1; });
      var inTag = keys.some(function (k) { return tt.indexOf(k) !== -1; });
      if (inName) nameHits.push(s);
      else if (inTag) tagHits.push(s);
    });
    var byVotes = function (a, b) { return (b.votes || 0) - (a.votes || 0); };
    nameHits.sort(byVotes);
    tagHits.sort(byVotes);
    return nameHits[0] || tagHits[0] || null;
  }

  function findClassicalPiano(data) {
    var groups = data && data.classical;
    if (!groups) return null;
    var keys = Object.keys(groups);
    for (var i = 0; i < keys.length; i++) {
      var arr = groups[keys[i]] || [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].name === CLASSICAL_NAME) return arr[j];
      }
    }
    return null;
  }

  function findStation(data) {
    if (PAGE === "jazz") {
      return pickByKeywords(flatten("jazz", data), JAZZ_KEYWORDS);
    }
    if (PAGE === "vibes") {
      return pickByKeywords(flatten("vibes", data), VIBES_KEYWORDS);
    }
    // Home & Classical share the Peaceful Piano default.
    return findClassicalPiano(data);
  }

  function start() {
    if (!window.Player || typeof window.Player.autoplay !== "function") return;
    fetch("stations.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        var st = findStation(json);
        if (st) window.Player.autoplay(st);
      })
      .catch(function () { /* ambient track is optional — fail silently */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

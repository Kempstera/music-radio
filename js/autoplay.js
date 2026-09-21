/**
 * Music Radio — homepage background ambient track.
 * Finds "Your Classical - Peaceful Piano" in stations.json and hands it to the
 * player, which tries to autoplay and gracefully falls back to the first user
 * gesture if the browser blocks unmuted autoplay.
 */
(function () {
  "use strict";

  var TARGET_NAME = "Your Classical - Peaceful Piano";

  function findStation(data) {
    var cats = data && data.classical;
    if (!cats) return null;
    var groups = Object.keys(cats);
    for (var i = 0; i < groups.length; i++) {
      var arr = cats[groups[i]] || [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].name === TARGET_NAME) return arr[j];
      }
    }
    return null;
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

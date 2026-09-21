/**
 * Radio Atlas — visitor counter
 *
 * CountAPI (api.countapi.xyz) was shut down (DNS no longer resolves), so we
 * use visitor-badge.laobi.icu — a free, maintained, no-auth visitor badge.
 * It returns an SVG badge with a live visitor count; embedded as an <img>.
 */
(function () {
  "use strict";

  // One shared counter for the whole site.
  var PAGE_ID = "music-radio-atlas";
  var BADGE_URL = "https://visitor-badge.laobi.icu/badge?page_id=" + encodeURIComponent(PAGE_ID);

  function init() {
    var el = document.getElementById("visitor-badge");
    if (!el) return;

    var img = document.createElement("img");
    img.src = BADGE_URL;
    img.alt = "Visitors";
    img.setAttribute("loading", "lazy");
    img.setAttribute("referrerpolicy", "no-referrer");
    img.style.height = "20px";
    img.style.borderRadius = "5px";
    img.style.verticalAlign = "middle";
    el.appendChild(img);
  }

  window.Counter = { init: init };
})();

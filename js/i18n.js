/**
 * Music Radio — i18n dictionary + language management (vanilla JS)
 * 6 languages: English, Cymraeg, Deutsch, Français, Italiano, Español
 */
(function () {
  "use strict";

  var I18N = {
    en: {
      brand: "Music Radio",
      tagline: "Multi-Channel Web Radio",

      "nav.home": "Home",
      "nav.classical": "Classical",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Multi-Channel Web Radio",
      "home.hero_title": "Your Soundtrack for Every Moment.",
      "home.hero_sub": "Classical, Jazz and curated Vibes — live streams from around the globe.",
      "home.classical_title": "Classical",
      "home.classical_desc": "Elegant orchestral and chamber music.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Classic, smooth, and lounge jazz vibes.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Ambient music for your day.",
      "home.stations": "stations",
      "home.view_all": "View All",

      "classical.title": "Classical Radio",
      "classical.subtitle": "Pure classical music, organized by geographic region.",
      "classical.choose_region": "Choose a region",
      "classical.stations": "stations",
      "classical.top_overall": "Top 20 Selected",

      "jazz.title": "Jazz Radio",
      "jazz.subtitle": "Relaxed and romantic, organized by sub-genre.",
      "jazz.choose": "Choose a sub-genre",
      "jazz.stations": "stations",

      "vibes.title": "Vibes Radio",
      "vibes.subtitle": "Ambient and scenario-based soundscapes.",
      "vibes.choose": "Choose a scenario",
      "vibes.stations": "tracks",

      "player.now_playing": "Now Playing",
      "player.nothing": "Select a station to begin",
      "player.play": "Play",
      "player.pause": "Pause",
      "player.volume": "Volume",
      "player.loading": "Buffering…",
      "player.error": "Stream unavailable",

      "footer.visitors": "Visitors",
      "footer.disclaimer": "This website is for personal use. All audio streams are aggregated from public internet sources. We do not host any media files.",

      "common.back": "Return to Home",
      "common.loading": "Loading stations…",
      "common.no_stations": "No stations available",
      "common.buffering": "Buffering…"
    },

    cy: {
      brand: "Music Radio",
      tagline: "Radio Gwe Aml-Sianel",

      "nav.home": "Hafan",
      "nav.classical": "Clasurol",
      "nav.jazz": "Jazz",
      "nav.vibes": "Awyrgylch",

      "home.title": "Music Radio — Radio Gwe Aml-Sianel",
      "home.hero_title": "Eich Trac Sain ar gyfer Pob Eiliad.",
      "home.hero_sub": "Clasurol, Jazz ac Awyrgylch dethol — ffrydiau byw o bedwar ban byd.",
      "home.classical_title": "Clasurol",
      "home.classical_desc": "Cerddoriaeth gerddorfaol a siambr gain.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Awyrgylch jazz clasurol, llyfn a lolfa.",
      "home.vibes_title": "Awyrgylch",
      "home.vibes_desc": "Cerddoriaeth amgylchynol i'ch diwrnod.",
      "home.stations": "gorsafoedd",
      "home.view_all": "Gweld y Cyfan",

      "classical.title": "Radio Clasurol",
      "classical.subtitle": "Cerddoriaeth glasurol bur, wedi'i threfnu yn ôl rhanbarth daearyddol.",
      "classical.choose_region": "Dewiswch ranbarth",
      "classical.stations": "gorsafoedd",
      "classical.top_overall": "Detholiad 20 Uchaf",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Ymlaciol a rhamantus, wedi'i drefnu yn ôl is-genre.",
      "jazz.choose": "Dewiswch is-genre",
      "jazz.stations": "gorsafoedd",

      "vibes.title": "Radio Awyrgylch",
      "vibes.subtitle": "Tirluniau sain amgylchynol a seiliedig ar senario.",
      "vibes.choose": "Dewiswch senario",
      "vibes.stations": "traciau",

      "player.now_playing": "Yn Chwarae Nawr",
      "player.nothing": "Dewiswch orsaf i ddechrau",
      "player.play": "Chwarae",
      "player.pause": "Seibio",
      "player.volume": "Cyfaint",
      "player.loading": "Yn byffro…",
      "player.error": "Ffrwd ddim ar gael",

      "footer.visitors": "Ymwelwyr",
      "footer.disclaimer": "Mae'r wefan hon at ddefnydd personol. Daw'r holl ffrydiau sain o ffynonellau rhyngrwyd cyhoeddus. Nid ydym yn cynnal unrhyw ffeiliau cyfryngau.",

      "common.back": "Dychwelyd i'r Hafan",
      "common.loading": "Wrthi'n llwytho gorsafoedd…",
      "common.no_stations": "Dim gorsafoedd ar gael",
      "common.buffering": "Yn byffro…"
    },

    de: {
      brand: "Music Radio",
      tagline: "Mehrkanal-Webradio",

      "nav.home": "Startseite",
      "nav.classical": "Klassik",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Mehrkanal-Webradio",
      "home.hero_title": "Dein Soundtrack für jeden Moment.",
      "home.hero_sub": "Klassik, Jazz und kuratierte Vibes — Livestreams aus aller Welt.",
      "home.classical_title": "Klassik",
      "home.classical_desc": "Elegante Orchester- und Kammermusik.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Klassischer, sanfter und Lounge-Jazz.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Ambient-Musik für deinen Tag.",
      "home.stations": "Sender",
      "home.view_all": "Alle anzeigen",

      "classical.title": "Klassikradio",
      "classical.subtitle": "Reine klassische Musik, nach geografischer Region geordnet.",
      "classical.choose_region": "Region wählen",
      "classical.stations": "Sender",
      "classical.top_overall": "Top 20 Auswahl",

      "jazz.title": "Jazzradio",
      "jazz.subtitle": "Entspannt und romantisch, nach Subgenre geordnet.",
      "jazz.choose": "Subgenre wählen",
      "jazz.stations": "Sender",

      "vibes.title": "Vibes Radio",
      "vibes.subtitle": "Ambiente und szenenbasierte Klanglandschaften.",
      "vibes.choose": "Szenerie wählen",
      "vibes.stations": "Streams",

      "player.now_playing": "Jetzt läuft",
      "player.nothing": "Wähle einen Sender",
      "player.play": "Abspielen",
      "player.pause": "Pause",
      "player.volume": "Lautstärke",
      "player.loading": "Puffert…",
      "player.error": "Stream nicht verfügbar",

      "footer.visitors": "Besucher",
      "footer.disclaimer": "Diese Website dient dem persönlichen Gebrauch. Alle Audiostreams stammen aus öffentlichen Internetquellen. Wir hosten keine Mediendateien.",

      "common.back": "Zurück zur Startseite",
      "common.loading": "Sender werden geladen…",
      "common.no_stations": "Keine Sender verfügbar",
      "common.buffering": "Puffert…"
    },

    fr: {
      brand: "Music Radio",
      tagline: "Radio web multicanaux",

      "nav.home": "Accueil",
      "nav.classical": "Classique",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Radio web multicanaux",
      "home.hero_title": "Votre bande-son pour chaque instant.",
      "home.hero_sub": "Classique, jazz et Vibes sélectionnés — flux en direct du monde entier.",
      "home.classical_title": "Classique",
      "home.classical_desc": "Musique orchestrale et de chambre élégante.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Jazz classique, smooth et lounge.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Musique ambient pour votre journée.",
      "home.stations": "stations",
      "home.view_all": "Tout afficher",

      "classical.title": "Radio Classique",
      "classical.subtitle": "Musique classique pure, classée par région géographique.",
      "classical.choose_region": "Choisir une région",
      "classical.stations": "stations",
      "classical.top_overall": "Top 20 Sélection",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Détendu et romantique, classé par sous-genre.",
      "jazz.choose": "Choisir un sous-genre",
      "jazz.stations": "stations",

      "vibes.title": "Radio Vibes",
      "vibes.subtitle": "Ambiances et scénarios sonores.",
      "vibes.choose": "Choisir un scénario",
      "vibes.stations": "pistes",

      "player.now_playing": "En cours",
      "player.nothing": "Sélectionnez une station",
      "player.play": "Lecture",
      "player.pause": "Pause",
      "player.volume": "Volume",
      "player.loading": "Mise en mémoire tampon…",
      "player.error": "Flux indisponible",

      "footer.visitors": "Visiteurs",
      "footer.disclaimer": "Ce site est à usage personnel. Tous les flux audio proviennent de sources Internet publiques. Nous n'hébergeons aucun fichier multimédia.",

      "common.back": "Retour à l'accueil",
      "common.loading": "Chargement des stations…",
      "common.no_stations": "Aucune station disponible",
      "common.buffering": "Mise en mémoire tampon…"
    },

    it: {
      brand: "Music Radio",
      tagline: "Radio web multicanale",

      "nav.home": "Home",
      "nav.classical": "Classica",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Radio web multicanale",
      "home.hero_title": "La tua colonna sonora per ogni momento.",
      "home.hero_sub": "Classica, jazz e Vibes curati — streaming dal vivo da tutto il mondo.",
      "home.classical_title": "Classica",
      "home.classical_desc": "Elegante musica orchestrale e da camera.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Jazz classico, smooth e lounge.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Musica ambient per la tua giornata.",
      "home.stations": "stazioni",
      "home.view_all": "Mostra tutti",

      "classical.title": "Radio Classica",
      "classical.subtitle": "Musica classica pura, organizzata per regione geografica.",
      "classical.choose_region": "Scegli una regione",
      "classical.stations": "stazioni",
      "classical.top_overall": "Top 20 Selezionati",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Rilassato e romantico, organizzato per sottogenere.",
      "jazz.choose": "Scegli un sottogenere",
      "jazz.stations": "stazioni",

      "vibes.title": "Radio Vibes",
      "vibes.subtitle": "Ambient e scenari sonori.",
      "vibes.choose": "Scegli uno scenario",
      "vibes.stations": "brani",

      "player.now_playing": "In riproduzione",
      "player.nothing": "Seleziona una stazione",
      "player.play": "Riproduci",
      "player.pause": "Pausa",
      "player.volume": "Volume",
      "player.loading": "Buffering…",
      "player.error": "Stream non disponibile",

      "footer.visitors": "Visitatori",
      "footer.disclaimer": "Questo sito è per uso personale. Tutti i flussi audio provengono da fonti internet pubbliche. Non ospitiamo alcun file multimediale.",

      "common.back": "Torna alla home",
      "common.loading": "Caricamento stazioni…",
      "common.no_stations": "Nessuna stazione disponibile",
      "common.buffering": "Buffering…"
    },

    es: {
      brand: "Music Radio",
      tagline: "Radio web multicanal",

      "nav.home": "Inicio",
      "nav.classical": "Clásica",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Radio web multicanal",
      "home.hero_title": "Tu banda sonora para cada momento.",
      "home.hero_sub": "Clásica, jazz y Vibes seleccionados — emisiones en directo de todo el mundo.",
      "home.classical_title": "Clásica",
      "home.classical_desc": "Elegante música orquestal y de cámara.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Jazz clásico, suave y lounge.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Música ambient para tu día.",
      "home.stations": "emisoras",
      "home.view_all": "Ver todo",

      "classical.title": "Radio Clásica",
      "classical.subtitle": "Música clásica pura, organizada por región geográfica.",
      "classical.choose_region": "Elige una región",
      "classical.stations": "emisoras",
      "classical.top_overall": "Top 20 Seleccionados",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Relajado y romántico, organizado por subgénero.",
      "jazz.choose": "Elige un subgénero",
      "jazz.stations": "emisoras",

      "vibes.title": "Radio Vibes",
      "vibes.subtitle": "Ambient y escenarios sonoros.",
      "vibes.choose": "Elige un escenario",
      "vibes.stations": "pistas",

      "player.now_playing": "Sonando",
      "player.nothing": "Selecciona una emisora",
      "player.play": "Reproducir",
      "player.pause": "Pausa",
      "player.volume": "Volumen",
      "player.loading": "Cargando…",
      "player.error": "Stream no disponible",

      "footer.visitors": "Visitantes",
      "footer.disclaimer": "Este sitio es de uso personal. Todas las emisiones de audio provienen de fuentes públicas de internet. No alojamos ningún archivo multimedia.",

      "common.back": "Volver al inicio",
      "common.loading": "Cargando emisoras…",
      "common.no_stations": "No hay emisoras disponibles",
      "common.buffering": "Cargando…"
    }
  };

  var LANGUAGES = [
    { code: "en", label: "English" },
    { code: "cy", label: "Cymraeg" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "es", label: "Español" }
  ];

  var currentLang = "en";

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem("music-radio-lang"); } catch (e) { /* noop */ }
    if (saved && I18N[saved]) return saved;
    var nav = (navigator.language || "en").toLowerCase();
    var two = nav.slice(0, 2);
    if (I18N[two]) return two;
    if (I18N[nav]) return nav;
    return "en";
  }

  function t(key, vars) {
    var s = (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var spec = el.getAttribute("data-i18n-attr"); // "title:key" or "aria-label:key"
      var parts = spec.split(":");
      var attr = parts[0];
      var key = parts.slice(1).join(":");
      el.setAttribute(attr, t(key));
    });
    var titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) document.title = t(titleEl.getAttribute("data-i18n"));
  }

  function buildLangSwitcher() {
    var sel = document.getElementById("lang-switcher");
    if (!sel) return;
    LANGUAGES.forEach(function (lang) {
      var opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = lang.label;
      sel.appendChild(opt);
    });
    sel.value = currentLang;
    sel.addEventListener("change", function () {
      setLang(sel.value);
    });
  }

  function setLang(code) {
    if (!I18N[code]) code = "en";
    currentLang = code;
    try { localStorage.setItem("music-radio-lang", code); } catch (e) { /* noop */ }
    applyTranslations();
    if (window.onLanguageChange) window.onLanguageChange(code);
  }

  window.I18N = {
    t: t,
    getLang: function () { return currentLang; },
    setLang: setLang,
    languages: LANGUAGES,
    init: function () {
      currentLang = detectLang();
      buildLangSwitcher();
      applyTranslations();
    }
  };
})();

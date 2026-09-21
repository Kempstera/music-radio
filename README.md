# Radio Atlas — Multi-Channel Web Radio

A static multi-channel web radio station with three curated categories — **Classical**, **Jazz**, and **Vibes** — streaming live from the public Radio-Browser directory.

**Live:** https://music-radio.signupeverywhere.cc

## Structure

```
music-radio/
├── index.html        # Home — three portals
├── classical.html    # Classical, organized by geographic region
├── jazz.html         # Jazz, organized by sub-genre
├── vibe.html         # Vibes, organized by scenario
├── css/style.css     # Shared styles + per-page theme personalities
├── js/
│   ├── i18n.js       # 5-language dictionary (EN/DE/FR/IT/ES)
│   ├── player.js     # Persistent bottom audio player (mp3/aac + HLS)
│   ├── app.js        # Loads stations.json, renders grouped cards
│   └── counter.js    # Visitor counter (visitor-badge.laobi.icu)
├── hls.min.js        # hls.js (local copy for HLS/m3u8 streams)
├── stations.json     # Fetched + curated station data (1,695 streams)
└── fetch_stations.py # Phase 1 pipeline (Radio-Browser → stations.json)
```

## Data pipeline (Phase 1)

`fetch_stations.py` queries the Radio-Browser API and produces `stations.json`:

- **Categories:** Classical (by region), Jazz (by sub-genre), Vibes (by scenario)
- **Global dedupe:** one stream = one category; priority Classical > Jazz > Vibes
- **Strict purity:** "jazz"-named stations removed from Classical; religious/spoken-word
  programming excluded from all categories
- **Quality gates:** `hidebroken=true`, codec mp3/aac/m3u8, dedupe by URL, sort by clickcount
- **Mixed-content fix:** `http://` streams upgraded to `https://` (or dropped if they fail),
  so audio actually plays on the HTTPS site

Re-run anytime to refresh data:
```bash
python3 fetch_stations.py
```

## Frontend (Phase 2)

Pure HTML/CSS/vanilla JS, no build step. Features:

- 5-language switcher (English, Deutsch, Français, Italiano, Español) — persisted in localStorage
- Persistent HTML5 audio player fixed to the bottom of the screen
- Per-category visual themes: vintage parchment (Classical), dark lounge (Jazz), scenario gradients (Vibes)
- Visitor counter + legal disclaimer in the footer on every page
- Local `hls.min.js` fallback for HLS streams (Safari uses native HLS)

## Local preview

```bash
python3 -m http.server 8377
# open http://127.0.0.1:8377/
```

## Deployment (Phase 3)

Static site deployed to Cloudflare, custom domain `music-radio.signupeverywhere.cc`.

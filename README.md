# Music Radio — Multi-Channel Web Radio

A premium, Apple-style static multi-channel web radio with three curated categories — **Classical**, **Jazz**, and **Vibes** — streaming live from the public Radio-Browser directory.

**Live:** https://music-radio.signupeverywhere.cc

## Structure

```
music-radio/
├── index.html        # Home — slogan + three portals
├── classical.html    # Classical, organized by geographic region (fixed order)
├── jazz.html         # Jazz, organized by sub-genre
├── vibe.html         # Vibes, organized by scenario
├── css/style.css     # Apple HIG light theme (frosted glass, white cards)
├── js/
│   ├── i18n.js       # 5-language dictionary (EN/DE/FR/IT/ES)
│   ├── player.js     # Persistent bottom player (mp3/aac + HLS, auto-skip)
│   ├── app.js        # Loads stations.json, renders grouped cards (Top 20 + View All)
│   └── counter.js    # Visitor counter (visitor-badge.laobi.icu)
├── hls.min.js        # hls.js (local copy for HLS/m3u8 streams)
├── stations.json     # Fetched + curated station data (1,649 streams)
└── fetch_stations.py # Phase 1 pipeline (Radio-Browser → stations.json)
```

## Data pipeline (Phase 1)

`fetch_stations.py` queries the Radio-Browser API and produces `stations.json`:

- **Categories:** Classical (by region), Jazz (by sub-genre), Vibes (by scenario)
- **Global dedupe:** one stream = one category; priority Classical > Jazz > Vibes
- **Strict purity:** "jazz"-named stations removed from Classical; religious/spoken-word
  programming excluded from all categories
- **Traffic/news exclusion:** `traffic`, `news`, `information`, `交通`, `新闻`, `资讯`, `综合`
  excluded from every category
- **Quality gates:** `hidebroken=true`, codec mp3/aac/m3u8, dedupe by URL, sort by clickcount
- **Mixed-content fix:** `http://` streams upgraded to `https://` (or dropped if they fail),
  so audio actually plays on the HTTPS site

Re-run anytime to refresh data:
```bash
python3 fetch_stations.py
```

## Frontend (Phase 2)

Pure HTML/CSS/vanilla JS, no build step. Features:

- **Apple HIG light theme** — `#F5F5F7` background, white `16px`-radius cards, soft shadows,
  frosted-glass sticky nav (`backdrop-filter: blur(12px)`)
- **Serif slogan** ("Your Soundtrack for Every Moment.") in Playfair Display with a
  fade-in + slide-up animation on load
- **Inline SVG soundwave logo** next to the "Music Radio" brand
- **Top 20 + "View All"** — every section shows only the top 20 stations (sorted by
  clicks/votes); a "View All" button expands the rest in-place, no reload
- **Classical custom order** — Top 20 overall first, then regions in fixed order:
  UK, USA, Germany, France, Italy, Spain, Nordic, Asia, South America, Africa, Global / International
- **Auto-skip player** — if a stream fails to load or goes dead, the player automatically
  advances to the next station in the current list
- 5-language switcher (English, Deutsch, Français, Italiano, Español) — persisted in localStorage
- Persistent HTML5 audio player fixed to the bottom of the screen
- Visitor counter + legal disclaimer in the footer on every page
- Local `hls.min.js` fallback for HLS streams (Safari uses native HLS)

## Local preview

```bash
python3 -m http.server 8377
# open http://127.0.0.1:8377/
```

## Deployment (Phase 3)

Static site deployed to Cloudflare Pages, custom domain `music-radio.signupeverywhere.cc`.

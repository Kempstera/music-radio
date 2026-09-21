#!/usr/bin/env python3
"""
Multi-Channel Web Radio Station - Phase 1 (v2)
Fetch & categorize free radio streams via the Radio Browser API.

Fixes applied (per user decision):
  1. Global dedupe: one station = one main category only.
     Priority: Classical > Jazz > Vibes.
     Strict rule: any station with "jazz" in name/tags is REMOVED from Classical.
     Within a category, each URL appears in exactly one bucket (best quality).
  2. "Other" region relabeled "Global / International" (not dropped).
  3. Backfills:
     - Nordic: classical stations from SE/NO/DK/FI/IS by country code.
     - Roadtrip: extra tags driving/travel/journey/highway.
     - Bebop: extra tags hardbop/postbop (plus bebop).

Output: stations.json
{
  "classical": { "<region>": [ {station}, ... ], ... },
  "jazz":      { "<subgenre>": [ {station}, ... ], ... },
  "vibes":     { "<scenario>": [ {station}, ... ], ... }
}
Each station: { name, url, country, tags, codec, votes, clickcount, bitrate }
"""

import requests
import json
import time
import concurrent.futures
from collections import OrderedDict, defaultdict

# ---- API config -----------------------------------------------------------
API_MIRRORS = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://at1.api.radio-browser.info",
    "https://fi1.api.radio-browser.info",
]
UA = {"User-Agent": "music-radio-signupeverywhere/1.1 (personal web radio)"}

ALLOWED_CODECS = {"mp3", "aac", "aac+", "aacp", "m3u8", "hls"}
CODEC_EXT = (".mp3", ".aac", ".m3u8")

# ---- Category definitions --------------------------------------------------
CLASSICAL_TAGS = ["classical", "symphony", "opera", "baroque"]
# Religious / spoken-word programming — excluded from EVERY category
GLOBAL_NEGATIVE = [
    "religion", "religious", "christian", "catholic", "gospel", "worship",
    "praise", "church", "ministry", "bible", "jesus", "faith", "salvation",
    "sermon", "scripture",
    "quran", "qur'an", "islamic", "islam", "muslim", "recitation", "nasheed",
    "adhan", "tilawat", "mushaf", "sheikh", "tafsir",
]

# Classical additionally excludes these genre/format tags (pure classical only)
CLASSICAL_EXTRA_NEGATIVE = ["talk", "news", "pop", "rock", "oldies"]

# backfilled tags: bebop/hardbop/postbop for jazz; driving/travel/journey/highway for vibes
JAZZ_TAGS = [
    "jazz", "bossanova", "lounge", "smoothjazz",
    "bebop", "hardbop", "postbop",
]

VIBES_TAGS = [
    "ambient", "study", "lofi", "chillout", "workout", "meditation",
    "roadtrip", "focus", "relax", "zen", "lo-fi",
    "driving", "travel", "journey", "highway",
]

# Nordic backfill by country code (classical)
NORDIC_COUNTRIES = ["SE", "NO", "DK", "FI", "IS"]

# ---- Region mapping (Classical) -------------------------------------------
REGION_BY_COUNTRY = {
    "GB": "UK", "IM": "UK", "JE": "UK", "GG": "UK",
    "FR": "France", "MC": "France",
    "DE": "Germany", "AT": "Germany", "CH": "Germany",
    "ES": "Spain", "AD": "Spain",
    "IT": "Italy", "VA": "Italy", "SM": "Italy",
    "SE": "Nordic", "NO": "Nordic", "DK": "Nordic", "FI": "Nordic", "IS": "Nordic",
    "US": "USA", "CA": "USA",
    "AR": "South America", "BR": "South America", "CL": "South America",
    "CO": "South America", "PE": "South America", "UY": "South America",
    "VE": "South America", "MX": "South America", "EC": "South America",
    "ZA": "Africa", "NG": "Africa", "KE": "Africa", "GH": "Africa",
    "EG": "Africa", "MA": "Africa",
    "AU": "Oceania", "NZ": "Oceania",
    "JP": "Asia", "CN": "Asia", "KR": "Asia", "IN": "Asia", "TH": "Asia",
    "SG": "Asia", "MY": "Asia", "PH": "Asia", "TW": "Asia", "HK": "Asia",
    "ID": "Asia", "VN": "Asia", "TR": "Asia", "IL": "Asia", "AE": "Asia",
    "NL": "UK", "BE": "France", "PL": "Germany", "CZ": "Germany",
    "RU": "Germany", "PT": "Spain", "IE": "UK", "LU": "Germany",
    "GR": "Italy", "HR": "Italy", "SI": "Italy", "HU": "Germany",
}
DEFAULT_REGION = "Global / International"

# ---- Sub-genre / scenario mapping -----------------------------------------
JAZZ_SUBGENRE_KEYWORDS = OrderedDict([
    ("Smooth Jazz", ["smooth", "smoothjazz"]),
    ("Bossa Nova", ["bossanova", "bossa", "brazil"]),
    ("Bebop", ["bebop", "bop", "hardbop", "hard bop", "postbop", "post bop"]),
    ("Big Band", ["bigband", "big band", "swing", "big-band"]),
    ("Lounge", ["lounge", "chill", "cocktail", "easy listening"]),
])

VIBES_SCENARIO_KEYWORDS = OrderedDict([
    ("Study / Focus", ["study", "focus", "lofi", "lo-fi", "homework", "concentration", "exam"]),
    ("Running / Workout", ["workout", "running", "run", "gym", "fitness", "exercise", "cardio", "training"]),
    ("Meditation / Relax", ["meditation", "relax", "zen", "yoga", "sleep", "calm", "spa", "peaceful"]),
    ("Party / Upbeat", ["party", "dance", "upbeat", "club", "house", "edm", "energy", "festival"]),
    ("Roadtrip / Driving", ["roadtrip", "driving", "drive", "travel", "car", "highway", "journey", "trip"]),
])


class RadioBrowserClient:
    def __init__(self, mirrors):
        self.mirrors = list(mirrors)

    def _get(self, path, params):
        last_err = None
        for base in self.mirrors:
            url = base + path
            try:
                r = requests.get(url, params=params, headers=UA, timeout=25)
                if r.status_code == 200:
                    return r.json()
                last_err = f"{url} -> HTTP {r.status_code}"
            except Exception as e:  # noqa: BLE001
                last_err = f"{url} -> {e!r}"
        raise RuntimeError(f"All mirrors failed: {last_err}")

    def search(self, tag, **extra):
        params = {
            "tag": tag,
            "hidebroken": "true",
            "order": "clickcount",
            "reverse": "true",
            "limit": 600,
        }
        params.update(extra)
        return self._get("/json/stations/search", params)


def codec_ok(station):
    codec = (station.get("codec") or "").lower()
    url = (station.get("url_resolved") or station.get("url") or "").lower()
    if codec in ALLOWED_CODECS:
        return True
    base = url.split("?")[0]
    return base.endswith(CODEC_EXT)


def clean_station(s):
    return {
        "name": s.get("name", "").strip(),
        "url": s.get("url_resolved") or s.get("url") or "",
        "country": (s.get("countrycode") or s.get("country") or "").upper(),
        "tags": s.get("tags") or "",
        "codec": (s.get("codec") or "").lower(),
        "votes": int(s.get("votes") or 0),
        "clickcount": int(s.get("clickcount") or 0),
        "bitrate": int(s.get("bitrate") or 0),
    }


def classical_is_clean(name, tags):
    blob = f"{name} {tags}".lower()
    for neg in GLOBAL_NEGATIVE + CLASSICAL_EXTRA_NEGATIVE:
        if neg in blob:
            return False
    return True


def global_is_clean(name, tags):
    blob = f"{name} {tags}".lower()
    for neg in GLOBAL_NEGATIVE:
        if neg in blob:
            return False
    return True


def contains_jazz(s):
    return "jazz" in f"{s['name']} {s['tags']}".lower()


def region_for(country):
    return REGION_BY_COUNTRY.get(country, DEFAULT_REGION)


def pick_bucket(keyword_map, tags, name):
    blob = f"{tags} {name}".lower()
    for bucket, kws in keyword_map.items():
        for kw in kws:
            if kw in blob:
                return bucket
    return None


def dedupe_category(bucket_map):
    """Assign each URL to exactly one bucket within a category (best quality first)."""
    flat = []
    for bucket, stations in bucket_map.items():
        for s in stations:
            flat.append((bucket, s))
    flat.sort(key=lambda t: (-t[1]["clickcount"], -t[1]["votes"]))
    assigned = set()
    out = defaultdict(list)
    for bucket, s in flat:
        if s["url"] in assigned:
            continue
        assigned.add(s["url"])
        out[bucket].append(s)
    return out


def finalize(bucket_map):
    """Sort buckets by key, dedupe by URL (belt & braces), sort by quality."""
    out = OrderedDict()
    for key in sorted(bucket_map.keys()):
        items = bucket_map[key]
        seen = set()
        deduped = []
        for s in items:
            if s["url"] in seen:
                continue
            seen.add(s["url"])
            deduped.append(s)
        deduped.sort(key=lambda s: (-s["clickcount"], -s["votes"]))
        out[key] = deduped
    return out


def apply_global_dedupe(classical, jazz, vibes):
    """Priority Classical > Jazz > Vibes: a URL may exist in only ONE category."""
    assigned = set()
    for cat in (classical, jazz, vibes):
        for bucket in cat:
            kept = []
            for s in cat[bucket]:
                if s["url"] in assigned:
                    continue
                assigned.add(s["url"])
                kept.append(s)
            cat[bucket] = kept
    return classical, jazz, vibes


def _https_ok(url):
    h = url.replace("http://", "https://", 1)
    try:
        r = requests.get(h, stream=True, timeout=8, headers={**UA, "Range": "bytes=0-0"})
        r.close()
        return h if r.status_code < 400 else None
    except Exception:  # noqa: BLE001
        return None


def upgrade_http_streams(classical, jazz, vibes):
    """Upgrade http:// streams to https:// (mixed content blocks http audio on an HTTPS page).
    Streams that cannot upgrade are dropped so every entry in the JSON actually plays."""
    http_refs = []
    for cat in (classical, jazz, vibes):
        for g, sts in cat.items():
            for i, s in enumerate(sts):
                if s["url"].startswith("http://"):
                    http_refs.append((cat, g, i, s["url"]))
    if not http_refs:
        return classical, jazz, vibes
    print(f"== Upgrading {len(http_refs)} http:// streams to https:// ==")
    urls = [r[3] for r in http_refs]
    upgraded = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as ex:
        futs = {ex.submit(_https_ok, u): u for u in urls}
        done = 0
        for fut in concurrent.futures.as_completed(futs):
            u = futs[fut]
            done += 1
            try:
                h = fut.result()
                if h:
                    upgraded[u] = h
            except Exception:  # noqa: BLE001
                pass
            if done % 200 == 0:
                print(f"  tested {done}/{len(urls)}, upgraded {len(upgraded)}")
    dropped_urls = set()
    for ref, u in zip(http_refs, urls):
        cat, g, i, _ = ref
        if u in upgraded:
            cat[g][i]["url"] = upgraded[u]
        else:
            dropped_urls.add(u)
    for cat in (classical, jazz, vibes):
        for g in list(cat.keys()):
            cat[g] = [s for s in cat[g] if s["url"] not in dropped_urls]
    print(f"  upgraded {len(upgraded)}, dropped {len(dropped_urls)}")
    return classical, jazz, vibes


def main():
    client = RadioBrowserClient(API_MIRRORS)

    classical_raw = []
    jazz_raw = []
    vibes_raw = []

    print("== Fetching Classical ==")
    for tag in CLASSICAL_TAGS:
        try:
            res = client.search(tag)
            classical_raw.extend(res)
            print(f"  tag={tag}: {len(res)}")
        except Exception as e:  # noqa: BLE001
            print(f"  tag={tag}: FAILED {e}")
        time.sleep(0.6)

    print("== Nordic backfill (classical, by country) ==")
    for code in NORDIC_COUNTRIES:
        for tag in CLASSICAL_TAGS:
            try:
                res = client.search(tag, countrycode=code, limit=100)
                classical_raw.extend(res)
                print(f"  {code}/{tag}: {len(res)}")
            except Exception as e:  # noqa: BLE001
                print(f"  {code}/{tag}: FAILED {e}")
            time.sleep(0.4)

    print("== Fetching Jazz ==")
    for tag in JAZZ_TAGS:
        try:
            res = client.search(tag)
            jazz_raw.extend(res)
            print(f"  tag={tag}: {len(res)}")
        except Exception as e:  # noqa: BLE001
            print(f"  tag={tag}: FAILED {e}")
        time.sleep(0.6)

    print("== Fetching Vibes ==")
    for tag in VIBES_TAGS:
        try:
            res = client.search(tag)
            vibes_raw.extend(res)
            print(f"  tag={tag}: {len(res)}")
        except Exception as e:  # noqa: BLE001
            print(f"  tag={tag}: FAILED {e}")
        time.sleep(0.6)

    # ---- Clean & filter ----------------------------------------------------
    def process(raw):
        cleaned = []
        for s in raw:
            if not codec_ok(s):
                continue
            c = clean_station(s)
            if c["name"] and c["url"]:
                cleaned.append(c)
        return cleaned

    classical = process(classical_raw)
    jazz = [s for s in process(jazz_raw) if global_is_clean(s["name"], s["tags"])]
    vibes = [s for s in process(vibes_raw) if global_is_clean(s["name"], s["tags"])]

    # ---- Classical: strict exclusion + negative filter --------------------
    # (1) negative keywords, (2) STRICT: no "jazz" anywhere
    classical_clean = [
        s for s in classical
        if classical_is_clean(s["name"], s["tags"]) and not contains_jazz(s)
    ]

    classical_by_region = defaultdict(list)
    for s in classical_clean:
        classical_by_region[region_for(s["country"])].append(s)

    # ---- Jazz: sub-genre bucket -------------------------------------------
    jazz_by_sub = defaultdict(list)
    jazz_unmatched = []
    for s in jazz:
        bucket = pick_bucket(JAZZ_SUBGENRE_KEYWORDS, s["tags"], s["name"])
        if bucket:
            jazz_by_sub[bucket].append(s)
        else:
            jazz_unmatched.append(s)
    if jazz_unmatched:
        jazz_by_sub["General Jazz"].extend(jazz_unmatched)

    # ---- Vibes: scenario bucket -------------------------------------------
    vibes_by_scenario = defaultdict(list)
    vibes_unmatched = []
    for s in vibes:
        bucket = pick_bucket(VIBES_SCENARIO_KEYWORDS, s["tags"], s["name"])
        if bucket:
            vibes_by_scenario[bucket].append(s)
        else:
            vibes_unmatched.append(s)
    if vibes_unmatched:
        vibes_by_scenario["General Vibes"].extend(vibes_unmatched)

    # ---- Within-category dedupe (one URL = one bucket) --------------------
    classical_by_region = dedupe_category(classical_by_region)
    jazz_by_sub = dedupe_category(jazz_by_sub)
    vibes_by_scenario = dedupe_category(vibes_by_scenario)

    # ---- Global dedupe (one URL = one category, priority C > J > V) -------
    classical_by_region, jazz_by_sub, vibes_by_scenario = apply_global_dedupe(
        classical_by_region, jazz_by_sub, vibes_by_scenario
    )

    # ---- HTTP -> HTTPS upgrade (mixed-content fix) + re-dedupe -----------
    classical_by_region, jazz_by_sub, vibes_by_scenario = upgrade_http_streams(
        classical_by_region, jazz_by_sub, vibes_by_scenario
    )
    classical_by_region, jazz_by_sub, vibes_by_scenario = apply_global_dedupe(
        classical_by_region, jazz_by_sub, vibes_by_scenario
    )

    classical_final = finalize(classical_by_region)
    jazz_final = finalize(jazz_by_sub)
    vibes_final = finalize(vibes_by_scenario)

    result = {
        "classical": {k: v for k, v in classical_final.items()},
        "jazz": {k: v for k, v in jazz_final.items()},
        "vibes": {k: v for k, v in vibes_final.items()},
    }

    with open("stations.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # ---- Report ------------------------------------------------------------
    def count(bucket_map):
        return sum(len(v) for v in bucket_map.values())

    print("\n================ SUMMARY ================")
    print(f"Classical: {count(classical_final)} stations across {len(classical_final)} regions")
    for k, v in classical_final.items():
        print(f"   {k}: {len(v)}")
    print(f"Jazz: {count(jazz_final)} stations across {len(jazz_final)} sub-genres")
    for k, v in jazz_final.items():
        print(f"   {k}: {len(v)}")
    print(f"Vibes: {count(vibes_final)} stations across {len(vibes_final)} scenarios")
    for k, v in vibes_final.items():
        print(f"   {k}: {len(v)}")
    total = count(classical_final) + count(jazz_final) + count(vibes_final)
    print(f"\nTOTAL: {total} stations")
    print("Saved to stations.json")


if __name__ == "__main__":
    main()

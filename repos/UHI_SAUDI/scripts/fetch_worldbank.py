"""Refresh docs/macro_data.json from the World Bank Free API (Saudi Arabia, SAU).

The file has two independent blocks:
  * indicators  - overwritten on every run from the live API (with fallbacks)
  * calibration - never touched, so hand-tuned model constants survive refreshes

Usage:
    python scripts/fetch_worldbank.py
"""

import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone

API_ROOT = "https://api.worldbank.org/v2/country/SAU/indicator/{indicator}?format=json&per_page=25"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(REPO_ROOT, "docs", "macro_data.json")

INDICATORS = {
    "population_total": "SP.POP.TOTL",
    "gdp_usd": "NY.GDP.MKTP.CD",
    "gdp_per_capita_usd": "NY.GDP.PCAP.CD",
    "gdp_growth_annual_percent": "NY.GDP.MKTP.KD.ZG",
    "labor_force_participation_rate": "SL.TLF.CACT.ZS",
}

# Only used when the API is unreachable and no previous file exists.
FALLBACK = {
    "population_total": {"value": 36973555, "year": "2025"},
    "gdp_usd": {"value": 1276942933333.33, "year": "2025"},
    "gdp_per_capita_usd": {"value": 34615.0, "year": "2025"},
    "gdp_growth_annual_percent": {"value": 4.50246560191663, "year": "2025"},
    "labor_force_participation_rate": {"value": 65.098, "year": "2025"},
}

DEFAULT_CALIBRATION = {
    "base_year": 2025,
    "gdp_baseline_usd": 1108000000000,
    "households": 4000000,
    "median_household_income_usd": 48000,
    "pif_aum_usd": 925000000000,
    "sar_per_usd": 3.75,
    "vat_rate_percent": 15.0,
    "zakat_rate_percent": 2.5,
    "notes": (
        "Calibration constants are intentionally decoupled from the live indicator feed "
        "so scenario results stay comparable across data refreshes. Edited by hand only; "
        "scripts/fetch_worldbank.py preserves this block."
    ),
}

USER_AGENT = "UHI-SAUDI-Economy-Simulator/1.0 (+https://github.com)"


def load_previous():
    if not os.path.exists(OUT_PATH):
        return {}
    try:
        with open(OUT_PATH, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (ValueError, OSError):
        return {}


def fetch_indicator(indicator, retries=3):
    url = API_ROOT.format(indicator=indicator)
    for attempt in range(retries):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            if isinstance(payload, list) and len(payload) > 1 and payload[1]:
                for row in payload[1]:
                    if row.get("value") is not None:
                        return {"value": row["value"], "year": row.get("date")}
        except Exception as exc:  # noqa: BLE001 - network stack varies by platform
            print(f"  ! {indicator} attempt {attempt + 1}/{retries} failed: {exc}")
            time.sleep(1.5 * (attempt + 1))
    return None


def main():
    previous = load_previous()
    previous_indicators = previous.get("indicators") or previous.get("saudi_arabia") or {}
    calibration = previous.get("calibration") or DEFAULT_CALIBRATION

    print("Fetching latest World Bank indicators for Saudi Arabia (SAU)...")
    indicators = {}
    failures = 0

    for key, code in INDICATORS.items():
        result = fetch_indicator(code)
        if result:
            indicators[key] = {
                "indicator": code,
                "value": result["value"],
                "year": str(result["year"]),
                "source": "World Bank API",
            }
            print(f"  + {key}: {result['value']} ({result['year']})")
        else:
            failures += 1
            stale = previous_indicators.get(key)
            if stale:
                stale = dict(stale)
                stale["source"] = f"Stale cache ({stale.get('source', 'unknown')})"
                indicators[key] = stale
                print(f"  ~ {key}: API unavailable, keeping cached value")
            else:
                fallback = dict(FALLBACK[key])
                fallback.update({"indicator": code, "source": "Embedded fallback"})
                indicators[key] = fallback
                print(f"  - {key}: API unavailable, using embedded fallback")

    document = {
        "metadata": {
            "source": "World Bank Free API (api.worldbank.org/v2/country/SAU)",
            "description": (
                "Live indicator snapshot + fixed model calibration for the "
                "Saudi Arabia Autonomous Economy Simulator."
            ),
            "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "country": "SAU",
            "partial": failures > 0,
        },
        "indicators": indicators,
        "calibration": calibration,
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as handle:
        json.dump(document, handle, indent=4, ensure_ascii=False)
        handle.write("\n")

    print(f"Wrote {os.path.relpath(OUT_PATH, REPO_ROOT)} ({len(indicators)} indicators, {failures} fallbacks)")

    if failures == len(INDICATORS):
        print("::warning::World Bank API returned no indicators; all values are fallbacks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

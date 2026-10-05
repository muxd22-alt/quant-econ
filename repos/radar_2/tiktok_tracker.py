#!/usr/bin/env python3
"""
tiktok_tracker.py
─────────────────────────────────────────────────────────────────────────────
Windows Task Scheduler script — TikTok account tracker.

WHAT IT DOES
  1. Reads tiktok_accounts.csv  → list of usernames to monitor
  2. Reads cookies.json         → your TikTok session cookies
  3. Calls TikTok's internal API to fetch:
       - Account profile   (followers, likes, bio, verified, region …)
       - Recent videos     (views, likes, comments, shares, hashtags …)
  4. Appends NEW rows only to tiktok_results.csv  (deduplicates by video_id)
  5. Writes a timestamped log entry to tiktok_tracker.log

HOW TO RUN
  python tiktok_tracker.py

HOW TO SCHEDULE (Windows Task Scheduler)
  Action → Start a program:
    Program : python
    Arguments: "C:\\full\\path\\to\\tiktok_tracker.py"
    Start in : C:\\full\\path\\to\\this\\folder

SETUP
  1. pip install -r requirements.txt
  2. Copy cookies.json.example → cookies.json and fill in your values
  3. Edit tiktok_accounts.csv to add the usernames you want to track
"""

from __future__ import annotations

import csv
import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR     = Path(__file__).parent
ACCOUNTS_CSV = BASE_DIR / "tiktok_accounts.csv"
RESULTS_CSV  = BASE_DIR / "tiktok_results.csv"
COOKIES_FILE = BASE_DIR / "cookies.json"
LOG_FILE     = BASE_DIR / "tiktok_tracker.log"

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ── CSV columns (results file) ─────────────────────────────────────────────────
RESULT_FIELDS = [
    # Run metadata
    "run_at",
    # Account — static (from tiktok_accounts.csv)
    "username", "niche", "content_type", "priority", "status",
    "region_manual", "notes", "added_at",
    # Account — live profile
    "tiktok_id", "display_name", "bio", "verified", "private",
    "region_live", "language",
    "avatar_url", "profile_url",
    "follower_count", "following_count",
    "total_likes_account", "total_videos_account",
    # Account — engagement stats (computed from fetched videos)
    "sample_size",
    "avg_views", "avg_likes", "avg_comments", "avg_shares",
    "engagement_rate_pct",
    "videos_per_week",
    "top_hashtags",
    "latest_video_date",
    # Video — per-row
    "video_id", "video_title", "video_url",
    "video_thumbnail", "video_duration_sec",
    "video_views", "video_likes", "video_comments", "video_shares",
    "video_hashtags",
    "video_hashtag_1", "video_hashtag_2", "video_hashtag_3",
    "video_created_at", "video_scraped_at",
]


# ══════════════════════════════════════════════════════════════════════════════
# Cookie & session helpers
# ══════════════════════════════════════════════════════════════════════════════

def load_cookies() -> dict:
    """Load TikTok session cookies from cookies.json."""
    if not COOKIES_FILE.exists():
        log.error(f"cookies.json not found at {COOKIES_FILE}")
        log.error("Copy cookies.json.example → cookies.json and fill in your values.")
        sys.exit(1)
    with open(COOKIES_FILE, encoding="utf-8") as f:
        return json.load(f)


def make_session(cookies: dict) -> requests.Session:
    """Create a requests session that looks like a real Chrome browser."""
    s = requests.Session()
    s.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/126.0.0.0 Safari/537.36"
        ),
        "Accept":          "*/*",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Origin":          "https://www.tiktok.com",
        "sec-fetch-site":  "same-origin",
        "sec-fetch-mode":  "cors",
        "sec-fetch-dest":  "empty",
    })
    # Inject all cookies into the session
    for name, value in cookies.items():
        s.cookies.set(name, value, domain=".tiktok.com")
    return s


# ══════════════════════════════════════════════════════════════════════════════
# TikTok API calls
# ══════════════════════════════════════════════════════════════════════════════

BASE_PARAMS = {
    "aid":              "1988",
    "app_language":     "en",
    "app_name":         "tiktok_web",
    "browser_language": "en-US",
    "browser_name":     "Mozilla",
    "browser_online":   "true",
    "browser_platform": "Win32",
    "channel":          "tiktok_web",
    "cookie_enabled":   "true",
    "device_platform":  "web_pc",
    "focus_state":      "true",
    "is_fullscreen":    "false",
    "is_page_visible":  "true",
    "language":         "en",
    "os":               "windows",
    "screen_height":    "1080",
    "screen_width":     "1920",
    "tz_name":          "Asia/Riyadh",
}


def _get(session: requests.Session, url: str, params: dict,
         retries: int = 3, backoff: float = 2.0) -> dict | None:
    """GET with retry / backoff. Returns parsed JSON or None."""
    for attempt in range(1, retries + 1):
        try:
            r = session.get(url, params=params, timeout=20)
            r.raise_for_status()
            data = r.json()
            # TikTok returns statusCode 0 for success
            if data.get("statusCode", data.get("status_code", 0)) == 0:
                return data
            log.warning(f"TikTok API error: {data.get('statusMsg', data)}")
            return None
        except Exception as e:
            log.warning(f"  attempt {attempt}/{retries} failed: {e}")
            if attempt < retries:
                time.sleep(backoff * attempt)
    return None


def fetch_profile(session: requests.Session, username: str,
                  ms_token: str) -> dict | None:
    """Fetch account profile info. Returns raw TikTok userInfo dict or None."""
    params = {
        **BASE_PARAMS,
        "uniqueId": username,
        "msToken":  ms_token,
    }
    data = _get(session,
                "https://www.tiktok.com/api/user/detail/",
                params)
    if data:
        return data.get("userInfo")
    return None


def fetch_videos(session: requests.Session, sec_uid: str,
                 ms_token: str, count: int = 20) -> list[dict]:
    """Fetch recent videos for a user via secUid. Returns list of item dicts."""
    params = {
        **BASE_PARAMS,
        "secUid":  sec_uid,
        "count":   str(count),
        "cursor":  "0",
        "msToken": ms_token,
    }
    data = _get(session,
                "https://www.tiktok.com/api/post/item_list/",
                params)
    if data:
        return data.get("itemList", [])
    return []


# ══════════════════════════════════════════════════════════════════════════════
# Data helpers
# ══════════════════════════════════════════════════════════════════════════════

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def safe_avg(nums: list) -> int | None:
    nums = [n for n in nums if n is not None]
    return round(sum(nums) / len(nums)) if nums else None


def safe_pct(num, denom) -> float | None:
    if num is None or not denom:
        return None
    return round((num / denom) * 100, 2)


def top_hashtags(videos: list, n: int = 5) -> str:
    freq: dict[str, int] = {}
    for v in videos:
        for ht in (v.get("challenges") or []):
            tag = (ht.get("title") or "").lower().strip()
            if tag:
                freq[tag] = freq.get(tag, 0) + 1
    return "|".join(t for t, _ in sorted(freq.items(), key=lambda x: -x[1])[:n])


def ts_to_iso(ts) -> str | None:
    if not ts:
        return None
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    except Exception:
        return None


def videos_per_week(items: list) -> float | None:
    ts_list = sorted([int(v["createTime"]) for v in items if v.get("createTime")], reverse=True)
    if len(ts_list) < 2:
        return None
    span_weeks = (ts_list[0] - ts_list[-1]) / (7 * 24 * 3600)
    return round(len(ts_list) / span_weeks, 1) if span_weeks > 0 else None


# ══════════════════════════════════════════════════════════════════════════════
# CSV helpers
# ══════════════════════════════════════════════════════════════════════════════

def load_existing_video_ids() -> set[str]:
    """Return set of video_ids already in tiktok_results.csv."""
    if not RESULTS_CSV.exists():
        return set()
    with open(RESULTS_CSV, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        return {row["video_id"] for row in reader if row.get("video_id")}


def append_rows(rows: list[dict]) -> int:
    """Append rows to tiktok_results.csv. Creates file + header if needed."""
    if not rows:
        return 0
    write_header = not RESULTS_CSV.exists() or RESULTS_CSV.stat().st_size == 0
    with open(RESULTS_CSV, "a", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=RESULT_FIELDS, extrasaction="ignore")
        if write_header:
            w.writeheader()
        w.writerows(rows)
    return len(rows)


# ══════════════════════════════════════════════════════════════════════════════
# Account scraping
# ══════════════════════════════════════════════════════════════════════════════

def scrape_account(session: requests.Session, static: dict,
                   ms_token: str, existing_ids: set[str]) -> list[dict]:
    """
    Scrape one TikTok account.
    Returns list of new CSV rows (skips already-seen video_ids).
    """
    username = static["username"]
    run_at   = now_iso()
    log.info(f"Scraping @{username} …")

    # ── 1. Profile ──────────────────────────────────────────────────────────
    profile_raw = fetch_profile(session, username, ms_token)

    if not profile_raw:
        log.warning(f"  @{username}: profile fetch failed — writing stub row")
        stub = {f: "" for f in RESULT_FIELDS}
        stub.update({"run_at": run_at, "username": username, **static})
        return [stub]

    user  = profile_raw.get("user",  {})
    stats = profile_raw.get("stats", {})

    sec_uid         = user.get("secUid", "")
    tiktok_id       = user.get("id", "")
    display_name    = user.get("nickname", username)
    bio             = (user.get("signature") or "").replace("\n", " ")[:200]
    verified        = user.get("verified", False)
    private         = user.get("privateAccount", False)
    region_live     = user.get("region", "")
    language        = user.get("language", "")
    avatar_url      = user.get("avatarLarger") or user.get("avatarMedium", "")
    follower_count  = stats.get("followerCount")
    following_count = stats.get("followingCount")
    total_likes     = stats.get("heartCount") or stats.get("heart")
    total_videos    = stats.get("videoCount")

    log.info(f"  @{username}: {follower_count:,} followers | {total_videos} videos")

    # ── 2. Videos ────────────────────────────────────────────────────────────
    items = fetch_videos(session, sec_uid, ms_token, count=20) if sec_uid else []
    log.info(f"  @{username}: {len(items)} videos fetched")

    # Compute account-level engagement from the fetched sample
    views_list    = [v.get("stats", {}).get("playCount")    for v in items]
    likes_list    = [v.get("stats", {}).get("diggCount")    for v in items]
    comments_list = [v.get("stats", {}).get("commentCount") for v in items]
    shares_list   = [v.get("stats", {}).get("shareCount")   for v in items]

    avg_v = safe_avg(views_list)
    avg_l = safe_avg(likes_list)
    avg_c = safe_avg(comments_list)
    avg_s = safe_avg(shares_list)

    total_interactions = sum(
        (l or 0) + (c or 0) + (s or 0)
        for l, c, s in zip(likes_list, comments_list, shares_list)
    )
    total_views = sum(v or 0 for v in views_list)
    eng_rate    = safe_pct(total_interactions, total_views)
    vpw         = videos_per_week(items)
    top_tags    = top_hashtags(items)

    timestamps = sorted(
        [int(v["createTime"]) for v in items if v.get("createTime")], reverse=True
    )
    latest_date = ts_to_iso(timestamps[0]) if timestamps else None

    scraped_at = now_iso()

    # ── 3. Build one row per video (account fields repeated) ─────────────────
    base = {
        "run_at":              run_at,
        "username":            username,
        "niche":               static.get("niche", ""),
        "content_type":        static.get("content_type", ""),
        "priority":            static.get("priority", ""),
        "status":              static.get("status", "active"),
        "region_manual":       static.get("region", ""),
        "notes":               static.get("notes", ""),
        "added_at":            static.get("added_at", ""),
        "tiktok_id":           tiktok_id,
        "display_name":        display_name,
        "bio":                 bio,
        "verified":            verified,
        "private":             private,
        "region_live":         region_live,
        "language":            language,
        "avatar_url":          avatar_url,
        "profile_url":         f"https://www.tiktok.com/@{username}",
        "follower_count":      follower_count,
        "following_count":     following_count,
        "total_likes_account": total_likes,
        "total_videos_account":total_videos,
        "sample_size":         len(items),
        "avg_views":           avg_v,
        "avg_likes":           avg_l,
        "avg_comments":        avg_c,
        "avg_shares":          avg_s,
        "engagement_rate_pct": eng_rate,
        "videos_per_week":     vpw,
        "top_hashtags":        top_tags,
        "latest_video_date":   latest_date,
    }

    rows = []
    for v in items:
        vid_id = "tt" + v.get("id", "")
        if vid_id in existing_ids:
            continue  # skip already-recorded videos

        vstats = v.get("stats", {})
        htags  = [ht.get("title", "").lower() for ht in (v.get("challenges") or [])]

        row = dict(base)
        row.update({
            "video_id":          vid_id,
            "video_title":       (v.get("desc") or "(no caption)")[:120],
            "video_url":         f"https://www.tiktok.com/@{username}/video/{v.get('id')}",
            "video_thumbnail":   (v.get("video") or {}).get("cover", ""),
            "video_duration_sec":(v.get("video") or {}).get("duration", ""),
            "video_views":       vstats.get("playCount"),
            "video_likes":       vstats.get("diggCount"),
            "video_comments":    vstats.get("commentCount"),
            "video_shares":      vstats.get("shareCount"),
            "video_hashtags":    "|".join(htags),
            "video_hashtag_1":   htags[0] if len(htags) > 0 else "",
            "video_hashtag_2":   htags[1] if len(htags) > 1 else "",
            "video_hashtag_3":   htags[2] if len(htags) > 2 else "",
            "video_created_at":  ts_to_iso(v.get("createTime")),
            "video_scraped_at":  scraped_at,
        })
        rows.append(row)
        existing_ids.add(vid_id)  # prevent duplicates within same run

    if not rows and items:
        log.info(f"  @{username}: all {len(items)} videos already recorded — nothing new")

    return rows


# ══════════════════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════════════════

def load_accounts() -> list[dict]:
    if not ACCOUNTS_CSV.exists():
        log.error(f"tiktok_accounts.csv not found at {ACCOUNTS_CSV}")
        sys.exit(1)
    with open(ACCOUNTS_CSV, encoding="utf-8", newline="") as f:
        return [row for row in csv.DictReader(f) if row.get("username", "").strip()]


def main() -> None:
    log.info("=" * 60)
    log.info("TikTok Tracker — run started")
    log.info("=" * 60)

    cookies  = load_cookies()
    accounts = load_accounts()
    log.info(f"Accounts to scrape: {[a['username'] for a in accounts]}")

    ms_token = cookies.get("msToken", "")
    session  = make_session(cookies)

    existing_ids = load_existing_video_ids()
    log.info(f"Existing video IDs in CSV: {len(existing_ids)}")

    total_new = 0
    for account in accounts:
        try:
            rows    = scrape_account(session, account, ms_token, existing_ids)
            written = append_rows(rows)
            total_new += written
            log.info(f"  @{account['username']}: {written} new rows written")
        except Exception as e:
            log.error(f"  @{account['username']} FAILED: {e}", exc_info=True)
        time.sleep(2)  # polite delay between accounts

    log.info(f"Run complete — {total_new} new rows appended to {RESULTS_CSV.name}")
    log.info("")


if __name__ == "__main__":
    main()

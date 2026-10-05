# TikTok Radar (Local Tracker)

Automated TikTok account intelligence pipeline running **locally on your Windows machine**.
Monitors a watchlist of TikTok accounts, collects profile stats and video performance data,
and appends new video rows to a single structured CSV on every run.

No GitHub Actions needed. Runs directly on your PC via Windows Task Scheduler.

---

## How It Works

```
tiktok_accounts.csv          ← your watchlist (edit to add/remove accounts)
        │
        ▼
tiktok_tracker.py            ← Python script: fetches profile + videos using your cookies
        │
        └── tiktok_results.csv  ← ONE unified output database (appends new rows only)
```

You can schedule this to run via Windows Task Scheduler or run it manually.

---

## Setup (One Time)

### 1. Install Dependencies
Make sure you have Python installed. Then run:
```bash
pip install -r requirements.txt
```

### 2. Setup your Cookies
1. Open `cookies.json.example`, rename it to `cookies.json`.
2. Open [tiktok.com](https://www.tiktok.com) in your browser and log in.
3. Open DevTools (`F12`) → **Application** tab → **Cookies** → `https://www.tiktok.com`.
4. Copy the values of the following cookies and paste them into your `cookies.json` file:
   - `sid_tt` (required for real data)
   - `msToken`
   - `ttwid`
   - `tt_chain_token` (optional but helpful)

### 3. Edit your watchlist
Open `tiktok_accounts.csv` and add the accounts you want to monitor.
Each row needs at minimum a `username`.

### 4. Test run
Double click `run_tracker.bat` to run the script manually and verify that it scrapes correctly. Check the `tiktok_tracker.log` if there are any issues.

---

## Automating with Windows Task Scheduler

To make this run automatically in the background (e.g. every day):

1. Open **Task Scheduler** in Windows.
2. Click **Create Basic Task...** on the right side.
3. Name it "TikTok Radar" and choose a trigger (e.g., Daily).
4. For Action, choose **Start a program**.
5. Browse and select the `run_tracker.bat` file in this folder.
6. **Important**: In the "Start in (optional)" field, put the full folder path where `run_tracker.bat` is located (e.g. `C:\Users\dev-5\Downloads\radar_2`).
7. Finish the setup. It will now run automatically.

---

## Output: `tiktok_results.csv`

The script appends new rows for any newly found videos, skipping duplicates.

### Key Account columns
| Column | Source | Description |
|---|---|---|
| `username` | static | TikTok handle (no @) |
| `niche`, `priority`, etc. | static | Data from your watchlist |
| `follower_count`, `avg_views`, `engagement_rate_pct` | live/computed | Stats calculated per account at the time of scraping |

### Video columns
| Column | Description |
|---|---|
| `video_id` | Unique ID (`tt` + TikTok video ID) |
| `video_views`, `video_likes`, `video_comments` | Video stats at the time of scraping |
| `video_url` | Direct link |

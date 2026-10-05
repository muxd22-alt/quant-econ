# 🇸🇦 Saudi Autonomous Economy Tracker

*(TRACK_SAUDI)*

This repository hosts an automated AI-driven dashboard that tracks daily news to evaluate Saudi Arabia's progress toward the goals modeled in the **[UHI_SAUDI (Autonomous Economy Simulator)](../UHI_SAUDI)** project.

The dashboard natively fetches RSS news focused on AI, Saudi PIF, Universal Basic Income, and extreme deflationary technology. It then processes these signals through OpenRouter using the `qwen/qwen3.6-plus-preview:free` LLM to gauge if the nation is trending **NEAR** or **FAR** from an autonomous economic state.

## ⚙️ Architecture

1. **GitHub Actions**: A cron job (`.github/workflows/daily_update.yml`) runs daily at 4:00 AM UTC.
2. **Python Script**: `scripts/fetch_news_insights.py` compiles news from global Google RSS feeds and prompts Qwen to evaluate and score the momentum across 4 distinct pillars (AI Automation, PIF Growth, UBI Steps, Deflationary Effects).
3. **Data Storage**: The findings are committed directly back to `docs/tracker_data.json`.
4. **Dashboard View**: A premium, pure HTML/CSS frontend (`docs/index.html`) automatically renders the latest UI locally or on GitHub Pages.

## 🚀 Setup & Deployment

To deploy this yourself:

1. **Fork or copy** this repository.
2. Ensure GitHub Pages is enabled and pointing to the `/docs` folder (`Settings > Pages > Source branch > docs folder`).
3. Add your OpenRouter API key to your GitHub repository secrets:
   - Go to `Settings > Secrets and variables > Actions`
   - Create a New repository secret named `OPENROUTER_API_KEY`.
4. Manually trigger the "Daily Autonomous Economy Tracker" action in the **Actions** tab to generate the initial `tracker_data.json`.

## 📊 The Four Pillars Tracked

- 🤖 **AI & Automation Substation**: Tracks the acceleration of AI replacing traditional labor and driving extreme productivity.
- 💰 **PIF Sovereign Wealth Growth**: Monitors the Sovereign Fund transitioning from tax revenues to capital return pipelines.
- 🫂 **UBI / Citizens Account**: Identifies policy shifts converting welfare into universal fixed-income stipends.
- 📉 **Deflationary Tech Effects**: Captures news of AI collapsing the marginal costs of transport, medicine, energy, and knowledge.

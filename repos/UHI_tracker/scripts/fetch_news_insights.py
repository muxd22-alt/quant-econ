import os
import json
import requests
import feedparser
from datetime import datetime

# CONFIGURATION
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "qwen/qwen3.6-plus-preview:free")
TRACKER_FILE = "docs/tracker_data.json"

# Top news sources via Google RSS
RSS_FEEDS = [
    "https://news.google.com/rss/search?q=Saudi+Arabia+Artificial+Intelligence+OR+Robotics+OR+Automation&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=Saudi+Arabia+PIF+OR+Economy+OR+Investment&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=Saudi+Arabia+Citizens+Account+OR+Basic+Income+OR+Social+Welfare&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=Energy+Transition+AI+OR+Deflation+Saudi&hl=en-US&gl=US&ceid=US:en"
]

def fetch_recent_news():
    news_items = []
    print("Fetching news from RSS feeds...")
    for url in RSS_FEEDS:
        feed = feedparser.parse(url)
        # Take the top 3 items per category
        for entry in feed.entries[:3]:
            # Some Google News properties
            news_items.append({
                "title": entry.title,
                "link": entry.link,
                "published": getattr(entry, "published", "")
            })
    return news_items

def analyze_news_with_llm(news_items):
    if not OPENROUTER_API_KEY:
        print("Warning: OPENROUTER_API_KEY is not set. Skipping AI analysis.")
        return None

    print(f"Calling OpenRouter with model: {MODEL_NAME}")
    
    # Create the prompt 
    prompt = """
    You are the central AI analyst for the Saudi Autonomous Economy Simulator (UHI_SAUDI).
    The UHI_SAUDI framework tracks the nation's transition along 4 pillars:
    1. ai_automation: Replacing traditional labor with AI.
    2. pif_growth: Growing the Sovereign Wealth Fund to replace purely tax-based revenue.
    3. ubi_steps: Moving the Citizens Account towards a Universal Basic Income.
    4. deflationary_effects: AI driving down the costs of energy, transport, and goods.

    I will provide you with today's headlines.
    Your task:
    1. Score today's progress toward the Autonomous Economy (0-100).
    2. Decide if the overall sentiment places the goals "NEAR" (on track/accelerating) or "FAR" (stalling/deviating).
    3. Give a 1-10 score, a trend (up, down, stable) and a 1-sentence insight for each of the 4 pillars.
    4. Pick the top 2-3 most relevant news headlines from the provided list, write a short summary of how it impacts the UHI goals. Give exact title string so I can match it to the link.

    Input News:
    """
    for i, item in enumerate(news_items):
        prompt += f"{i+1}. Title: {item['title']}\n"

    prompt += """
    Output MUST be ONLY valid JSON matching this structure perfectly. Do NOT include markdown blocks, just the raw JSON object starting with '{'.
    {
      "overall_status": "NEAR" | "FAR",
      "progress_score_pct": 82,
      "metrics": {
        "ai_automation": { "score": 8, "trend": "up", "insight": "..." },
        "pif_growth": { "score": 7, "trend": "stable", "insight": "..." },
        "ubi_steps": { "score": 5, "trend": "stable", "insight": "..." },
        "deflationary_effects": { "score": 6, "trend": "up", "insight": "..." }
      },
      "latest_news": [
        { "title": "Exact Title From Input", "summary": "Your analysis...", "relevance_score": 9 }
      ]
    }
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
        response.raise_for_status()
        content = response.json()
        print("API Response successful.")
        
        reply_text = content['choices'][0]['message']['content'].strip()
        
        # Clean markdown
        if reply_text.startswith("```json"):
            reply_text = reply_text[7:]
        if reply_text.endswith("```"):
            reply_text = reply_text[:-3]
            
        return json.loads(reply_text.strip())
    except Exception as e:
        print(f"Error calling OpenRouter or parsing JSON: {e}")
        if 'content' in locals():
            print(content)
        return None

def main():
    news_items = fetch_recent_news()
    if not news_items:
        print("Failed to fetch news or no news available.")
        return

    analysis_data = analyze_news_with_llm(news_items)
    
    if analysis_data:
        # Match links
        for an in analysis_data.get("latest_news", []):
            an["link"] = "#"
            for rn in news_items:
                # Find partial match in case the LLM truncated it
                if rn["title"][:20].lower() in an["title"].lower() or an["title"].lower() in rn["title"].lower():
                    an["link"] = rn["link"]
                    break
        
        # Read existing file or create basic structure
        try:
            with open(TRACKER_FILE, 'r', encoding='utf-8') as f:
                current_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            current_data = {}

        current_data.update(analysis_data)
        current_data["last_updated"] = datetime.utcnow().isoformat() + "Z"

        # Ensure directory exists just in case
        os.makedirs(os.path.dirname(TRACKER_FILE), exist_ok=True)
        
        with open(TRACKER_FILE, 'w', encoding='utf-8') as f:
            json.dump(current_data, f, indent=4, ensure_ascii=False)
            
        print("Successfully updated tracker_data.json")
    else:
        print("Failed to generate AI analysis.")

if __name__ == "__main__":
    main()

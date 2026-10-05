#!/usr/bin/env python3
"""
TASI Alpha Cell Data Fetcher

Fetches market data from Yahoo Finance and AI news from NewsAPI.
Outputs data.json to the docs folder for the dashboard.

Usage:
    python scripts/fetch_data.py
    
Environment Variables:
    OPENROUTER_API_KEY: OpenRouter API key (optional, skips news if not set)
"""

import json
import logging
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import yfinance as yf
import requests
import feedparser

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Constants
TASI_SYMBOL = "^TASI.SR"
QQQ_SYMBOL = "QQQ"
OIL_SYMBOL = "BZ=F"  # Brent Crude Oil
DATA_PERIOD = "1mo"
NEWS_DAYS = 7
MAX_NEWS_ARTICLES = 20
NEWS_QUERIES = [
    "Saudi AI",
    "Universal High Income",
    "NVIDIA",
    "artificial intelligence Saudi Arabia",
    "AI investment Middle East",
    "PIF AI",
    "NEOM AI"
]
REQUEST_TIMEOUT = 15
MAX_RETRIES = 3


class DataFetchError(Exception):
    """Custom exception for data fetching errors."""
    pass


def fetch_market_data(symbol: str, period: str = DATA_PERIOD) -> dict:
    """
    Fetch market data for a given symbol from Yahoo Finance.
    
    Args:
        symbol: The ticker symbol (e.g., "^TASI", "QQQ")
        period: Time period for historical data
        
    Returns:
        Dictionary with OHLCV data
        
    Raises:
        DataFetchError: If no data is received
    """
    logger.info(f"Fetching {symbol} data...")
    
    for attempt in range(MAX_RETRIES):
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            if hist.empty:
                raise DataFetchError(f"No data received for {symbol}")
            
            # Validate required columns
            required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
            missing_cols = [col for col in required_cols if col not in hist.columns]
            if missing_cols:
                raise DataFetchError(f"Missing columns for {symbol}: {missing_cols}")
            
            result = {
                "index": [d.strftime("%Y-%m-%d") for d in hist.index],
                "open": hist["Open"].tolist(),
                "high": hist["High"].tolist(),
                "low": hist["Low"].tolist(),
                "close": hist["Close"].tolist(),
                "volume": hist["Volume"].tolist()
            }
            
            logger.info(f"  [OK] {symbol}: {len(result['close'])} data points, latest close: {result['close'][-1]:.2f}")
            return result
            
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {symbol}: {e}")
            if attempt == MAX_RETRIES - 1:
                raise DataFetchError(f"Failed to fetch {symbol} after {MAX_RETRIES} attempts: {e}")
    
    # Should never reach here
    raise DataFetchError(f"Unexpected error fetching {symbol}")


def fetch_ai_news(api_key: str, days: int = NEWS_DAYS) -> dict:
    """
    Fetch AI-related news via RSS and synthesize sentiment via OpenRouter API.
    
    Args:
        api_key: OpenRouter API key
        days: Number of days to look back
        
    Returns:
        Dictionary with articles and ai_analysis
    """
    if not api_key:
        logger.info("OPENROUTER_API_KEY not set, skipping news fetch")
        return {"articles": [], "ai_analysis": {}}
    
    logger.info("Fetching AI news via RSS...")
    all_articles = []
    
    query_str = '%22Saudi+AI%22+OR+%22PIF+AI%22+OR+%22NEOM+AI%22'
    rss_url = f"https://news.google.com/rss/search?q={query_str}+when:{days}d&hl=en-US&gl=US&ceid=US:en"
    
    try:
        feed = feedparser.parse(rss_url)
        for entry in feed.entries[:MAX_NEWS_ARTICLES]:
            all_articles.append({
                "title": entry.title,
                "url": entry.link,
                "publishedAt": entry.published if hasattr(entry, 'published') else "",
                "source": entry.source.title if hasattr(entry, 'source') else "Google News"
            })
    except Exception as e:
        logger.warning(f"Error fetching RSS: {e}")

    logger.info(f"Fetched {len(all_articles)} articles. Generating AI summary...")
    
    ai_analysis = {
        "summary": "AI summary not generated.",
        "sentiment": "Neutral"
    }
    
    if all_articles:
        titles = "\n".join([f"- {a['title']}" for a in all_articles])
        prompt = f"Based on the following recent news headlines about Saudi AI and tech investments, provide a brief 2-3 sentence summary of the current sentiment and identify if the sentiment is Bullish, Bearish, or Neutral. Output exactly two lines:\nSentiment: [Bullish/Bearish/Neutral]\nSummary: [Summary]\n\nHeadlines:\n{titles}"
        
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "qwen/qwen3.6-plus-preview:free",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 150
            }
            res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data, timeout=30)
            if res.status_code == 200:
                content = res.json()['choices'][0]['message']['content']
                lines = content.strip().split('\n')
                sentiment = "Neutral"
                summary = content
                for line in lines:
                    line = line.strip()
                    if line.lower().startswith("sentiment:"):
                        sentiment = line.split(":", 1)[1].strip()
                    elif line.lower().startswith("summary:"):
                        summary = line.split(":", 1)[1].strip()
                ai_analysis["summary"] = summary
                ai_analysis["sentiment"] = sentiment
                logger.info(f"  [OK] AI summary generated (Sentiment: {sentiment})")
            else:
                logger.warning(f"OpenRouter API error: {res.text}")
        except Exception as e:
            logger.error(f"Failed to generate AI summary: {e}")
            
    return {"articles": all_articles, "ai_analysis": ai_analysis}


def validate_data(tasi_data: dict, qqq_data: dict) -> None:
    """
    Validate fetched data for consistency.
    
    Raises:
        DataFetchError: If data validation fails
    """
    # Check minimum data points
    min_points = 5
    if len(tasi_data["close"]) < min_points:
        raise DataFetchError(f"TASI has insufficient data: {len(tasi_data['close'])} points")
    if len(qqq_data["close"]) < min_points:
        raise DataFetchError(f"QQQ has insufficient data: {len(qqq_data['close'])} points")
    
    # Check for NaN values
    import math
    for name, data in [("TASI", tasi_data), ("QQQ", qqq_data)]:
        if any(math.isnan(v) for v in data["close"]):
            raise DataFetchError(f"{name} data contains NaN values")
    
    # Check for negative prices
    for name, data in [("TASI", tasi_data), ("QQQ", qqq_data)]:
        if any(v < 0 for v in data["close"]):
            raise DataFetchError(f"{name} data contains negative prices")
    
    logger.info("Data validation passed")


def save_data(data: dict, output_path: Path) -> None:
    """
    Save data to JSON file with atomic write.
    
    Args:
        data: The data dictionary to save
        output_path: Path to output file
    """
    # Write to temp file first
    temp_path = output_path.with_suffix('.json.tmp')
    
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Atomic rename
        temp_path.replace(output_path)
        logger.info(f"[OK] Data saved to: {output_path}")
        
    except Exception as e:
        # Clean up temp file on error
        if temp_path.exists():
            temp_path.unlink()
        raise DataFetchError(f"Failed to save data: {e}")


def main() -> int:
    """
    Main function to fetch all data and save to JSON.
    
    Returns:
        Exit code (0 for success, 1 for error)
    """
    logger.info("=" * 60)
    logger.info("TASI Alpha Cell - Data Fetcher")
    logger.info("=" * 60)
    
    start_time = datetime.utcnow()
    
    try:
        # Get NewsAPI key from environment
        newsapi_key = os.environ.get("OPENROUTER_API_KEY", "")
        
        # Fetch market data
        tasi_data = fetch_market_data(TASI_SYMBOL)
        qqq_data = fetch_market_data(QQQ_SYMBOL)
        oil_data = fetch_market_data(OIL_SYMBOL)
        
        # Validate data
        validate_data(tasi_data, qqq_data)
        
        # Fetch news (skip if no API key)
        news_data = fetch_ai_news(newsapi_key)
        
        # Prepare output data
        output = {
            "timestamp": datetime.utcnow().isoformat(),
            "tasi": tasi_data,
            "qqq": qqq_data,
            "oil": oil_data,
            "news": news_data.get("articles", []),
            "ai_analysis": news_data.get("ai_analysis", {}),
            "metadata": {
                "fetched_at": datetime.utcnow().isoformat(),
                "fetch_duration_seconds": (datetime.utcnow() - start_time).total_seconds(),
                "openrouter_api_available": bool(newsapi_key),
                "news_count": len(news_data.get("articles", []))
            }
        }
        
        # Determine output path
        script_dir = Path(__file__).parent.parent
        docs_dir = script_dir / "docs"
        output_path = docs_dir / "data.json"
        
        # Ensure docs directory exists
        docs_dir.mkdir(exist_ok=True)
        
        # Save data
        save_data(output, output_path)
        
        # Summary
        logger.info("")
        logger.info("Summary:")
        logger.info(f"  - TASI latest close: {tasi_data['close'][-1]:.2f}")
        logger.info(f"  - QQQ latest close: {qqq_data['close'][-1]:.2f}")
        logger.info(f"  - Brent Oil latest close: {oil_data['close'][-1]:.2f}")
        logger.info(f"  - News articles: {len(news_data.get('articles', []))}")
        logger.info(f"  - Total duration: {output['metadata']['fetch_duration_seconds']:.2f}s")
        logger.info("=" * 60)
        
        return 0
        
    except DataFetchError as e:
        logger.error(f"Data fetch error: {e}")
        return 1
    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

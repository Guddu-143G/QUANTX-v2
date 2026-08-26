from fastapi import APIRouter
from typing import Optional
import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import datetime
import uuid

router = APIRouter(prefix="/api/v1/research", tags=["research"])
analyzer = SentimentIntensityAnalyzer()

# A curated list of prominent tickers to pull news from if no specific ticker is provided
DEFAULT_TICKERS = ["RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS", "ICICIBANK.NS"]

def get_sentiment(text: str):
    scores = analyzer.polarity_scores(text)
    compound = scores['compound']
    
    if compound >= 0.05:
        sentiment = "POSITIVE"
    elif compound <= -0.05:
        sentiment = "NEGATIVE"
    else:
        sentiment = "NEUTRAL"
        
    # Scale confidence to 0-100 based on magnitude of compound score (which is -1 to 1)
    confidence = int(abs(compound) * 100)
    # Give a base confidence for neutral or weak signals so it doesn't look like 0%
    if confidence < 40:
        confidence += 40
        
    return sentiment, confidence, round(compound * 0.2, 2) # Arbitrary impact scale for UI

@router.get("/news")
def get_news(ticker: Optional[str] = None):
    tickers_to_fetch = [f"{ticker}.NS"] if ticker else DEFAULT_TICKERS
    all_news = []
    
    for t in tickers_to_fetch:
        try:
            # yf.Ticker(t).news returns a list of dictionaries with news items
            tick = yf.Ticker(t)
            news_items = tick.news
            
            # Map Yahoo Finance news to our frontend NewsItem format
            for item in news_items:
                # Some items might not have all fields, safely get them
                headline = item.get('title', 'No Title')
                source = item.get('publisher', 'Yahoo Finance')
                
                # Convert unix timestamp to readable HH:MM if it's today, otherwise MM/DD
                ts = item.get('providerPublishTime', 0)
                dt = datetime.datetime.fromtimestamp(ts)
                time_str = dt.strftime("%H:%M")
                
                sentiment, confidence, impact = get_sentiment(headline)
                
                # Extract base ticker without .NS
                base_ticker = t.replace(".NS", "")
                
                all_news.append({
                    "id": str(uuid.uuid4())[:8],
                    "headline": headline,
                    "source": source,
                    "time": time_str,
                    "ticker": base_ticker,
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "impact": impact,
                    "category": "General", # Yahoo doesn't give a clean category
                    "timestamp": ts # For sorting
                })
        except Exception as e:
            print(f"Error fetching news for {t}: {e}")
            pass
            
    # Sort all news by timestamp descending (newest first)
    all_news.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    
    # Return top 20 items to avoid overwhelming the UI
    return {"status": "success", "data": all_news[:20]}

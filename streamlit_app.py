
# streamlit_app.py
import streamlit as st
import requests
import pandas as pd
from datetime import datetime
from statistics import mean

API_KEY = "NH1B5CVYEVOB6BV7"
BASE_URL = "https://www.alphavantage.co/query"

MAJOR_PAIRS = [
    ("USD", "EUR"), ("USD", "GBP"), ("USD", "JPY"), ("USD", "AUD"),
    ("EUR", "GBP"), ("EUR", "JPY"), ("EUR", "AUD"),
    ("GBP", "JPY"), ("GBP", "AUD"), ("AUD", "JPY")
]

# Indicator logic
def compute_indicators(prices: list[float]) -> dict:
    series = pd.Series(prices)
    sma5 = series.rolling(window=5).mean().iloc[-1]
    sma20 = series.rolling(window=20).mean().iloc[-1]
    
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(window=14).mean()
    loss = -delta.clip(upper=0).rolling(window=14).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs)).iloc[-1]

    exp1 = series.ewm(span=12, adjust=False).mean()
    exp2 = series.ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    macd_hist = (macd - signal).iloc[-1]

    return {
        "sma5": sma5,
        "sma20": sma20,
        "rsi": rsi,
        "macd_hist": macd_hist
    }

def get_historical_rates(base: str, quote: str) -> list[float]:
    url = f"{BASE_URL}?function=FX_DAILY&from_symbol={base}&to_symbol={quote}&apikey={API_KEY}&outputsize=compact"
    res = requests.get(url).json()
    time_series = res.get("Time Series FX (Daily)", {})
    rates = [float(v["4. close"]) for k, v in sorted(time_series.items())][-30:]
    return rates

def get_live_price(base: str, quote: str) -> float:
    url = f"{BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency={base}&to_currency={quote}&apikey={API_KEY}"
    res = requests.get(url).json()
    return float(res["Realtime Currency Exchange Rate"]["5. Exchange Rate"])

def analyze_pair(base: str, quote: str) -> dict:
    try:
        rates = get_historical_rates(base, quote)
        if len(rates) < 20:
            return None
        live = get_live_price(base, quote)
        indicators = compute_indicators(rates)
        action, confidence = "HOLD", 0.5

        # Strategy rules
        if indicators["rsi"] < 30 and indicators["macd_hist"] > 0 and indicators["sma5"] > indicators["sma20"]:
            action, confidence = "BUY", 0.9
        elif indicators["rsi"] > 70 and indicators["macd_hist"] < 0 and indicators["sma5"] < indicators["sma20"]:
            action, confidence = "SELL", 0.9

        return {
            "pair": f"{base}/{quote}",
            "action": action,
            "confidence": confidence,
            "price": live,
            "rsi": round(indicators["rsi"], 2),
            "macd_hist": round(indicators["macd_hist"], 4),
            "sma5": round(indicators["sma5"], 4),
            "sma20": round(indicators["sma20"], 4)
        }
    except:
        return None

# Streamlit UI
st.set_page_config(page_title="Forex Trade Scanner", page_icon="📈")
st.title("📈 Forex Trade Opportunity Scanner")
st.caption("Powered by Alpha Vantage & Technical Indicators")

if st.button("🔍 Scan Market"):
    with st.spinner("Scanning currency pairs..."):
        results = []
        for base, quote in MAJOR_PAIRS:
            data = analyze_pair(base, quote)
            if data:
                results.append(data)

        top_trades = sorted(results, key=lambda x: -x["confidence"])[:3]

        st.subheader("🔥 Top Trade Suggestions")
        if not top_trades:
            st.warning("No strong opportunities found.")
        for t in top_trades:
            st.markdown(
                f"""
                **{t['pair']}**
                - Action: **{t['action']}**
                - Confidence: `{t['confidence']}`
                - Price: `{t['price']:.4f}`
                - RSI: `{t['rsi']}` | MACD Hist: `{t['macd_hist']}`
                - SMA(5): `{t['sma5']}` | SMA(20): `{t['sma20']}`
                """
            )

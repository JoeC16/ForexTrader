
# streamlit_app.py
import streamlit as st
import requests
import pandas as pd
from datetime import datetime

API_KEY = "NH1B5CVYEVOB6BV7"
BASE_URL = "https://www.alphavantage.co/query"

PAIRS = [
    ("USD", "EUR"), ("USD", "GBP"), ("USD", "JPY"), ("USD", "AUD"),
    ("EUR", "USD"), ("GBP", "USD"), ("JPY", "USD"), ("AUD", "USD")
]

def fetch_rates(base: str, quote: str) -> list:
    url = f"{BASE_URL}?function=FX_DAILY&from_symbol={base}&to_symbol={quote}&apikey={API_KEY}&outputsize=compact"
    res = requests.get(url).json()
    series = res.get("Time Series FX (Daily)", {})
    prices = [float(v["4. close"]) for k, v in sorted(series.items())][-30:]
    if len(prices) < 20:
        raise ValueError("Not enough data")
    return prices

def fetch_live(base: str, quote: str) -> float:
    url = f"{BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency={base}&to_currency={quote}&apikey={API_KEY}"
    res = requests.get(url).json()
    return float(res["Realtime Currency Exchange Rate"]["5. Exchange Rate"])

def compute_indicators(prices: list[float]) -> dict:
    s = pd.Series(prices)
    sma5 = s.rolling(5).mean().iloc[-1]
    sma20 = s.rolling(20).mean().iloc[-1]
    delta = s.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = -delta.clip(upper=0).rolling(14).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs)).iloc[-1]
    macd = s.ewm(span=12, adjust=False).mean() - s.ewm(span=26, adjust=False).mean()
    signal = macd.ewm(span=9, adjust=False).mean()
    macd_hist = (macd - signal).iloc[-1]
    return {"sma5": sma5, "sma20": sma20, "rsi": rsi, "macd_hist": macd_hist}

def generate_trade(base: str, quote: str) -> dict:
    try:
        prices = fetch_rates(base, quote)
        live = fetch_live(base, quote)
        ind = compute_indicators(prices)
        entry = live
        action = reason = ""
        confidence = 1

        if ind["rsi"] < 30 and ind["macd_hist"] > 0 and ind["sma5"] > ind["sma20"]:
            action, confidence = "BUY", 5
            reason = "RSI oversold, MACD bullish, uptrend"
        elif ind["rsi"] > 70 and ind["macd_hist"] < 0 and ind["sma5"] < ind["sma20"]:
            action, confidence = "SELL", 5
            reason = "RSI overbought, MACD bearish, downtrend"
        elif ind["rsi"] < 40 and ind["macd_hist"] > 0:
            action, confidence = "BUY", 3
            reason = "MACD up, RSI low"
        elif ind["rsi"] > 60 and ind["macd_hist"] < 0:
            action, confidence = "SELL", 3
            reason = "MACD down, RSI high"
        else:
            action = "BUY" if ind["rsi"] < 50 else "SELL"
            confidence = 2
            reason = "Neutral fallback based on RSI"

        tp = entry * (1.015 if action == "BUY" else 0.985)
        sl = entry * (0.99 if action == "BUY" else 1.01)
        reward = abs(tp - entry)
        risk = abs(sl - entry)
        rr_ratio = round(reward / risk, 2) if risk else 0

        return {
            "pair": f"{base}/{quote}",
            "action": action,
            "entry": round(entry, 5),
            "tp": round(tp, 5),
            "sl": round(sl, 5),
            "confidence": confidence,
            "reason": reason,
            "reward_risk": rr_ratio
        }
    except:
        return None

# Streamlit UI
st.set_page_config(page_title="Forex Trade Scanner", page_icon="📡")
st.title("📡 Top 3 Forex Trade Setups (Clean)")
st.caption("Using only supported pairs via Alpha Vantage")

if st.button("🔍 Scan Market Now"):
    with st.spinner("Scanning USD-based major pairs..."):
        results = [generate_trade(b, q) for b, q in PAIRS]
        results = [r for r in results if r]
        top3 = sorted(results, key=lambda x: -x["confidence"])[:3]

        if not top3:
            st.error("No trades found. Please retry in 1 minute (API may be rate-limiting).")
        for t in top3:
            st.markdown(f"""
**{t['pair']}**  
- Action: **{t['action']}**
- Entry: `{t['entry']}`
- TP: `{t['tp']}`  | SL: `{t['sl']}`
- Confidence: `{t['confidence']} / 5`
- Reason: _{t['reason']}_
- Reward/Risk: `{t['reward_risk']}`
""")

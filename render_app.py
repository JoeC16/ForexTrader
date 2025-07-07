import pandas as pd
import yfinance as yf
from datetime import timedelta
from flask import Flask, request, jsonify, send_file
import os
import io

app = Flask(__name__)

@app.route("/")
def home():
    return "📈 Congress Trade Price Enricher is running!"

@app.route("/enrich", methods=["POST"])
def enrich_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    df = pd.read_csv(file)
    df.columns = df.columns.str.lower()
    df['filed'] = pd.to_datetime(df['filed'], errors='coerce')
    df_clean = df.dropna(subset=['filed'])
    ticker_dates = df_clean[['ticker', 'filed']].drop_duplicates()

    def fetch_prices(ticker, filed_date):
        try:
            start = filed_date
            end = filed_date + timedelta(days=130)
            data = yf.download(ticker, start=start, end=end, progress=False)
            if data.empty or "Adj Close" not in data.columns:
                return [None] * 5
            results = []
            for offset in [0, 30, 60, 90, 120]:
                date = filed_date + timedelta(days=offset)
                price = data.loc[data.index >= date, 'Adj Close'].head(1)
                results.append(price.iloc[0] if not price.empty else None)
            return results
        except:
            return [None] * 5

    ticker_dates[['filed_price', 'd30', 'd60', 'd90', 'd120']] = ticker_dates.apply(
        lambda row: fetch_prices(row['ticker'], row['filed']), axis=1, result_type='expand'
    )

    df_final = df.merge(ticker_dates, on=['ticker', 'filed'], how='left')

    output = io.BytesIO()
    df_final.to_csv(output, index=False)
    output.seek(0)

    return send_file(output, mimetype='text/csv', as_attachment=True, download_name='enriched_trades.csv')

if __name__ == "__main__":
    app.run(debug=False)

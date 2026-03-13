// Vercel serverless function — proxies CoinMarketCap API to avoid CORS issues
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-cmc-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const cmcKey = req.headers['x-cmc-key'];
  if (!cmcKey) return res.status(400).json({ error: 'Missing CoinMarketCap API key' });

  const symbols = [
    'BTC','ETH','ADA','XRP','LTC','EOS','ZEC','BAT','DOT','CRV',
    'XLM','SOL','DGB','IQ','ETC','TRX','XMR','LINK','ENS','PAXG',
    'THETA','FIL','USDT','USDC','SHIB','MANA','GALA','SAND','STX',
    'FET','XTZ','OMG','ZRX','NEO','VET','FLR','ICP','SUPER','ICX',
    'XNO','DENT','SXP','TRUMP','MELANIA','AMPL','UTK','QTUM','KCS',
    'WAN','REEF','FTT','KDA','ALGO','BTG',
  ].join(',');

  try {
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': cmcKey,
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.status?.error_code !== 0) {
      return res.status(400).json({ error: data.status?.error_message || 'CMC API error' });
    }

    const prices = {};
    for (const [sym, info] of Object.entries(data.data)) {
      prices[sym] = info.quote.USD.price;
    }

    // Cache response for 60 seconds on Vercel's edge
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(prices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Vercel serverless function — proxies CoinMarketCap API to avoid CORS issues
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-cmc-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const cmcKey = process.env.CMC_API_KEY;
  if (!cmcKey) return res.status(500).json({ error: 'CMC API key not configured on server' });

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
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
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
    const changes = {};
    const market = {}; // per-coin market data

    for (const [sym, entries] of Object.entries(data.data)) {
      // v2 returns an array per symbol; pick the first (highest rank)
      const info = Array.isArray(entries) ? entries[0] : entries;
      if (!info) continue;
      const q = info.quote?.USD;
      if (!q) continue;

      prices[sym] = q.price;
      changes[sym] = q.percent_change_24h ?? 0;
      market[sym] = {
        price:              q.price,
        marketCap:          q.market_cap          ?? null,
        marketCapChange24h: q.market_cap_dominance ?? null, // dominance %, not change
        volume24h:          q.volume_24h           ?? null,
        high24h:            q.high_24h             ?? null,
        low24h:             q.low_24h              ?? null,
        change24h:          q.percent_change_24h   ?? 0,
        change7d:           q.percent_change_7d    ?? null,
        circulatingSupply:  info.circulating_supply ?? null,
        maxSupply:          info.max_supply         ?? null,
        rank:               info.cmc_rank           ?? null,
      };
    }

    // Cache response for 60 seconds on Vercel's edge
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({ prices, changes, market });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

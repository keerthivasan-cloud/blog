import axios from 'axios';

const SYMBOLS = 'IXIC,BTC/USD,XAU/USD,NIFTY,SENSEX';
const CACHE_KEY = 'nexus_market_data_v2';
const STALE_KEY = 'nexus_market_data_stale';
const CACHE_EXPIRY = 300000; // 5 minute cache to protect API limits

export const fetchMarketData = async (apiKey) => {
  if (!apiKey) {
    console.warn("Nexus Market Engine: API Key missing. Running in Simulation Mode.");
    return getSimulatedData();
  }

  try {
    // 1. Check Primary Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }

    // 2. Refresh from API
    console.log("[Market Engine] Requesting fresh financial intelligence from TwelveData...");
    const response = await axios.get(`https://api.twelvedata.com/quote?symbol=${SYMBOLS}&apikey=${apiKey}`);
    
    // Detect Rate Limits (429 is often returned as 200 with status: "error" in TwelveData)
    if (response.data && response.data.status !== "error") {
      const formattedData = formatMarketData(response.data);
      const cacheEntry = { data: formattedData, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
      localStorage.setItem(STALE_KEY, JSON.stringify(cacheEntry)); // Persistent anchor
      return formattedData;
    } else {
      const isRateLimit = response.data?.code === 429 || response.data?.message?.includes('limit');
      console.warn(
        `[Market Engine] ${isRateLimit ? 'API Throttled' : 'API Failure'}. ` +
        `Reverting to Stale Intelligence...`
      );
      return getStaleOrSimulated();
    }
  } catch (error) {
    console.error("[Market Engine] Financial Synchronization Critical Failure:", error.message);
    return getStaleOrSimulated();
  }
};

const getStaleOrSimulated = () => {
  const stale = localStorage.getItem(STALE_KEY);
  if (stale) {
    const { data } = JSON.parse(stale);
    // Apply slight "drift" to the stale data to keep it feeling alive
    return data.map(item => ({
      ...item,
      price: applyFluctuation(item.price),
      isStale: true
    }));
  }
  return getSimulatedData();
};

const applyFluctuation = (priceStr) => {
  const val = parseFloat(priceStr.replace(/,/g, ''));
  const drift = (Math.random() - 0.5) * 0.0002; // ±0.01% drift
  const newVal = val * (1 + drift);
  return newVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
};

const formatMarketData = (raw) => {
  const dataArray = Array.isArray(raw) ? raw : [raw];
  return dataArray.map(item => {
    const price = parseFloat(item.close || item.price || 0);
    const change = parseFloat(item.percent_change || 0);
    return {
      name: item.symbol === 'IXIC' ? 'NASDAQ' : item.symbol,
      price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: change.toFixed(2),
      isUp: change >= 0
    };
  });
};

const getSimulatedData = () => {
  // Base values for simulation if no cache exists
  const bases = [
    { name: 'NASDAQ', price: 16274.96 },
    { name: 'BTC/USD', price: 64120.45 },
    { name: 'XAU/USD', price: 2345.20 },
    { name: 'NIFTY', price: 22462.00 },
    { name: 'SENSEX', price: 74120.45 },
  ];

  return bases.map(b => {
    const fluctuation = (Math.random() - 0.5) * 20; // Random movement 
    const price = (b.price + fluctuation);
    const isUp = fluctuation >= 0;
    return {
      name: b.name,
      price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: (Math.random() * 2 * (isUp ? 1 : -1)).toFixed(2),
      isUp,
      isSimulated: true
    };
  });
};

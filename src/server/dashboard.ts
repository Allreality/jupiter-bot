import express from 'express';
import cors from 'cors';
import { RaydiumClient, RAYDIUM_TOKENS } from '../raydium/client';
import { PORTS } from '../config/ports';
import { calculateRSI, calculateMACD, generateTradingSignal, PriceData } from '../utils/technicalIndicators';

const app = express();
const raydiumClient = new RaydiumClient();
const priceHistory: PriceData[] = [];
let lastPrice = 0;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Raydium Dashboard API' });
});

app.get('/api/quote/:from/:to/:amount', async (req, res) => {
  try {
    const { from, to, amount } = req.params;
    const quote = await raydiumClient.getQuote(from, to, parseFloat(amount));
    
    priceHistory.push({ timestamp: Date.now(), price: quote.price });
    if (priceHistory.length > 200) priceHistory.shift();
    
    const priceChange = lastPrice > 0 ? ((quote.price - lastPrice) / lastPrice) * 100 : 0;
    lastPrice = quote.price;
    
    const prices = priceHistory.map(p => p.price);
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const signal = generateTradingSignal(rsi, macd);
    
    res.json({ 
      ...quote, 
      priceChange,
      indicators: { rsi, macd, signal },
      dataPoints: priceHistory.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/indicators', (req, res) => {
  const prices = priceHistory.map(p => p.price);
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const signal = generateTradingSignal(rsi, macd);
  res.json({ rsi, macd, signal });
});

app.get('/api/history/:from/:to', (req, res) => {
  res.json(priceHistory);
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Raydium Dashboard API',
    endpoints: [
      '/health',
      '/api/quote/:from/:to/:amount',
      '/api/indicators',
      '/api/history/:from/:to'
    ]
  });
});

const PORT = PORTS.DASHBOARD;

app.listen(PORT, () => {
  console.log(`🌊 Raydium Dashboard API running on http://localhost:${PORT}`);
});

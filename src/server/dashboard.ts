import express from 'express';
import cors from 'cors';
import path from 'path';
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
  res.json({ status: 'ok', service: 'Raydium Dashboard with Technical Indicators' });
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
      indicators: { rsi, macd, signal }
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

app.get('/', (req, res) => {
  res.send(`
    <h1>Raydium Dashboard with Technical Indicators</h1>
    <p>Test the API:</p>
    <ul>
      <li><a href="/api/quote/${RAYDIUM_TOKENS.SOL}/${RAYDIUM_TOKENS.USDC}/0.1">Get Quote with Indicators</a></li>
      <li><a href="/api/indicators">Get Current Indicators</a></li>
    </ul>
  `);
});

const PORT = PORTS.DASHBOARD;

app.listen(PORT, () => {
  console.log(`🌊 Raydium Dashboard with Technical Indicators running on http://localhost:${PORT}`);
  console.log(`📊 Features: RSI, MACD, AI Trading Signals`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/quote/${RAYDIUM_TOKENS.SOL}/${RAYDIUM_TOKENS.USDC}/0.1`);
});
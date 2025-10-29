import express from 'express';
import cors from 'cors';
import { PORTS } from '../config/ports';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Trading Bot API',
    version: '1.0.0',
    features: ['Paper Trading', 'Live Trading', 'Portfolio Management']
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    trading: {
      mode: 'PAPER',
      active: true,
      totalTrades: 0,
      profitLoss: 0
    },
    wallet: {
      connected: true,
      balance: 0
    }
  });
});

app.post('/api/trade', (req, res) => {
  const { action, pair, amount } = req.body;
  res.json({
    success: true,
    tradeId: Date.now().toString(),
    message: `${action} order placed for ${amount} ${pair}`
  });
});

const PORT = PORTS.TRADING_BOT;

app.listen(PORT, () => {
  console.log(`🤖 Trading Bot API running on http://localhost:${PORT}`);
});

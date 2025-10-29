import express from 'express';
import cors from 'cors';
import { PORTS } from '../config/ports';

const app = express();

app.use(cors());
app.use(express.json());

// Payment tracking
const payments: any[] = [];
let totalRevenue = 0;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'x402 Payment Server',
    version: '1.0.0'
  });
});

app.get('/api/revenue', (req, res) => {
  res.json({
    total: totalRevenue,
    payments: payments.length,
    recentPayments: payments.slice(-10)
  });
});

app.post('/api/payment', (req, res) => {
  const payment = {
    id: Date.now().toString(),
    amount: req.body.amount || 0,
    agent: req.body.agent || 'unknown',
    timestamp: new Date().toISOString()
  };
  
  payments.push(payment);
  totalRevenue += payment.amount;
  
  res.status(402).json({
    required: true,
    amount: payment.amount,
    paymentId: payment.id
  });
});

app.get('/api/agents/revenue', (req, res) => {
  const agentRevenue: any = {};
  
  payments.forEach(p => {
    if (!agentRevenue[p.agent]) {
      agentRevenue[p.agent] = 0;
    }
    agentRevenue[p.agent] += p.amount;
  });
  
  res.json(agentRevenue);
});

const PORT = PORTS.X402_SERVER;

app.listen(PORT, () => {
  console.log(`💰 x402 Payment Server running on http://localhost:${PORT}`);
});

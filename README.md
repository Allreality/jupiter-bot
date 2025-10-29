# Jupiter Trading Bot

Jupiter DEX aggregator trading bot for Solana with **x402 autonomous payment middleware**.

## 🚀 Features

- ✅ **x402 Payment Middleware** - Automatic micropayments via HTTP 402
- ✅ **Multi-Agent Support** - 3 agents with spending limits
- ✅ **Audit Trail** - Complete transaction logging
- ✅ **Temne` Abara Nation Integration** - Treasury payments
- ✅ **SOL Payments** - Native Solana transfers

## 📦 Installation
```bash
npm install
cp .env.example .env
# Add your private keys to .env
```

## 🧪 Demo
```bash
npm run x402:demo
```

## 🏛️ Registered Agents

| Agent | Type | Daily Limit | Address |
|-------|------|-------------|---------|
| Temne Abara Nation | Treasury | Unlimited | `6QKbY...iWSH` |
| Trading Bot | Agent | $500 | `3AxdP...QDnf` |
| Akil Agent | Agent | $100 | `3AxdP...QDnf` |

## 🔐 Security

- Private keys stored in `.env` (never committed)
- Spending limits per agent
- Complete audit trail
- Claude-proof protection system

## 📚 Usage
```typescript
import { createX402Handler } from './src/middleware/x402Handler';

const handler = createX402Handler('trading-bot');
const data = await handler.fetch('https://api.example.com/premium');
```

## 🛡️ License

MIT

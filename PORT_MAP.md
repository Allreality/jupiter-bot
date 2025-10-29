# 🌊 Jupiter Trading Bot - Port Allocation

## Active Services

| Port | Service | Status | Purpose |
|------|---------|--------|---------|
| 3003 | Dashboard API | ✅ RUNNING | Technical indicators, Raydium quotes |
| 3004 | Dashboard UI | ✅ RUNNING | HTML frontend |

## Planned Services

| Port | Service | Status | Purpose |
|------|---------|--------|---------|
| 3000 | Trading Bot API | 📋 Planned | Trade execution, portfolio management |
| 3001 | x402 Server | 📋 Planned | HTTP 402 payment handling |
| 3002 | MIDNIGHT API | 📋 Planned | MIDNIGHT blockchain services |
| 8080 | WebSocket | 📋 Planned | Real-time price streaming |
| 3005 | Analytics API | 📋 Planned | Historical data, backtesting |

## Current Architecture
```
┌─────────────────────────────────────────────────┐
│  Browser (localhost:3004)                       │
│  └─ Dashboard UI (HTML/JS/Chart.js)            │
└────────────────┬────────────────────────────────┘
                 │ HTTP Requests
                 ↓
┌─────────────────────────────────────────────────┐
│  Express Server (localhost:3003)                │
│  ├─ /api/quote/:from/:to/:amount                │
│  ├─ /api/indicators                             │
│  └─ Technical Analysis Engine                   │
│     ├─ RSI Calculator                           │
│     ├─ MACD Calculator                          │
│     └─ AI Signal Generator                      │
└────────────────┬────────────────────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────────────────────┐
│  Raydium DEX API (api.raydium.io)              │
│  └─ Real-time market data                      │
└─────────────────────────────────────────────────┘
```

## Startup Commands
```bash
# Start all services
npm run start:all

# Start individually
npm run start:dashboard    # API server (3003)
npm run dashboard:ui       # UI server (3004)
```

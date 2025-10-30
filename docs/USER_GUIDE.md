# 📖 User Guide

Complete guide for using Jupiter Trading Bot

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Time Tracking](#time-tracking)
4. [Trading Operations](#trading-operations)
5. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### First Time Setup

1. **Start all services:**
```bash
   npm run start:everything
```

2. **Open the Hub:**
   Navigate to http://localhost:3004/index.html

3. **Explore dashboards:**
   - Click each tile to explore different features
   - Start with "Live Trading" to see real-time data

---

## Dashboard Overview

### 🏠 Hub (http://localhost:3004/index.html)

**Central navigation for all features**

- Quick access to all 6 dashboards
- Live system status
- Service health indicators

### 📈 Live Trading (http://localhost:3004/dashboard.html)

**Real-time market analysis**

Features:
- Current SOL/USDC price
- RSI indicator (14-period)
- MACD analysis
- AI trading signals
- Price history chart
- Auto-refresh every 10 seconds

**Understanding Signals:**
- 🟢 **BUY** - Good entry point
- 🔴 **SELL** - Consider exiting
- 🟡 **HOLD** - Wait for better conditions
- **Confidence %** - Signal reliability (70%+ is strong)

### ⏱️ Time Tracker (http://localhost:3004/projects-dashboard.html)

**Project time management**

Features:
- 9 pre-loaded projects
- One-click timer start
- Real-time clock
- Time analytics
- Add new projects

---

## Time Tracking

### Starting a Timer

1. Open http://localhost:3004/projects-dashboard.html
2. Select project from dropdown
3. Click "▶️ Start Working"
4. Timer begins counting
5. Work on your project
6. Click "⏹️ Stop Timer" when done

### Adding New Projects

1. Click "➕ Add Project" button
2. Fill in details:
   - **Name**: Display name (e.g., "Website Redesign")
   - **ID**: Auto-generated (e.g., "website-redesign")
   - **Category**: Choose from list
   - **Description**: Optional details
3. Click "Add Project"
4. Project appears immediately in list

### Viewing Time Reports

The Summary card shows:
- **Total Time**: Across all projects
- **Active Projects**: Currently in use
- **Total Projects**: All projects tracked

---

## Trading Operations

### Paper Trading (Safe Mode)

Test strategies without risking real money:
```bash
npm run auto:dry
```

The bot will:
- Monitor prices
- Generate signals
- Log trades (not executed)
- Track performance

### Understanding Technical Indicators

**RSI (Relative Strength Index)**
- Range: 0-100
- < 30: Oversold (potential buy)
- > 70: Overbought (potential sell)
- 30-70: Neutral

**MACD (Moving Average Convergence Divergence)**
- Histogram > 0: Bullish momentum
- Histogram < 0: Bearish momentum
- Crossover: Trend change signal

**AI Signal**
- Combines RSI + MACD + price action
- Confidence scoring (0-100%)
- Multiple reasoning factors

### Live Trading (Real Money)

⚠️ **IMPORTANT**: Only use after thorough testing!

1. Add wallet private key to `.env`
2. Start with small amounts
3. Monitor closely
4. Use stop-loss limits
```bash
npm run auto:live
```

---

## Tips & Tricks

### Keyboard Shortcuts

Currently none, but coming soon!

### Best Practices

1. **Always test in paper mode first**
2. **Set maximum trade sizes**
3. **Monitor signals with 70%+ confidence**
4. **Track your work time daily**
5. **Review trade history weekly**

### Common Workflows

**Daily Trading Routine:**
1. Open Live Trading dashboard
2. Check overnight price action
3. Review current signal
4. Execute trades if confidence > 70%
5. Track results

**Weekly Review:**
1. Check total trading profit/loss
2. Review signal accuracy
3. Adjust indicator parameters if needed
4. Review time spent on projects

### Troubleshooting

**Dashboard not updating?**
- Check if all services are running
- Refresh page (Ctrl+F5)
- Check browser console (F12)

**Timer not starting?**
- Only one timer can run at a time
- Stop current timer first
- Refresh page if needed

**No trading signals?**
- Need 26 data points for MACD
- Wait 2-3 minutes for collection
- Check API connection

---

## Advanced Features

### Custom Projects

Add projects for any work:
- Coding projects
- Research tasks
- Creative work
- Client projects
- Personal goals

### Time Analytics

Export time data for:
- Client billing
- Productivity analysis
- Project estimation
- Team reporting

### Multiple Monitors

Optimal setup:
- Monitor 1: Live Trading
- Monitor 2: Time Tracker
- Monitor 3: Code/Work

---

## Need Help?

- Check README.md for technical details
- Review API.md for integration
- Check troubleshooting section
- Review console logs (F12)

---

**Happy tracking! ⏱️**
**Happy trading! 📈**

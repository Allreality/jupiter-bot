# 🎯 Phase 2: Paper Trading System

## ✅ What's New in Phase 2

### Paper Trading Features
- ✅ **Portfolio Management** - Track cash and positions
- ✅ **Trade Execution** - Simulate trades with Jupiter quotes
- ✅ **P&L Tracking** - Real-time profit/loss calculation
- ✅ **Position Management** - Open and close positions
- ✅ **Trade History** - Complete trading log with statistics
- ✅ **Session Saving** - Save and load trading sessions
- ✅ **Safety Integration** - All trades go through safety checks

## 🚀 Quick Start

### Run Paper Trading Demo
```bash
npm run paper:demo
```

This will:
- Initialize portfolio with 10 SOL
- Execute multiple trades
- Show position management
- Calculate P&L
- Display full trade history

### Run Strategy Backtest
```bash
npm run paper:strategy
```

This demonstrates:
- Simple mean reversion strategy
- Signal generation
- Strategy evaluation
- Performance tracking

## 📋 Available Commands

```bash
npm run quote          # Fetch real Jupiter quote (requires network)
npm run quote:mock     # Use mock data (works offline)
npm run paper:demo     # Paper trading demonstration
npm run paper:strategy # Strategy backtest example
```

## 🎓 How to Use Paper Trading

### Basic Setup

```typescript
import { PaperTradingManager } from './paperTrading/manager';
import { JupiterClient } from './jupiter/client';
import { SafetyChecker } from './utils/safety';
import { CONFIG } from '../config/config';

// Initialize components
const jupiter = new JupiterClient();
const safety = new SafetyChecker(CONFIG.safety);

// Create paper trading manager
const paperTrader = new PaperTradingManager(
  {
    startingBalance: 100,      // Starting balance
    baseCurrency: 'SOL',       // Base currency
    enableLogging: true,       // Enable logging
    logFile: 'trades.log',     // Optional log file
  },
  jupiter,
  safety
);
```

### Execute a Trade

```typescript
// Get a quote from Jupiter
const quote = await jupiter.getQuote({
  inputMint: TOKENS.SOL,
  outputMint: TOKENS.USDC,
  amount: 0.1 * Math.pow(10, 9), // 0.1 SOL
  slippageBps: 50,
});

// Execute the paper trade
const result = await paperTrader.executeTrade(
  quote,
  9,      // SOL decimals
  6,      // USDC decimals
  'SOL',
  'USDC'
);

if (result.success) {
  console.log('Trade executed!');
  console.log('Portfolio value:', result.portfolio.totalValue);
}
```

### Close a Position

```typescript
// Close entire position
await paperTrader.closePosition(
  'USDC',        // Token symbol
  0.00406        // Current price in SOL/USDC
);

// Close partial position
await paperTrader.closePosition(
  'USDC',
  0.00406,
  12.5           // Amount to close
);
```

### View Portfolio

```typescript
// Print portfolio summary
paperTrader.printPortfolio();

// Get portfolio data
const portfolio = paperTrader.getPortfolio();
console.log('Total value:', portfolio.totalValue);
console.log('Cash:', portfolio.cash);
console.log('P&L:', portfolio.totalPnL);
```

### View Trade History

```typescript
// Print trade history
paperTrader.printTradeHistory();

// Get history data
const history = paperTrader.getTradeHistory();
console.log('Win rate:', history.winRate * 100 + '%');
console.log('Total P&L:', history.netPnL);
```

### Save Trading Session

```typescript
// Save current session
paperTrader.saveSession();

// Save with custom filename
paperTrader.saveSession('my-trading-session.json');

// Sessions saved to: ./sessions/
```

## 📊 What You'll See

### Portfolio Summary
```
📊 PORTFOLIO SUMMARY
===================
Total Value: 10.0456 SOL
Cash: 9.80 SOL
Total P&L: 0.0456 (0.46%)

Positions:
  USDC:
    Amount: 24.567890
    Avg Price: 0.004067
    Current Value: 0.1020 SOL
    Unrealized P&L: 0.0020 (2.00%)
```

### Trade History
```
📈 TRADE HISTORY
================
Total Trades: 3
Successful: 3
Failed: 0
Win Rate: 66.67%

P&L Statistics:
  Total Profit: 0.0456
  Total Loss: 0.0123
  Net P&L: 0.0333
  Average Win: 0.0228
  Average Loss: 0.0123
  Largest Win: 0.0334
  Largest Loss: -0.0123
```

## 🎯 Trading Strategies

### Strategy Template

```typescript
class MyTradingStrategy {
  private paperTrader: PaperTradingManager;
  
  constructor(paperTrader: PaperTradingManager) {
    this.paperTrader = paperTrader;
  }
  
  async evaluate(price: number): Promise<'buy' | 'sell' | 'hold'> {
    // Your strategy logic here
    return 'hold';
  }
  
  async execute(signal: string): Promise<void> {
    if (signal === 'buy') {
      // Execute buy
    } else if (signal === 'sell') {
      // Execute sell
    }
  }
}
```

### Example Strategies to Try

1. **Mean Reversion**
   - Buy below moving average
   - Sell above moving average

2. **Momentum**
   - Buy on upward price movement
   - Sell on downward movement

3. **Arbitrage**
   - Compare prices across routes
   - Execute on price differences

4. **Grid Trading**
   - Set buy/sell levels
   - Execute at predetermined prices

## 📈 Performance Metrics

The paper trading system tracks:

- **Portfolio Metrics**
  - Total value
  - Cash balance
  - Position values
  - Unrealized P&L

- **Trade Metrics**
  - Total trades
  - Win rate
  - Average profit/loss
  - Largest win/loss
  - Net P&L

- **Position Metrics**
  - Amount held
  - Average entry price
  - Current value
  - Unrealized P&L %

## ⚠️ Important Notes

### Paper Trading vs Real Trading

**Paper Trading:**
- ✅ Zero risk
- ✅ Instant execution
- ✅ No gas fees
- ✅ Perfect for testing
- ❌ No slippage simulation
- ❌ No order book depth
- ❌ No network delays

**Real Trading:**
- ⚠️ Real money at risk
- ⚠️ Gas fees
- ⚠️ Slippage
- ⚠️ Network delays
- ⚠️ Failed transactions

### Before Going Live

1. ✅ Test thoroughly with paper trading
2. ✅ Verify strategy profitability
3. ✅ Test on Devnet
4. ✅ Start with minimal capital ($100 max)
5. ✅ Use stop losses
6. ✅ Monitor closely

## 🔜 Next Steps

### Phase 3: Devnet Testing
- Execute real transactions on Devnet
- Test wallet integration
- Monitor gas fees
- Validate transaction signing

### Phase 4: Production (If Profitable)
- Switch to mainnet
- Implement risk management
- Add monitoring/alerts
- Scale gradually

## 📚 Examples

Check out these example files:
- `src/test/paperTrading.ts` - Full paper trading demo
- `src/examples/simpleStrategy.ts` - Strategy backtest example
- `src/examples/mockQuote.ts` - Mock quote example

## 💡 Tips

1. **Test Multiple Scenarios**
   - Bull markets
   - Bear markets
   - Sideways markets
   - High volatility

2. **Track Everything**
   - Save all sessions
   - Review trade history
   - Analyze what works

3. **Start Simple**
   - Test basic strategies first
   - Add complexity gradually
   - Verify each component

4. **Use Safety Checks**
   - Never skip safety validation
   - Set reasonable limits
   - Protect your capital

## 🆘 Troubleshooting

**Portfolio value not updating?**
- Check if positions are being created
- Verify price calculations

**Trades being rejected?**
- Review safety check output
- Adjust safety limits if needed
- Check sufficient balance

**Session not saving?**
- Verify `sessions/` directory exists
- Check file permissions

---

**Ready to test strategies risk-free with paper trading!** 🚀

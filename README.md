# Jupiter Trading Bot 🚀

A safe, production-ready Jupiter DEX aggregator integration for Solana with comprehensive safety checks and paper trading capabilities.

## ✅ Features Implemented

### Phase 1: Jupiter Integration ✅
- ✅ API connection to Jupiter v6
- ✅ Quote fetching with multiple parameters
- ✅ Transaction building
- ✅ Comprehensive safety checks
- ✅ Price impact analysis
- ✅ Route optimization
- ✅ Token info lookup

### Phase 2: Paper Trading ✅
- ✅ Portfolio management
- ✅ Trade execution simulation
- ✅ P&L tracking
- ✅ Position management
- ✅ Trade history with statistics
- ✅ Session saving/loading
- ✅ Strategy backtesting
- ✅ Risk-free testing environment

### Safety Features 🛡️
- ✅ Maximum price impact limits
- ✅ Slippage tolerance validation
- ✅ Route count verification
- ✅ Output amount sanity checks
- ✅ Liquidity depth analysis
- ✅ Multi-level warnings (info/warning/error)

## 🏗️ Project Structure

```
jupiter-bot/
├── config/
│   └── config.ts              # Configuration management
├── src/
│   ├── jupiter/
│   │   ├── client.ts          # Jupiter API client
│   │   └── types.ts           # TypeScript type definitions
│   ├── utils/
│   │   └── safety.ts          # Safety check system
│   ├── examples/
│   │   └── getQuote.ts        # Example: Fetch and analyze quotes
│   └── test/
│       └── paperTrade.ts      # Paper trading simulator (TODO)
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd jupiter-bot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (use Devnet for testing!)
```

### 3. Run Example

```bash
# Fetch a quote
npm run quote
```

## 📋 Available Commands

```bash
npm run dev            # Run main bot (development)
npm run build          # Build TypeScript
npm run quote          # Fetch real Jupiter quote (requires network)
npm run quote:mock     # Use mock quote data (works offline)
npm run paper:demo     # Run paper trading demo
npm run paper:strategy # Run strategy backtest example
```

## 🎯 Usage Examples

### Fetch a Quote

```typescript
import { JupiterClient } from './jupiter/client';
import { SafetyChecker } from './utils/safety';
import { CONFIG, TOKENS } from '../config/config';

// Initialize
const jupiter = new JupiterClient();
const safety = new SafetyChecker(CONFIG.safety);

// Get quote for 0.1 SOL → USDC
const quote = await jupiter.getQuote({
  inputMint: TOKENS.SOL,
  outputMint: TOKENS.USDC,
  amount: 0.1 * Math.pow(10, 9), // Convert to lamports
  slippageBps: 50,
});

// Check safety
const safetyResult = safety.checkQuoteSafety(quote, 9, 6);
safety.printSafetyReport(safetyResult);

if (safetyResult.safe) {
  console.log('✅ Safe to execute!');
  // Proceed with trade...
} else {
  console.log('❌ Unsafe trade - skipping');
}
```

### Find Token Information

```typescript
const jupiter = new JupiterClient();

// Search for USDC
const usdc = await jupiter.findTokenBySymbol('USDC');
console.log(usdc);

// Get all tokens
const allTokens = await jupiter.getTokenList();
```

### Compare Multiple Quotes

```typescript
const jupiter = new JupiterClient();
const safety = new SafetyChecker();

// Fetch 3 quotes
const quotes = await jupiter.getMultipleQuotes({
  inputMint: TOKENS.SOL,
  outputMint: TOKENS.USDC,
  amount: 0.1 * Math.pow(10, 9),
}, 3);

// Select the safest with best output
const best = safety.selectSafestQuote(quotes, 9, 6);
```

## 🛡️ Safety Configuration

The bot includes configurable safety limits:

```typescript
{
  maxPriceImpactPercent: 2.0,    // Max 2% price impact
  maxSlippageBps: 100,            // Max 1% slippage
  minRouteCount: 1,               // Minimum routes
  minOutputRatio: 0.90,           // Expect 90%+ output
  warnPriceImpactPercent: 1.0,    // Warn at 1%
  warnSlippageBps: 50,            // Warn at 0.5%
}
```

Adjust these in `.env` or `config/config.ts`.

## ⚠️ Important Safety Notes

### ALWAYS Test on Devnet First! 🧪

1. **Start with Devnet**
   - Use `SOLANA_CLUSTER=devnet`
   - Use devnet tokens (worthless)
   - Test all functionality

2. **Paper Trading**
   - Set `PAPER_TRADING=true`
   - Simulates trades without real transactions
   - Tracks hypothetical P&L

3. **Start Small**
   - When going live, start with $100 max
   - One strategy at a time
   - Close monitoring required

### Never Skip Safety Checks! ⚡

The safety checker prevents:
- ❌ High price impact trades
- ❌ Excessive slippage
- ❌ Low liquidity swaps
- ❌ Suspicious output amounts

**If safety checks fail, DO NOT execute the trade!**

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `SOLANA_CLUSTER` | Cluster (mainnet-beta/devnet/testnet) | `devnet` |
| `WALLET_PRIVATE_KEY` | Your wallet private key (base58) | - |
| `JUPITER_API_URL` | Jupiter API endpoint | `https://quote-api.jup.ag/v6` |
| `DEFAULT_SLIPPAGE_BPS` | Default slippage tolerance | `50` (0.5%) |
| `MAX_PRICE_IMPACT` | Maximum acceptable price impact | `2.0` (2%) |
| `PAPER_TRADING` | Enable paper trading mode | `true` |

## 📊 Next Steps

### Phase 2: Paper Trading ✅ COMPLETE
- ✅ Implemented paper trading simulator
- ✅ Track simulated P&L
- ✅ Test strategies without risk
- ✅ Validate trading logic

**See [PHASE2.md](PHASE2.md) for full documentation**

### Phase 3: Devnet Testing (Next)
- [ ] Execute real transactions on devnet
- [ ] Test wallet integration
- [ ] Verify transaction signing
- [ ] Monitor gas fees

### Phase 4: Production (Only if Profitable)
- [ ] Switch to mainnet RPC
- [ ] Start with minimal capital ($100)
- [ ] Implement profit tracking
- [ ] Add monitoring/alerts
- [ ] Risk management system

## 🐛 Troubleshooting

### "Jupiter API Error"
- Check your internet connection
- Verify `JUPITER_API_URL` is correct
- Jupiter API might be rate limiting

### "RPC Error"
- Check `SOLANA_RPC_URL` is accessible
- Consider using a paid RPC (Helius, Quicknode)
- Devnet RPC can be slower

### Quotes Look Wrong
- Verify token decimals are correct
- Check you're using the right token addresses
- Price impact might be high for illiquid pairs

## 📚 Resources

- [Jupiter Docs](https://station.jup.ag/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Solana Cookbook](https://solanacookbook.com/)

## ⚖️ License

MIT

## ⚠️ Disclaimer

**This software is for educational purposes only.** 

- ❌ Not financial advice
- ❌ Use at your own risk
- ❌ No warranty provided
- ✅ Always test on devnet first
- ✅ Never invest more than you can afford to lose
- ✅ DYOR (Do Your Own Research)

Trading cryptocurrencies carries significant risk. Past performance does not guarantee future results.

---

**Remember: Start with paper trading, test on devnet, then start small! 🎯**

import { AutoTrader, AutoTraderConfig } from '../trading/autoTrader';
import { RAYDIUM_TOKENS } from '../raydium/client';

const config: AutoTraderConfig = {
  walletPrivateKey: process.env.TRADING_BOT_PRIVATE_KEY || '',
  tradingPair: {
    input: RAYDIUM_TOKENS.SOL,
    output: RAYDIUM_TOKENS.USDC,
    symbol: 'SOL/USDC'
  },
  limits: {
    minTradeSize: 0.01,     // Start SMALL!
    maxTradeSize: 0.1,      // Max 0.1 SOL per trade
    maxDailyTrades: 10,     // Max 10 trades per day
    minConfidence: 85,      // Only trade on 85%+ confidence
    stopLoss: 3,            // 3% stop loss
    takeProfit: 5           // 5% take profit
  },
  mode: 'DRY_RUN'  // SAFE MODE - no real trades!
};

async function main() {
  console.log('⚠️  IMPORTANT: This will run in DRY_RUN mode (simulation only)');
  console.log('⚠️  No real trades will be executed');
  console.log('⚠️  To enable live trading, change mode to LIVE in the config\n');

  const trader = new AutoTrader(config);
  await trader.start();
}

main().catch(console.error);

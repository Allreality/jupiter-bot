import { LiveTradingAnalyzer, TradingPair } from '../trading/liveAnalyzer';
import { RAYDIUM_TOKENS } from '../raydium/client';

// Define pairs to monitor
const TRADING_PAIRS: TradingPair[] = [
  {
    name: 'Solana to USDC',
    inputMint: RAYDIUM_TOKENS.SOL,
    outputMint: RAYDIUM_TOKENS.USDC,
    symbol: 'SOL/USDC'
  },
  {
    name: 'Solana to USDT',
    inputMint: RAYDIUM_TOKENS.SOL,
    outputMint: RAYDIUM_TOKENS.USDT,
    symbol: 'SOL/USDT'
  }
];

async function main() {
  console.log('🌊 Raydium Live Trading Analysis');
  console.log('================================\n');

  const analyzer = new LiveTradingAnalyzer(60); // Update every 60 seconds

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Shutting down gracefully...');
    analyzer.stop();
    process.exit(0);
  });

  // Start analysis
  await analyzer.start(TRADING_PAIRS);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

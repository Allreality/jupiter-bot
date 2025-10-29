import { PaperTradingManager } from '../paperTrading/manager';
import { JupiterClient } from '../jupiter/client';
import { SafetyChecker } from '../utils/safety';
import { CONFIG } from '../../config/config';
import { JupiterQuoteResponse } from '../jupiter/types';

// Mock quotes for demonstration
const mockQuotes = {
  // SOL → USDC swap (buying USDC)
  solToUsdc: {
    inputMint: 'So11111111111111111111111111111111111111112',
    inAmount: '100000000', // 0.1 SOL
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    outAmount: '24567890', // ~24.57 USDC
    otherAmountThreshold: '24323211',
    swapMode: 'ExactIn' as const,
    slippageBps: 50,
    platformFee: null,
    priceImpactPct: '0.000234',
    routePlan: [
      {
        swapInfo: {
          ammKey: 'Orca',
          label: 'Orca',
          inputMint: 'So11111111111111111111111111111111111111112',
          outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          inAmount: '60000000',
          outAmount: '14740734',
          feeAmount: '0',
          feeMint: 'So11111111111111111111111111111111111111112',
        },
        percent: 60,
      },
      {
        swapInfo: {
          ammKey: 'Raydium',
          label: 'Raydium',
          inputMint: 'So11111111111111111111111111111111111111112',
          outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          inAmount: '40000000',
          outAmount: '9827156',
          feeAmount: '0',
          feeMint: 'So11111111111111111111111111111111111111112',
        },
        percent: 40,
      },
    ],
  } as JupiterQuoteResponse,

  // Another SOL → USDC swap at a different price
  solToUsdcHigher: {
    inputMint: 'So11111111111111111111111111111111111111112',
    inAmount: '100000000', // 0.1 SOL
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    outAmount: '25000000', // 25 USDC (price went up)
    otherAmountThreshold: '24750000',
    swapMode: 'ExactIn' as const,
    slippageBps: 50,
    platformFee: null,
    priceImpactPct: '0.000189',
    routePlan: [
      {
        swapInfo: {
          ammKey: 'Orca',
          label: 'Orca',
          inputMint: 'So11111111111111111111111111111111111111112',
          outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          inAmount: '100000000',
          outAmount: '25000000',
          feeAmount: '0',
          feeMint: 'So11111111111111111111111111111111111111112',
        },
        percent: 100,
      },
    ],
  } as JupiterQuoteResponse,
};

async function runPaperTradingDemo() {
  console.log('🚀 Paper Trading Demo\n');
  console.log('⚠️  This is a simulation using mock data\n');

  // Initialize components
  const jupiter = new JupiterClient();
  const safety = new SafetyChecker(CONFIG.safety);

  // Create paper trading manager with 10 SOL starting balance
  const paperTrader = new PaperTradingManager(
    {
      startingBalance: 10,
      baseCurrency: 'SOL',
      enableLogging: true,
    },
    jupiter,
    safety
  );

  console.log('📋 Starting Paper Trading Scenario\n');
  console.log('═══════════════════════════════════\n');

  // Show initial portfolio
  paperTrader.printPortfolio();

  // Trade 1: Buy USDC with 0.1 SOL
  console.log('📈 TRADE 1: Buying USDC with 0.1 SOL');
  console.log('─────────────────────────────────────');
  const trade1 = await paperTrader.executeTrade(
    mockQuotes.solToUsdc,
    9, // SOL decimals
    6, // USDC decimals
    'SOL',
    'USDC'
  );

  if (trade1.success) {
    console.log('✅ Trade 1 successful!\n');
  } else {
    console.log(`❌ Trade 1 failed: ${trade1.error}\n`);
  }

  // Wait a moment (simulate time passing)
  await new Promise(resolve => setTimeout(resolve, 100));

  // Trade 2: Buy more USDC with another 0.1 SOL at a better price
  console.log('📈 TRADE 2: Buying more USDC with 0.1 SOL (better price)');
  console.log('──────────────────────────────────────────────────────');
  const trade2 = await paperTrader.executeTrade(
    mockQuotes.solToUsdcHigher,
    9,
    6,
    'SOL',
    'USDC'
  );

  if (trade2.success) {
    console.log('✅ Trade 2 successful!\n');
  } else {
    console.log(`❌ Trade 2 failed: ${trade2.error}\n`);
  }

  // Show current portfolio
  paperTrader.printPortfolio();

  // Simulate USDC price change
  console.log('💰 Simulating price movement...\n');
  console.log('   USDC/SOL price increased from ~0.00406 to 0.00420\n');

  // Trade 3: Close half of USDC position at profit
  console.log('📉 TRADE 3: Closing half of USDC position');
  console.log('──────────────────────────────────────');
  
  const portfolio = paperTrader.getPortfolio();
  const usdcPosition = portfolio.positions.get('USDC');
  
  if (usdcPosition) {
    const closeAmount = usdcPosition.amount / 2;
    const newPrice = 0.00420; // New price in SOL per USDC
    
    const trade3 = await paperTrader.closePosition('USDC', newPrice, closeAmount);
    
    if (trade3.success) {
      console.log('✅ Position partially closed!\n');
      if (trade3.trade?.profit) {
        console.log(`   💰 Profit: ${trade3.trade.profit.toFixed(4)} SOL (${trade3.trade.profitPercent?.toFixed(2)}%)\n`);
      }
    } else {
      console.log(`❌ Close failed: ${trade3.error}\n`);
    }
  }

  // Final portfolio state
  paperTrader.printPortfolio();

  // Show trade history
  paperTrader.printTradeHistory();

  // Show detailed trade log
  console.log('📝 DETAILED TRADE LOG');
  console.log('=====================\n');
  
  const history = paperTrader.getTradeHistory();
  history.trades.forEach((trade, index) => {
    console.log(`Trade ${index + 1}:`);
    console.log(`  Time: ${trade.timestamp.toLocaleString()}`);
    console.log(`  Type: ${trade.type.toUpperCase()}`);
    console.log(`  Input: ${trade.inputAmount.toFixed(6)}`);
    console.log(`  Output: ${trade.outputAmount.toFixed(6)}`);
    console.log(`  Price: ${trade.price.toFixed(6)}`);
    if (trade.profit !== undefined) {
      const profitEmoji = trade.profit > 0 ? '📈' : '📉';
      console.log(`  ${profitEmoji} Profit: ${trade.profit.toFixed(4)} (${trade.profitPercent?.toFixed(2)}%)`);
    }
    console.log('');
  });

  // Save session
  console.log('💾 Saving trading session...');
  paperTrader.saveSession();

  console.log('\n✅ Paper Trading Demo Complete!\n');
  console.log('═══════════════════════════════════\n');
  
  // Summary
  const finalPortfolio = paperTrader.getPortfolio();
  const finalHistory = paperTrader.getTradeHistory();
  
  console.log('📊 FINAL SUMMARY');
  console.log('────────────────');
  console.log(`Starting Balance: ${finalPortfolio.startingBalance} SOL`);
  console.log(`Ending Balance: ${finalPortfolio.totalValue.toFixed(4)} SOL`);
  console.log(`Total P&L: ${finalPortfolio.totalPnL.toFixed(4)} SOL (${finalPortfolio.totalPnLPercent.toFixed(2)}%)`);
  console.log(`Total Trades: ${finalHistory.totalTrades}`);
  console.log(`Win Rate: ${(finalHistory.winRate * 100).toFixed(2)}%`);
  console.log('');

  console.log('💡 Next Steps:');
  console.log('   - Run strategies with real market data');
  console.log('   - Test on Devnet with actual transactions');
  console.log('   - Build automated trading bots');
  console.log('');
}

// Run the demo
runPaperTradingDemo().catch(console.error);

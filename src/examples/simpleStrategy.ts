import { PaperTradingManager } from '../paperTrading/manager';
import { JupiterClient } from '../jupiter/client';
import { SafetyChecker } from '../utils/safety';
import { CONFIG } from '../../config/config';

/**
 * Simple Mean Reversion Strategy (Mock Example)
 * 
 * Strategy Logic:
 * - Buy when price drops below moving average
 * - Sell when price rises above moving average
 * - This is a DEMONSTRATION with mock data
 */

interface PricePoint {
  timestamp: Date;
  price: number;
}

class SimpleMeanReversionStrategy {
  private paperTrader: PaperTradingManager;
  private priceHistory: PricePoint[] = [];
  private movingAveragePeriod: number = 5;
  private buyThreshold: number = 0.98; // Buy when price is 2% below MA
  private sellThreshold: number = 1.02; // Sell when price is 2% above MA

  constructor(paperTrader: PaperTradingManager) {
    this.paperTrader = paperTrader;
  }

  /**
   * Calculate simple moving average
   */
  private calculateMA(): number | null {
    if (this.priceHistory.length < this.movingAveragePeriod) {
      return null;
    }

    const recentPrices = this.priceHistory.slice(-this.movingAveragePeriod);
    const sum = recentPrices.reduce((acc, point) => acc + point.price, 0);
    return sum / this.movingAveragePeriod;
  }

  /**
   * Add new price point
   */
  addPrice(price: number): void {
    this.priceHistory.push({
      timestamp: new Date(),
      price,
    });
  }

  /**
   * Evaluate strategy and return signal
   */
  evaluateSignal(currentPrice: number): 'buy' | 'sell' | 'hold' {
    const ma = this.calculateMA();
    
    if (!ma) {
      return 'hold'; // Not enough data yet
    }

    const priceToMA = currentPrice / ma;

    if (priceToMA < this.buyThreshold) {
      return 'buy';
    } else if (priceToMA > this.sellThreshold) {
      return 'sell';
    } else {
      return 'hold';
    }
  }

  /**
   * Print current state
   */
  printState(currentPrice: number): void {
    const ma = this.calculateMA();
    const signal = this.evaluateSignal(currentPrice);
    
    console.log(`Current Price: ${currentPrice.toFixed(4)}`);
    if (ma) {
      console.log(`Moving Average (${this.movingAveragePeriod}): ${ma.toFixed(4)}`);
      console.log(`Price/MA Ratio: ${(currentPrice / ma).toFixed(4)}`);
    }
    console.log(`Signal: ${signal.toUpperCase()}`);
    console.log('');
  }
}

async function runStrategyBacktest() {
  console.log('🤖 Simple Mean Reversion Strategy Demo\n');
  console.log('⚠️  This is a mock backtest for demonstration\n');

  // Initialize components
  const jupiter = new JupiterClient();
  const safety = new SafetyChecker(CONFIG.safety);

  // Create paper trading manager
  const paperTrader = new PaperTradingManager(
    {
      startingBalance: 100, // 100 SOL
      baseCurrency: 'SOL',
      enableLogging: true,
    },
    jupiter,
    safety
  );

  // Create strategy
  const strategy = new SimpleMeanReversionStrategy(paperTrader);

  // Mock price data (simulating SOL/USDC price over time)
  const mockPrices = [
    250.00, // Day 1
    248.50, // Day 2 - slight drop
    247.00, // Day 3 - drop continues
    245.50, // Day 4 - more drop
    244.00, // Day 5 - bottom (5-day MA: 247)
    246.00, // Day 6 - bounce (buy signal would trigger)
    248.00, // Day 7 - rising
    250.50, // Day 8 - above MA
    252.00, // Day 9 - strong rise
    254.00, // Day 10 - peak (sell signal would trigger)
  ];

  console.log('📊 Starting Backtest');
  console.log('═══════════════════\n');

  // Show initial portfolio
  paperTrader.printPortfolio();

  // Simulate trading over time
  for (let i = 0; i < mockPrices.length; i++) {
    const price = mockPrices[i];
    
    console.log(`\n📅 Day ${i + 1}`);
    console.log('─────────────');
    
    // Add price to history
    strategy.addPrice(price);
    
    // Evaluate signal
    strategy.printState(price);
    
    const signal = strategy.evaluateSignal(price);
    const portfolio = paperTrader.getPortfolio();
    
    // Execute based on signal
    if (signal === 'buy' && portfolio.cash >= 1.0) {
      console.log('🟢 BUY SIGNAL - Executing buy...');
      // In real scenario, would fetch quote and execute
      // For demo, we simulate a buy
      console.log('   (Would buy 1 SOL worth of USDC here)');
      console.log('   Current portfolio value: ' + portfolio.totalValue.toFixed(2) + ' SOL\n');
    } else if (signal === 'sell') {
      const usdcPosition = portfolio.positions.get('USDC');
      if (usdcPosition && usdcPosition.amount > 0) {
        console.log('🔴 SELL SIGNAL - Executing sell...');
        // In real scenario, would close position
        console.log('   (Would sell USDC position here)');
        console.log('   Current portfolio value: ' + portfolio.totalValue.toFixed(2) + ' SOL\n');
      } else {
        console.log('⚪ SELL SIGNAL - No position to sell\n');
      }
    } else {
      console.log('⚪ HOLD - No action\n');
    }

    // Small delay for readability
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Final results
  console.log('\n📊 BACKTEST RESULTS');
  console.log('═══════════════════\n');
  
  paperTrader.printPortfolio();
  paperTrader.printTradeHistory();

  console.log('💡 Strategy Summary:');
  console.log('   - Strategy: Simple Mean Reversion');
  console.log('   - Period: 10 days (mock data)');
  console.log('   - Buy Threshold: -2% from MA');
  console.log('   - Sell Threshold: +2% from MA');
  console.log('');

  console.log('⚠️  Remember:');
  console.log('   - This is a DEMO with mock data');
  console.log('   - Real trading requires risk management');
  console.log('   - Always test on Devnet before mainnet');
  console.log('   - Start with small amounts\n');
}

// Run the backtest
runStrategyBacktest().catch(console.error);

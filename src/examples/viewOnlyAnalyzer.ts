import { RaydiumClient, RAYDIUM_TOKENS } from '../raydium/client';
import { calculateRSI, calculateMACD, generateTradingSignal, PriceData } from '../utils/technicalIndicators';

const priceHistory: PriceData[] = [];
const raydiumClient = new RaydiumClient();

async function analyze() {
  const quote = await raydiumClient.getQuote(RAYDIUM_TOKENS.SOL, RAYDIUM_TOKENS.USDC, 1);
  
  priceHistory.push({ timestamp: Date.now(), price: quote.price });
  if (priceHistory.length > 200) priceHistory.shift();

  if (priceHistory.length < 26) {
    console.log(`📊 Collecting data... (${priceHistory.length}/26)`);
    return;
  }

  const prices = priceHistory.map(p => p.price);
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const signal = generateTradingSignal(rsi, macd);

  console.log('\n' + '='.repeat(80));
  console.log(`⏰ ${new Date().toLocaleTimeString()}`);
  console.log(`💰 SOL Price: $${quote.price.toFixed(2)}`);
  console.log(`📈 RSI: ${rsi.value.toFixed(2)} (${rsi.signal})`);
  console.log(`📊 MACD Histogram: ${macd.histogram.toFixed(4)} (${macd.crossover})`);
  console.log(`🎯 Signal: ${signal.action} (${signal.confidence}%)`);
  
  if (signal.confidence >= 80) {
    console.log('\n💡 TRADING RECOMMENDATION:');
    if (signal.action.includes('BUY')) {
      console.log(`   🟢 Would BUY at $${quote.price.toFixed(2)}`);
      console.log(`   🎯 Target: $${(quote.price * 1.05).toFixed(2)} (+5%)`);
      console.log(`   🛑 Stop: $${(quote.price * 0.97).toFixed(2)} (-3%)`);
    } else if (signal.action.includes('SELL')) {
      console.log(`   🔴 Would SELL at $${quote.price.toFixed(2)}`);
    }
  }
  
  console.log('\n📝 Reasons:', signal.reasons.join(', '));
}

async function main() {
  console.log('👁️  VIEW-ONLY MODE - No wallet needed');
  console.log('📊 Analyzing SOL/USDC every 60 seconds\n');
  
  while (true) {
    try {
      await analyze();
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

main();

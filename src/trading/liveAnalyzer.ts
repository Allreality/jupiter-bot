import { RaydiumClient, RAYDIUM_TOKENS } from '../raydium/client';
import { calculateRSI, calculateMACD, generateTradingSignal, PriceData } from '../utils/technicalIndicators';
import * as fs from 'fs';
import * as path from 'path';

export interface TradingPair {
  name: string;
  inputMint: string;
  outputMint: string;
  symbol: string;
}

export interface LiveAnalysis {
  timestamp: Date;
  pair: string;
  price: number;
  priceChange24h: number;
  rsi: {
    value: number;
    signal: string;
    strength: string;
  };
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    crossover: string;
  };
  tradingSignal: {
    action: string;
    confidence: number;
    reasons: string[];
  };
  recommendation: {
    action: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
    entryPrice?: number;
    targetPrice?: number;
    stopLoss?: number;
    positionSize?: number;
  };
}

export class LiveTradingAnalyzer {
  private raydiumClient: RaydiumClient;
  private priceHistories: Map<string, PriceData[]>;
  private analysisHistory: LiveAnalysis[];
  private updateInterval: number;
  private isRunning: boolean;
  private logFile: string;

  constructor(updateIntervalSeconds: number = 60) {
    this.raydiumClient = new RaydiumClient();
    this.priceHistories = new Map();
    this.analysisHistory = [];
    this.updateInterval = updateIntervalSeconds * 1000;
    this.isRunning = false;
    
    // Create logs directory
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logsDir, `live-analysis-${timestamp}.log`);
  }

  /**
   * Start live analysis
   */
  async start(pairs: TradingPair[]): Promise<void> {
    this.isRunning = true;
    this.log('🚀 Starting Live Trading Analysis');
    this.log(`📊 Monitoring ${pairs.length} pairs`);
    this.log(`⏱️  Update interval: ${this.updateInterval / 1000}s`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🌊 LIVE TRADING ANALYSIS STARTED');
    console.log('='.repeat(80));
    console.log(`Pairs: ${pairs.map(p => p.symbol).join(', ')}`);
    console.log(`Update frequency: Every ${this.updateInterval / 1000} seconds`);
    console.log(`Logs: ${this.logFile}`);
    console.log('='.repeat(80) + '\n');

    while (this.isRunning) {
      for (const pair of pairs) {
        try {
          await this.analyzePair(pair);
        } catch (error: any) {
          this.log(`❌ Error analyzing ${pair.symbol}: ${error.message}`);
        }
      }
      
      // Wait for next update
      await this.sleep(this.updateInterval);
    }
  }

  /**
   * Stop live analysis
   */
  stop(): void {
    this.isRunning = false;
    this.log('🛑 Live Trading Analysis Stopped');
    console.log('\n🛑 Analysis stopped. Logs saved to:', this.logFile);
  }

  /**
   * Analyze a trading pair
   */
  private async analyzePair(pair: TradingPair): Promise<void> {
    const quote = await this.raydiumClient.getQuote(pair.inputMint, pair.outputMint, 1);
    
    // Update price history
    const history = this.priceHistories.get(pair.symbol) || [];
    history.push({ timestamp: Date.now(), price: quote.price });
    
    // Keep last 200 prices
    if (history.length > 200) {
      history.shift();
    }
    this.priceHistories.set(pair.symbol, history);

    // Calculate indicators (need at least 26 data points for MACD)
    if (history.length < 26) {
      console.log(`📊 ${pair.symbol}: Collecting data... (${history.length}/26)`);
      return;
    }

    const prices = history.map(h => h.price);
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const signal = generateTradingSignal(rsi, macd);

    // Calculate 24h price change
    const price24hAgo = history.length > 24 ? history[history.length - 24].price : history[0].price;
    const priceChange24h = ((quote.price - price24hAgo) / price24hAgo) * 100;

    // Generate trading recommendation
    const recommendation = this.generateRecommendation(quote.price, rsi, macd, signal);

    const analysis: LiveAnalysis = {
      timestamp: new Date(),
      pair: pair.symbol,
      price: quote.price,
      priceChange24h,
      rsi: {
        value: rsi.value,
        signal: rsi.signal,
        strength: rsi.strength
      },
      macd: {
        macd: macd.macd,
        signal: macd.signal,
        histogram: macd.histogram,
        crossover: macd.crossover
      },
      tradingSignal: {
        action: signal.action,
        confidence: signal.confidence,
        reasons: signal.reasons
      },
      recommendation
    };

    this.analysisHistory.push(analysis);
    this.displayAnalysis(analysis);
    this.logAnalysis(analysis);

    // Alert on strong signals
    if (signal.action === 'STRONG_BUY' || signal.action === 'STRONG_SELL') {
      this.alert(analysis);
    }
  }

  /**
   * Generate trading recommendation with entry/exit points
   */
  private generateRecommendation(
    currentPrice: number,
    rsi: any,
    macd: any,
    signal: any
  ): LiveAnalysis['recommendation'] {
    const rec: LiveAnalysis['recommendation'] = {
      action: signal.action as any
    };

    if (signal.action.includes('BUY')) {
      rec.entryPrice = currentPrice;
      rec.targetPrice = currentPrice * 1.05; // 5% profit target
      rec.stopLoss = currentPrice * 0.97; // 3% stop loss
      rec.positionSize = signal.confidence / 100; // Size based on confidence
    } else if (signal.action.includes('SELL')) {
      rec.entryPrice = currentPrice;
      rec.targetPrice = currentPrice * 0.95; // 5% profit on short
      rec.stopLoss = currentPrice * 1.03; // 3% stop loss
      rec.positionSize = signal.confidence / 100;
    } else {
      rec.action = 'HOLD';
    }

    return rec;
  }

  /**
   * Display analysis in console
   */
  private displayAnalysis(analysis: LiveAnalysis): void {
    const timestamp = analysis.timestamp.toLocaleTimeString();
    const arrow = analysis.priceChange24h > 0 ? '↑' : '↓';
    const priceColor = analysis.priceChange24h > 0 ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log('\n' + '-'.repeat(80));
    console.log(`⏰ ${timestamp} | ${analysis.pair}`);
    console.log('-'.repeat(80));
    console.log(`💰 Price: $${analysis.price.toFixed(4)} ${priceColor}${arrow} ${analysis.priceChange24h.toFixed(2)}%${reset}`);
    console.log(`📈 RSI: ${analysis.rsi.value.toFixed(2)} (${analysis.rsi.signal} - ${analysis.rsi.strength})`);
    console.log(`📊 MACD: ${analysis.macd.histogram.toFixed(4)} (${analysis.macd.crossover})`);
    console.log(`🎯 Signal: ${analysis.tradingSignal.action} (${analysis.tradingSignal.confidence}% confidence)`);
    
    if (analysis.recommendation.action !== 'HOLD') {
      console.log('\n💡 RECOMMENDATION:');
      console.log(`   Action: ${analysis.recommendation.action}`);
      console.log(`   Entry: $${analysis.recommendation.entryPrice?.toFixed(4)}`);
      console.log(`   Target: $${analysis.recommendation.targetPrice?.toFixed(4)}`);
      console.log(`   Stop Loss: $${analysis.recommendation.stopLoss?.toFixed(4)}`);
      console.log(`   Position Size: ${(analysis.recommendation.positionSize! * 100).toFixed(0)}%`);
    }

    console.log('\n📝 Reasons:');
    analysis.tradingSignal.reasons.forEach(reason => {
      console.log(`   • ${reason}`);
    });
  }

  /**
   * Send alert for strong signals
   */
  private alert(analysis: LiveAnalysis): void {
    const alertMsg = `
🚨 STRONG SIGNAL ALERT 🚨
Pair: ${analysis.pair}
Signal: ${analysis.tradingSignal.action}
Confidence: ${analysis.tradingSignal.confidence}%
Price: $${analysis.price.toFixed(4)}
RSI: ${analysis.rsi.value.toFixed(2)}
`;
    
    console.log('\n' + '='.repeat(80));
    console.log(alertMsg);
    console.log('='.repeat(80) + '\n');
    
    this.log(`🚨 ALERT: ${alertMsg}`);
  }

  /**
   * Log analysis to file
   */
  private logAnalysis(analysis: LiveAnalysis): void {
    const logEntry = JSON.stringify(analysis, null, 2);
    this.log(logEntry);
  }

  /**
   * Write to log file
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
  }

  /**
   * Get analysis history
   */
  getHistory(pair?: string): LiveAnalysis[] {
    if (pair) {
      return this.analysisHistory.filter(a => a.pair === pair);
    }
    return this.analysisHistory;
  }

  /**
   * Get current price history for a pair
   */
  getPriceHistory(pair: string): PriceData[] {
    return this.priceHistories.get(pair) || [];
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

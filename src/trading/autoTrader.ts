import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RaydiumClient, RAYDIUM_TOKENS } from '../raydium/client';
import { calculateRSI, calculateMACD, generateTradingSignal, PriceData } from '../utils/technicalIndicators';
import bs58 from 'bs58';

export interface AutoTraderConfig {
  walletPrivateKey: string; // Base58 encoded
  tradingPair: {
    input: string;
    output: string;
    symbol: string;
  };
  limits: {
    minTradeSize: number; // SOL
    maxTradeSize: number; // SOL
    maxDailyTrades: number;
    minConfidence: number; // %
    stopLoss: number; // %
    takeProfit: number; // %
  };
  mode: 'DRY_RUN' | 'LIVE';
}

export class AutoTrader {
  private connection: Connection;
  private raydiumClient: RaydiumClient;
  private wallet: Keypair;
  private config: AutoTraderConfig;
  private priceHistory: PriceData[] = [];
  private dailyTradeCount = 0;
  private positions: any[] = [];

  constructor(config: AutoTraderConfig) {
    this.config = config;
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
    this.raydiumClient = new RaydiumClient();
    
    // Load wallet
    try {
      const secretKey = bs58.decode(config.walletPrivateKey);
      this.wallet = Keypair.fromSecretKey(secretKey);
      console.log('✅ Wallet loaded:', this.wallet.publicKey.toString());
    } catch (error) {
      throw new Error('Invalid private key');
    }
  }

  /**
   * Start auto trading
   */
  async start() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 AUTO TRADER STARTING');
    console.log('='.repeat(80));
    console.log(`Mode: ${this.config.mode}`);
    console.log(`Pair: ${this.config.tradingPair.symbol}`);
    console.log(`Min Confidence: ${this.config.limits.minConfidence}%`);
    console.log(`Trade Size: ${this.config.limits.minTradeSize} - ${this.config.limits.maxTradeSize} SOL`);
    console.log('='.repeat(80) + '\n');

    if (this.config.mode === 'LIVE') {
      console.log('⚠️  WARNING: LIVE TRADING MODE - REAL MONEY AT RISK!');
      console.log('⚠️  Press Ctrl+C within 10 seconds to cancel...\n');
      await this.sleep(10000);
    }

    // Check balance
    await this.checkBalance();

    // Main loop
    while (true) {
      try {
        await this.analyze();
        await this.sleep(60000); // Check every 60 seconds
      } catch (error: any) {
        console.error('❌ Error:', error.message);
        await this.sleep(5000);
      }
    }
  }

  /**
   * Analyze market and execute trades
   */
  private async analyze() {
    // Get quote
    const quote = await this.raydiumClient.getQuote(
      this.config.tradingPair.input,
      this.config.tradingPair.output,
      1
    );

    // Update price history
    this.priceHistory.push({ timestamp: Date.now(), price: quote.price });
    if (this.priceHistory.length > 200) this.priceHistory.shift();

    // Need at least 26 points
    if (this.priceHistory.length < 26) {
      console.log(`📊 Collecting data... (${this.priceHistory.length}/26)`);
      return;
    }

    // Calculate indicators
    const prices = this.priceHistory.map(p => p.price);
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const signal = generateTradingSignal(rsi, macd);

    // Display analysis
    console.log('\n' + '-'.repeat(80));
    console.log(`⏰ ${new Date().toLocaleTimeString()}`);
    console.log(`💰 Price: $${quote.price.toFixed(2)}`);
    console.log(`📈 RSI: ${rsi.value.toFixed(2)} (${rsi.signal})`);
    console.log(`📊 MACD: ${macd.histogram.toFixed(4)} (${macd.crossover})`);
    console.log(`🎯 Signal: ${signal.action} (${signal.confidence}%)`);

    // Check if we should trade
    if (signal.confidence >= this.config.limits.minConfidence) {
      if (signal.action === 'STRONG_BUY' || signal.action === 'BUY') {
        await this.executeBuy(quote, signal);
      } else if (signal.action === 'STRONG_SELL' || signal.action === 'SELL') {
        await this.executeSell(quote, signal);
      }
    } else {
      console.log(`⏸️  Confidence too low (${signal.confidence}% < ${this.config.limits.minConfidence}%)`);
    }
  }

  /**
   * Execute buy
   */
  private async executeBuy(quote: any, signal: any) {
    console.log('\n🟢 BUY SIGNAL TRIGGERED!');
    
    // Safety checks
    if (this.dailyTradeCount >= this.config.limits.maxDailyTrades) {
      console.log('⛔ Daily trade limit reached');
      return;
    }

    const tradeSize = this.calculatePositionSize(signal.confidence);
    console.log(`📊 Position size: ${tradeSize.toFixed(4)} SOL`);

    if (this.config.mode === 'DRY_RUN') {
      console.log('🏃 DRY RUN - No actual trade executed');
      this.positions.push({
        type: 'BUY',
        price: quote.price,
        amount: tradeSize,
        timestamp: Date.now(),
        signal: signal
      });
    } else {
      console.log('💸 EXECUTING LIVE TRADE...');
      // TODO: Add actual Raydium swap transaction here
      console.log('⚠️  Live trading not implemented yet - use DRY_RUN mode');
    }

    this.dailyTradeCount++;
  }

  /**
   * Execute sell
   */
  private async executeSell(quote: any, signal: any) {
    console.log('\n🔴 SELL SIGNAL TRIGGERED!');
    
    if (this.positions.length === 0) {
      console.log('⏸️  No positions to sell');
      return;
    }

    if (this.config.mode === 'DRY_RUN') {
      const position = this.positions.pop();
      const profit = ((quote.price - position.price) / position.price) * 100;
      console.log(`💰 Position closed: ${profit > 0 ? '+' : ''}${profit.toFixed(2)}%`);
    } else {
      console.log('💸 EXECUTING LIVE SELL...');
      // TODO: Add actual Raydium swap transaction here
    }
  }

  /**
   * Calculate position size based on confidence
   */
  private calculatePositionSize(confidence: number): number {
    const ratio = confidence / 100;
    const size = this.config.limits.minTradeSize + 
                (this.config.limits.maxTradeSize - this.config.limits.minTradeSize) * ratio;
    return Math.min(size, this.config.limits.maxTradeSize);
  }

  /**
   * Check wallet balance
   */
  private async checkBalance() {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    const sol = balance / LAMPORTS_PER_SOL;
    console.log(`💰 Wallet Balance: ${sol.toFixed(4)} SOL\n`);
    
    if (sol < this.config.limits.minTradeSize) {
      throw new Error('Insufficient balance for trading');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RaydiumClient } from '../raydium/client';
import { getAgentWallet } from '../utils/walletRegistry';
import { calculateRSI, calculateMACD, generateTradingSignal } from '../utils/technicalIndicators';

export interface TradeParams {
  inputMint: string;
  outputMint: string;
  amount: number; // in SOL
  maxSlippage?: number; // in basis points (50 = 0.5%)
}

export interface TradeResult {
  success: boolean;
  signature?: string;
  error?: string;
  quote?: any;
  analysis?: any;
}

export class SafeTradeExecutor {
  private connection: Connection;
  private raydiumClient: RaydiumClient;
  private wallet: any;
  
  // Safety limits
  private readonly MAX_TRADE_SIZE = 1.0; // Max 1 SOL per trade
  private readonly MIN_TRADE_SIZE = 0.01; // Min 0.01 SOL per trade
  private readonly MAX_PRICE_IMPACT = 2.0; // Max 2% price impact
  private readonly REQUIRE_CONFIRMATION = true;

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl);
    this.raydiumClient = new RaydiumClient();
    
    const wallet = getAgentWallet('trading-bot');
    if (!wallet || !wallet.keypair) {
      throw new Error('Trading bot wallet not found or no keypair available');
    }
    this.wallet = wallet;
  }

  /**
   * Execute trade with full safety checks
   */
  async executeTrade(params: TradeParams): Promise<TradeResult> {
    console.log('\n🔒 SAFE TRADE EXECUTION\n');
    console.log('='.repeat(60));
    
    try {
      // Safety check 1: Amount validation
      if (params.amount < this.MIN_TRADE_SIZE) {
        return {
          success: false,
          error: `Trade too small. Minimum: ${this.MIN_TRADE_SIZE} SOL`
        };
      }
      
      if (params.amount > this.MAX_TRADE_SIZE) {
        return {
          success: false,
          error: `Trade too large. Maximum: ${this.MAX_TRADE_SIZE} SOL per trade`
        };
      }

      // Safety check 2: Balance check
      const balance = await this.connection.getBalance(new PublicKey(this.wallet.address));
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log(`💰 Current balance: ${solBalance.toFixed(4)} SOL`);
      
      if (solBalance < params.amount) {
        return {
          success: false,
          error: `Insufficient balance. Have: ${solBalance.toFixed(4)} SOL, Need: ${params.amount} SOL`
        };
      }

      // Safety check 3: Get quote from Raydium
      console.log(`\n📊 Getting quote for ${params.amount} SOL...`);
      const quote = await this.raydiumClient.getQuote(
        params.inputMint,
        params.outputMint,
        params.amount
      );

      console.log(`💵 Price: $${quote.price.toFixed(2)}`);
      console.log(`📉 Price Impact: ${quote.priceImpact.toFixed(2)}%`);

      // Safety check 4: Price impact validation
      if (quote.priceImpact > this.MAX_PRICE_IMPACT) {
        return {
          success: false,
          error: `Price impact too high: ${quote.priceImpact.toFixed(2)}% (max: ${this.MAX_PRICE_IMPACT}%)`
        };
      }

      // Safety check 5: Get technical analysis
      console.log(`\n📈 Running technical analysis...`);
      const prices = [quote.price]; // In real scenario, would have price history
      const rsi = calculateRSI(prices);
      const macd = calculateMACD(prices);
      const signal = generateTradingSignal(rsi, macd);

      console.log(`📊 RSI: ${rsi.value.toFixed(2)} (${rsi.signal})`);
      console.log(`📊 MACD: ${macd.histogram.toFixed(4)} (${macd.crossover})`);
      console.log(`🎯 Signal: ${signal.action} (${signal.confidence}% confidence)`);

      // Safety check 6: Signal confirmation
      if (signal.confidence < 70) {
        console.log(`\n⚠️  Low confidence signal. Skipping trade.`);
        return {
          success: false,
          error: `Signal confidence too low: ${signal.confidence}%`,
          analysis: { rsi, macd, signal }
        };
      }

      // Paper trading mode (safe by default)
      console.log(`\n📝 PAPER TRADE (simulation only)`);
      console.log(`✅ Trade would execute:`);
      console.log(`   Input: ${params.amount} SOL`);
      console.log(`   Output: ~${quote.outputAmount.toFixed(2)} USDC`);
      console.log(`   Price: $${quote.price.toFixed(2)}`);
      console.log(`   Slippage: ${params.maxSlippage || 50} bps`);

      return {
        success: true,
        signature: 'PAPER_TRADE_' + Date.now(),
        quote,
        analysis: { rsi, macd, signal }
      };

    } catch (error: any) {
      console.error('❌ Trade execution error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current portfolio value
   */
  async getPortfolioValue(): Promise<number> {
    const balance = await this.connection.getBalance(new PublicKey(this.wallet.address));
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Check if safe to trade based on market conditions
   */
  async isSafeToTrade(): Promise<{ safe: boolean; reason?: string }> {
    try {
      // Check wallet balance
      const balance = await this.getPortfolioValue();
      if (balance < this.MIN_TRADE_SIZE) {
        return { 
          safe: false, 
          reason: `Insufficient balance: ${balance.toFixed(4)} SOL` 
        };
      }

      // All checks passed
      return { safe: true };

    } catch (error: any) {
      return { 
        safe: false, 
        reason: `Safety check failed: ${error.message}` 
      };
    }
  }
}
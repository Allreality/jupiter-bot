import { JupiterClient } from '../jupiter/client';
import { JupiterQuoteResponse } from '../jupiter/types';
import { SafetyChecker } from '../utils/safety';
import {
  Trade,
  Position,
  Portfolio,
  TradeHistory,
  PaperTradingConfig,
  TradeResult,
} from './types';
import * as fs from 'fs';
import * as path from 'path';

export class PaperTradingManager {
  private config: PaperTradingConfig;
  private portfolio: Portfolio;
  private trades: Trade[] = [];
  private jupiter: JupiterClient;
  private safety: SafetyChecker;

  constructor(
    config: PaperTradingConfig,
    jupiter: JupiterClient,
    safety: SafetyChecker
  ) {
    this.config = config;
    this.jupiter = jupiter;
    this.safety = safety;

    // Initialize portfolio
    this.portfolio = {
      totalValue: config.startingBalance,
      cash: config.startingBalance,
      positions: new Map(),
      totalPnL: 0,
      totalPnLPercent: 0,
      startingBalance: config.startingBalance,
    };

    this.log('Paper Trading Manager initialized');
    this.log(`Starting balance: ${config.startingBalance} ${config.baseCurrency}`);
  }

  /**
   * Execute a paper trade using a Jupiter quote
   */
  async executeTrade(
    quote: JupiterQuoteResponse,
    inputDecimals: number,
    outputDecimals: number,
    inputSymbol: string,
    outputSymbol: string
  ): Promise<TradeResult> {
    // Safety check first
    const safetyResult = this.safety.checkQuoteSafety(
      quote,
      inputDecimals,
      outputDecimals
    );

    if (!safetyResult.safe) {
      this.log('❌ Trade rejected by safety checks');
      return {
        success: false,
        error: 'Trade failed safety checks',
        portfolio: this.portfolio,
      };
    }

    // Calculate amounts
    const inputAmount = this.jupiter.calculateInputAmount(quote, inputDecimals);
    const outputAmount = this.jupiter.calculateOutputAmount(quote, outputDecimals);
    const price = this.jupiter.getPrice(quote, inputDecimals, outputDecimals);
    const priceImpact = this.jupiter.calculatePriceImpact(quote);

    // Check if we have enough balance
    if (inputAmount > this.portfolio.cash) {
      this.log(`❌ Insufficient balance: need ${inputAmount}, have ${this.portfolio.cash}`);
      return {
        success: false,
        error: 'Insufficient balance',
        portfolio: this.portfolio,
      };
    }

    // Create trade record
    const trade: Trade = {
      id: this.generateTradeId(),
      timestamp: new Date(),
      type: 'swap',
      inputToken: quote.inputMint,
      outputToken: quote.outputMint,
      inputAmount,
      outputAmount,
      price,
      priceImpact,
      slippage: quote.slippageBps / 100,
      routes: quote.routePlan.length,
      status: 'executed',
    };

    // Update portfolio
    this.portfolio.cash -= inputAmount;

    // Update or create position
    const existingPosition = this.portfolio.positions.get(outputSymbol);
    if (existingPosition) {
      // Update existing position
      const newAmount = existingPosition.amount + outputAmount;
      const newTotalCost = existingPosition.totalCost + inputAmount;
      const newAveragePrice = newTotalCost / newAmount;

      existingPosition.amount = newAmount;
      existingPosition.totalCost = newTotalCost;
      existingPosition.averagePrice = newAveragePrice;
      existingPosition.currentValue = newAmount * price;
      existingPosition.unrealizedPnL = existingPosition.currentValue - existingPosition.totalCost;
      existingPosition.unrealizedPnLPercent = (existingPosition.unrealizedPnL / existingPosition.totalCost) * 100;
    } else {
      // Create new position
      const newPosition: Position = {
        token: quote.outputMint,
        symbol: outputSymbol,
        amount: outputAmount,
        averagePrice: price,
        totalCost: inputAmount,
        currentValue: outputAmount * price,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
      };
      this.portfolio.positions.set(outputSymbol, newPosition);
    }

    // Update total portfolio value
    this.updatePortfolioValue();

    // Add trade to history
    this.trades.push(trade);

    // Log the trade
    this.log(`✅ Trade executed: ${inputAmount.toFixed(6)} ${inputSymbol} → ${outputAmount.toFixed(6)} ${outputSymbol}`);
    this.log(`   Price: ${price.toFixed(4)} ${outputSymbol}/${inputSymbol}`);
    this.log(`   Portfolio value: ${this.portfolio.totalValue.toFixed(2)} ${this.config.baseCurrency}`);

    return {
      success: true,
      trade,
      portfolio: this.portfolio,
    };
  }

  /**
   * Close a position (sell back to base currency)
   */
  async closePosition(
    symbol: string,
    currentPrice: number,
    amount?: number
  ): Promise<TradeResult> {
    const position = this.portfolio.positions.get(symbol);
    if (!position) {
      return {
        success: false,
        error: `No position found for ${symbol}`,
        portfolio: this.portfolio,
      };
    }

    const closeAmount = amount || position.amount;
    if (closeAmount > position.amount) {
      return {
        success: false,
        error: 'Insufficient position size',
        portfolio: this.portfolio,
      };
    }

    // Calculate proceeds
    const proceeds = closeAmount * currentPrice;
    const costBasis = (position.totalCost / position.amount) * closeAmount;
    const profit = proceeds - costBasis;
    const profitPercent = (profit / costBasis) * 100;

    // Create trade record
    const trade: Trade = {
      id: this.generateTradeId(),
      timestamp: new Date(),
      type: 'sell',
      inputToken: position.token,
      outputToken: this.config.baseCurrency,
      inputAmount: closeAmount,
      outputAmount: proceeds,
      price: currentPrice,
      priceImpact: 0,
      slippage: 0,
      routes: 0,
      status: 'executed',
      profit,
      profitPercent,
    };

    // Update portfolio
    this.portfolio.cash += proceeds;

    // Update position
    if (closeAmount === position.amount) {
      // Close entire position
      this.portfolio.positions.delete(symbol);
    } else {
      // Partial close
      position.amount -= closeAmount;
      position.totalCost -= costBasis;
      position.currentValue = position.amount * currentPrice;
      position.unrealizedPnL = position.currentValue - position.totalCost;
      position.unrealizedPnLPercent = (position.unrealizedPnL / position.totalCost) * 100;
    }

    // Update total portfolio value
    this.updatePortfolioValue();

    // Add trade to history
    this.trades.push(trade);

    // Log the trade
    this.log(`✅ Position closed: ${closeAmount.toFixed(6)} ${symbol} → ${proceeds.toFixed(2)} ${this.config.baseCurrency}`);
    this.log(`   Profit: ${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
    this.log(`   Portfolio value: ${this.portfolio.totalValue.toFixed(2)} ${this.config.baseCurrency}`);

    return {
      success: true,
      trade,
      portfolio: this.portfolio,
    };
  }

  /**
   * Get current portfolio
   */
  getPortfolio(): Portfolio {
    return { ...this.portfolio };
  }

  /**
   * Get trade history statistics
   */
  getTradeHistory(): TradeHistory {
    const successfulTrades = this.trades.filter(t => t.status === 'executed');
    const profitableTrades = successfulTrades.filter(t => (t.profit || 0) > 0);
    const losingTrades = successfulTrades.filter(t => (t.profit || 0) < 0);

    const totalProfit = profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
    const netPnL = totalProfit - totalLoss;

    return {
      trades: this.trades,
      totalTrades: this.trades.length,
      successfulTrades: successfulTrades.length,
      failedTrades: this.trades.filter(t => t.status === 'failed').length,
      totalVolume: successfulTrades.reduce((sum, t) => sum + t.inputAmount, 0),
      totalProfit,
      totalLoss,
      netPnL,
      winRate: profitableTrades.length / successfulTrades.length || 0,
      averageProfit: totalProfit / profitableTrades.length || 0,
      averageLoss: totalLoss / losingTrades.length || 0,
      largestWin: Math.max(...profitableTrades.map(t => t.profit || 0), 0),
      largestLoss: Math.min(...losingTrades.map(t => t.profit || 0), 0),
    };
  }

  /**
   * Print portfolio summary
   */
  printPortfolio(): void {
    console.log('\n📊 PORTFOLIO SUMMARY');
    console.log('===================');
    console.log(`Total Value: ${this.portfolio.totalValue.toFixed(2)} ${this.config.baseCurrency}`);
    console.log(`Cash: ${this.portfolio.cash.toFixed(2)} ${this.config.baseCurrency}`);
    console.log(`Total P&L: ${this.portfolio.totalPnL.toFixed(2)} (${this.portfolio.totalPnLPercent.toFixed(2)}%)`);
    console.log(`\nPositions:`);

    if (this.portfolio.positions.size === 0) {
      console.log('  No open positions');
    } else {
      this.portfolio.positions.forEach((position, symbol) => {
        console.log(`  ${symbol}:`);
        console.log(`    Amount: ${position.amount.toFixed(6)}`);
        console.log(`    Avg Price: ${position.averagePrice.toFixed(4)}`);
        console.log(`    Current Value: ${position.currentValue.toFixed(2)}`);
        console.log(`    Unrealized P&L: ${position.unrealizedPnL.toFixed(2)} (${position.unrealizedPnLPercent.toFixed(2)}%)`);
      });
    }
    console.log('');
  }

  /**
   * Print trade history summary
   */
  printTradeHistory(): void {
    const history = this.getTradeHistory();

    console.log('\n📈 TRADE HISTORY');
    console.log('================');
    console.log(`Total Trades: ${history.totalTrades}`);
    console.log(`Successful: ${history.successfulTrades}`);
    console.log(`Failed: ${history.failedTrades}`);
    console.log(`Win Rate: ${(history.winRate * 100).toFixed(2)}%`);
    console.log(`\nP&L Statistics:`);
    console.log(`  Total Profit: ${history.totalProfit.toFixed(2)}`);
    console.log(`  Total Loss: ${history.totalLoss.toFixed(2)}`);
    console.log(`  Net P&L: ${history.netPnL.toFixed(2)}`);
    console.log(`  Average Win: ${history.averageProfit.toFixed(2)}`);
    console.log(`  Average Loss: ${history.averageLoss.toFixed(2)}`);
    console.log(`  Largest Win: ${history.largestWin.toFixed(2)}`);
    console.log(`  Largest Loss: ${history.largestLoss.toFixed(2)}`);
    console.log('');
  }

  /**
   * Save trading session to file
   */
  saveSession(filename?: string): void {
    const sessionData = {
      config: this.config,
      portfolio: {
        ...this.portfolio,
        positions: Array.from(this.portfolio.positions.entries()),
      },
      trades: this.trades,
      history: this.getTradeHistory(),
      timestamp: new Date().toISOString(),
    };

    const filepath = filename || `paper-trading-session-${Date.now()}.json`;
    const fullPath = path.join(process.cwd(), 'sessions', filepath);

    // Create sessions directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, JSON.stringify(sessionData, null, 2));
    this.log(`✅ Session saved to ${fullPath}`);
  }

  /**
   * Update portfolio total value
   */
  private updatePortfolioValue(): void {
    let positionsValue = 0;
    this.portfolio.positions.forEach(position => {
      positionsValue += position.currentValue;
    });

    this.portfolio.totalValue = this.portfolio.cash + positionsValue;
    this.portfolio.totalPnL = this.portfolio.totalValue - this.portfolio.startingBalance;
    this.portfolio.totalPnLPercent = (this.portfolio.totalPnL / this.portfolio.startingBalance) * 100;
  }

  /**
   * Generate unique trade ID
   */
  private generateTradeId(): string {
    return `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log message
   */
  private log(message: string): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    console.log(logMessage);

    if (this.config.logFile) {
      fs.appendFileSync(this.config.logFile, logMessage + '\n');
    }
  }
}

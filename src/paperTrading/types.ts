// Paper Trading Type Definitions

export interface Trade {
  id: string;
  timestamp: Date;
  type: 'buy' | 'sell' | 'swap';
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  price: number;
  priceImpact: number;
  slippage: number;
  routes: number;
  status: 'pending' | 'executed' | 'failed';
  profit?: number;
  profitPercent?: number;
}

export interface Position {
  token: string;
  symbol: string;
  amount: number;
  averagePrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface Portfolio {
  totalValue: number;
  cash: number;
  positions: Map<string, Position>;
  totalPnL: number;
  totalPnLPercent: number;
  startingBalance: number;
}

export interface TradeHistory {
  trades: Trade[];
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalVolume: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

export interface PaperTradingConfig {
  startingBalance: number;
  baseCurrency: string; // e.g., 'SOL' or 'USDC'
  enableLogging: boolean;
  logFile?: string;
  maxPositionSize?: number; // Max % of portfolio per position
  maxDrawdown?: number; // Stop trading if losses exceed this %
}

export interface TradeResult {
  success: boolean;
  trade?: Trade;
  error?: string;
  portfolio: Portfolio;
}

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface RSIResult {
  value: number;
  signal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): RSIResult {
  if (prices.length < period + 1) {
    return { value: 50, signal: 'NEUTRAL', strength: 'WEAK' };
  }

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      gains += changes[i];
    } else {
      losses += Math.abs(changes[i]);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let signal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  let strength: 'STRONG' | 'MODERATE' | 'WEAK';

  if (rsi < 30) {
    signal = 'OVERSOLD';
    strength = rsi < 20 ? 'STRONG' : 'MODERATE';
  } else if (rsi > 70) {
    signal = 'OVERBOUGHT';
    strength = rsi > 80 ? 'STRONG' : 'MODERATE';
  } else {
    signal = 'NEUTRAL';
    strength = 'WEAK';
  }

  return { value: rsi, signal, strength };
}

/**
 * Calculate EMA
 */
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  ema.push(sum / period);

  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(currentEMA);
  }

  return ema;
}

/**
 * Calculate MACD
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  if (prices.length < slowPeriod) {
    return { macd: 0, signal: 0, histogram: 0, crossover: 'NEUTRAL' };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = [];
  const startIndex = slowPeriod - fastPeriod;
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + startIndex] - slowEMA[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);

  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const histogram = macd - signal;

  let crossover: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (macdLine.length > 1 && signalLine.length > 1) {
    const prevMACD = macdLine[macdLine.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];

    if (prevMACD <= prevSignal && macd > signal) {
      crossover = 'BULLISH';
    } else if (prevMACD >= prevSignal && macd < signal) {
      crossover = 'BEARISH';
    }
  }

  return { macd, signal, histogram, crossover };
}

/**
 * Generate trading signal
 */
export function generateTradingSignal(rsi: RSIResult, macd: MACDResult): {
  action: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  if (rsi.signal === 'OVERSOLD') {
    score += rsi.strength === 'STRONG' ? 2 : 1;
    reasons.push(`RSI oversold (${rsi.value.toFixed(2)})`);
  } else if (rsi.signal === 'OVERBOUGHT') {
    score -= rsi.strength === 'STRONG' ? 2 : 1;
    reasons.push(`RSI overbought (${rsi.value.toFixed(2)})`);
  }

  if (macd.crossover === 'BULLISH') {
    score += 2;
    reasons.push('MACD bullish crossover');
  } else if (macd.crossover === 'BEARISH') {
    score -= 2;
    reasons.push('MACD bearish crossover');
  }

  if (macd.histogram > 0) {
    score += 0.5;
    reasons.push('MACD histogram positive');
  } else {
    score -= 0.5;
    reasons.push('MACD histogram negative');
  }

  let action: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  let confidence: number;

  if (score >= 3) {
    action = 'STRONG_BUY';
    confidence = Math.min(95, 70 + score * 5);
  } else if (score >= 1) {
    action = 'BUY';
    confidence = 60 + score * 5;
  } else if (score <= -3) {
    action = 'STRONG_SELL';
    confidence = Math.min(95, 70 + Math.abs(score) * 5);
  } else if (score <= -1) {
    action = 'SELL';
    confidence = 60 + Math.abs(score) * 5;
  } else {
    action = 'HOLD';
    confidence = 50;
  }

  return { action, confidence, reasons };
}
import { calculateRSI, calculateMACD, generateTradingSignal } from './technicalIndicators';

describe('Technical Indicators', () => {
  describe('RSI Calculation', () => {
    test('should calculate RSI correctly with known data', () => {
      // Known test data with expected RSI ~70 (overbought)
      const prices = [
        44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
        45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64
      ];
      
      const result = calculateRSI(prices);
      
      // RSI should be between 0 and 100
      expect(result.value).toBeGreaterThanOrEqual(0);
      expect(result.value).toBeLessThanOrEqual(100);
      
      // With upward trending data, RSI should be > 50
      expect(result.value).toBeGreaterThan(50);
      
      console.log('RSI Test Result:', result);
    });

    test('should detect oversold conditions', () => {
      // Declining prices should give low RSI
      const prices = [
        50, 49, 48, 47, 46, 45, 44, 43, 42, 41,
        40, 39, 38, 37, 36, 35, 34, 33, 32, 31
      ];
      
      const result = calculateRSI(prices);
      
      expect(result.value).toBeLessThan(30);
      expect(result.signal).toBe('OVERSOLD');
      
      console.log('Oversold Test:', result);
    });

    test('should detect overbought conditions', () => {
      // Rising prices should give high RSI
      const prices = [
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49
      ];
      
      const result = calculateRSI(prices);
      
      expect(result.value).toBeGreaterThan(70);
      expect(result.signal).toBe('OVERBOUGHT');
      
      console.log('Overbought Test:', result);
    });
  });

  describe('MACD Calculation', () => {
    test('should calculate MACD with sufficient data', () => {
      // Need at least 26 data points for MACD
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 5) * 10);
      
      const result = calculateMACD(prices);
      
      expect(result.macd).toBeDefined();
      expect(result.signal).toBeDefined();
      expect(result.histogram).toBeDefined();
      
      console.log('MACD Test Result:', result);
    });

    test('should detect bullish crossover', () => {
      // Create data that trends up at the end
      const prices = [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 101, 102, 103, 104,
        105, 106, 107, 108, 109, 110, 111, 112, 113, 114
      ];
      
      const result = calculateMACD(prices);
      
      // MACD line should be above signal line (positive histogram)
      expect(result.histogram).toBeGreaterThan(0);
      
      console.log('Bullish MACD Test:', result);
    });
  });

  describe('Signal Generation', () => {
    test('should generate STRONG_BUY on oversold RSI + bullish MACD', () => {
      const rsi = { value: 25, signal: 'OVERSOLD' as const, strength: 'STRONG' as const };
      const macd = { macd: 1, signal: 0.5, histogram: 0.5, crossover: 'BULLISH' as const };
      
      const result = generateTradingSignal(rsi, macd);
      
      expect(result.action).toBe('STRONG_BUY');
      expect(result.confidence).toBeGreaterThan(70);
      
      console.log('Strong Buy Signal Test:', result);
    });

    test('should generate STRONG_SELL on overbought RSI + bearish MACD', () => {
      const rsi = { value: 80, signal: 'OVERBOUGHT' as const, strength: 'STRONG' as const };
      const macd = { macd: -1, signal: -0.5, histogram: -0.5, crossover: 'BEARISH' as const };
      
      const result = generateTradingSignal(rsi, macd);
      
      expect(result.action).toBe('STRONG_SELL');
      expect(result.confidence).toBeGreaterThan(70);
      
      console.log('Strong Sell Signal Test:', result);
    });
  });
});

import { JupiterQuoteResponse, SafetyCheck, SafetyCheckResult } from '../jupiter/types';

export interface SafetyConfig {
  maxPriceImpactPercent: number;  // Max acceptable price impact (e.g., 1.0 = 1%)
  maxSlippageBps: number;          // Max slippage in basis points (e.g., 100 = 1%)
  minRouteCount: number;           // Minimum number of routes to consider
  minOutputRatio: number;          // Min output/input ratio (e.g., 0.95 = 95%)
  warnPriceImpactPercent: number;  // Warning threshold for price impact
  warnSlippageBps: number;         // Warning threshold for slippage
}

export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  maxPriceImpactPercent: 2.0,      // 2% max price impact
  maxSlippageBps: 100,              // 1% max slippage
  minRouteCount: 1,                 // At least 1 route
  minOutputRatio: 0.90,             // Expect at least 90% of theoretical output
  warnPriceImpactPercent: 1.0,      // Warn at 1% price impact
  warnSlippageBps: 50,              // Warn at 0.5% slippage
};

export class SafetyChecker {
  private config: SafetyConfig;

  constructor(config: SafetyConfig = DEFAULT_SAFETY_CONFIG) {
    this.config = config;
  }

  /**
   * Perform all safety checks on a quote
   * @param quote - Jupiter quote to validate
   * @param inputDecimals - Input token decimals
   * @param outputDecimals - Output token decimals
   * @returns Safety check results
   */
  checkQuoteSafety(
    quote: JupiterQuoteResponse,
    inputDecimals: number,
    outputDecimals: number
  ): SafetyCheckResult {
    const priceImpact = this.checkPriceImpact(quote);
    const slippage = this.checkSlippage(quote);
    const routeCount = this.checkRouteCount(quote);
    const outputAmount = this.checkOutputAmount(quote, inputDecimals, outputDecimals);
    const liquidityDepth = this.checkLiquidityDepth(quote);

    const allChecks = [priceImpact, slippage, routeCount, outputAmount, liquidityDepth];
    const safe = !allChecks.some(check => check.severity === 'error' && !check.passed);

    return {
      safe,
      checks: {
        priceImpact,
        slippage,
        routeCount,
        outputAmount,
        liquidityDepth,
      },
    };
  }

  /**
   * Check if price impact is within acceptable range
   */
  private checkPriceImpact(quote: JupiterQuoteResponse): SafetyCheck {
    const priceImpactPct = Math.abs(parseFloat(quote.priceImpactPct) * 100);

    if (priceImpactPct > this.config.maxPriceImpactPercent) {
      return {
        passed: false,
        reason: `Price impact ${priceImpactPct.toFixed(2)}% exceeds maximum ${this.config.maxPriceImpactPercent}%`,
        severity: 'error',
      };
    }

    if (priceImpactPct > this.config.warnPriceImpactPercent) {
      return {
        passed: true,
        reason: `Price impact ${priceImpactPct.toFixed(2)}% is above warning threshold ${this.config.warnPriceImpactPercent}%`,
        severity: 'warning',
      };
    }

    return {
      passed: true,
      reason: `Price impact ${priceImpactPct.toFixed(2)}% is acceptable`,
      severity: 'info',
    };
  }

  /**
   * Check if slippage tolerance is within acceptable range
   */
  private checkSlippage(quote: JupiterQuoteResponse): SafetyCheck {
    const slippageBps = quote.slippageBps;

    if (slippageBps > this.config.maxSlippageBps) {
      return {
        passed: false,
        reason: `Slippage ${slippageBps}bps exceeds maximum ${this.config.maxSlippageBps}bps`,
        severity: 'error',
      };
    }

    if (slippageBps > this.config.warnSlippageBps) {
      return {
        passed: true,
        reason: `Slippage ${slippageBps}bps is above warning threshold ${this.config.warnSlippageBps}bps`,
        severity: 'warning',
      };
    }

    return {
      passed: true,
      reason: `Slippage ${slippageBps}bps is acceptable`,
      severity: 'info',
    };
  }

  /**
   * Check if there are enough routes available
   */
  private checkRouteCount(quote: JupiterQuoteResponse): SafetyCheck {
    const routeCount = quote.routePlan.length;

    if (routeCount < this.config.minRouteCount) {
      return {
        passed: false,
        reason: `Only ${routeCount} route(s) found, minimum is ${this.config.minRouteCount}`,
        severity: 'error',
      };
    }

    return {
      passed: true,
      reason: `Found ${routeCount} route(s)`,
      severity: 'info',
    };
  }

  /**
   * Check if output amount is reasonable
   */
  private checkOutputAmount(
    quote: JupiterQuoteResponse,
    inputDecimals: number,
    outputDecimals: number
  ): SafetyCheck {
    const inputAmount = parseInt(quote.inAmount) / Math.pow(10, inputDecimals);
    const outputAmount = parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
    
    // This is a simplified check - in reality you'd want to compare against
    // expected market prices from an oracle or price feed
    const ratio = outputAmount / inputAmount;

    if (ratio < this.config.minOutputRatio && ratio > 0) {
      return {
        passed: false,
        reason: `Output ratio ${ratio.toFixed(4)} is below minimum ${this.config.minOutputRatio}`,
        severity: 'warning',
      };
    }

    return {
      passed: true,
      reason: `Output amount ${outputAmount.toFixed(6)} appears reasonable`,
      severity: 'info',
    };
  }

  /**
   * Check liquidity depth by analyzing route splits
   */
  private checkLiquidityDepth(quote: JupiterQuoteResponse): SafetyCheck {
    // If the swap is split across many routes, it might indicate low liquidity
    const splitCount = quote.routePlan.length;
    
    if (splitCount > 5) {
      return {
        passed: true,
        reason: `Swap split across ${splitCount} routes - may indicate fragmented liquidity`,
        severity: 'warning',
      };
    }

    return {
      passed: true,
      reason: `Liquidity depth appears adequate (${splitCount} route(s))`,
      severity: 'info',
    };
  }

  /**
   * Print safety check results to console
   */
  printSafetyReport(result: SafetyCheckResult): void {
    console.log('\n=== SAFETY CHECK REPORT ===');
    console.log(`Overall Status: ${result.safe ? '✅ SAFE' : '❌ UNSAFE'}`);
    console.log('\nDetailed Checks:');

    Object.entries(result.checks).forEach(([name, check]) => {
      const icon = check.severity === 'error' ? '❌' : 
                   check.severity === 'warning' ? '⚠️' : '✅';
      console.log(`${icon} ${name}: ${check.reason}`);
    });

    console.log('========================\n');
  }

  /**
   * Compare multiple quotes and select the safest one
   */
  selectSafestQuote(
    quotes: JupiterQuoteResponse[],
    inputDecimals: number,
    outputDecimals: number
  ): { quote: JupiterQuoteResponse; safety: SafetyCheckResult } | null {
    const quotesWithSafety = quotes.map(quote => ({
      quote,
      safety: this.checkQuoteSafety(quote, inputDecimals, outputDecimals),
    }));

    // Filter to only safe quotes
    const safeQuotes = quotesWithSafety.filter(q => q.safety.safe);

    if (safeQuotes.length === 0) {
      return null;
    }

    // Sort by output amount (highest first)
    safeQuotes.sort((a, b) => {
      const aOut = parseInt(a.quote.outAmount);
      const bOut = parseInt(b.quote.outAmount);
      return bOut - aOut;
    });

    return safeQuotes[0];
  }
}

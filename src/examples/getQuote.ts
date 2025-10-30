import { JupiterClient } from '../jupiter/client';
import { SafetyChecker } from '../utils/safety';
import { CONFIG, TOKENS } from '../config/config';

async function main() {
  console.log('🚀 Jupiter Quote Example\n');

  // Initialize Jupiter client
  const jupiter = new JupiterClient(CONFIG.jupiterApiUrl);
  const safety = new SafetyChecker(CONFIG.safety);

  try {
    // Example: Get quote for swapping 0.1 SOL to USDC
    const inputAmount = 0.1; // 0.1 SOL
    const inputDecimals = 9;  // SOL has 9 decimals
    const outputDecimals = 6; // USDC has 6 decimals

    console.log(`Fetching quote for ${inputAmount} SOL → USDC...\n`);

    // Convert to lamports (smallest unit)
    const amountInLamports = inputAmount * Math.pow(10, inputDecimals);

    // Get quote
    const quote = await jupiter.getQuote({
      inputMint: TOKENS.SOL,
      outputMint: TOKENS.USDC,
      amount: amountInLamports,
      slippageBps: CONFIG.defaultSlippageBps,
    });

    // Display quote information
    console.log('📊 QUOTE DETAILS:');
    console.log('================');
    
    const inputAmountHuman = jupiter.calculateInputAmount(quote, inputDecimals);
    const outputAmountHuman = jupiter.calculateOutputAmount(quote, outputDecimals);
    const price = jupiter.getPrice(quote, inputDecimals, outputDecimals);
    const priceImpact = jupiter.calculatePriceImpact(quote);

    console.log(`Input:  ${inputAmountHuman.toFixed(6)} SOL`);
    console.log(`Output: ${outputAmountHuman.toFixed(6)} USDC`);
    console.log(`Price:  ${price.toFixed(4)} USDC per SOL`);
    console.log(`Price Impact: ${priceImpact.toFixed(4)}%`);
    console.log(`Slippage: ${quote.slippageBps} bps (${(quote.slippageBps / 100).toFixed(2)}%)`);
    console.log(`Routes: ${quote.routePlan.length}`);

    // Show route information
    console.log('\n🛣️  ROUTE PLAN:');
    quote.routePlan.forEach((route, index) => {
      console.log(`  Route ${index + 1}: ${route.swapInfo.label} (${route.percent}%)`);
    });

    // Perform safety checks
    const safetyResult = safety.checkQuoteSafety(quote, inputDecimals, outputDecimals);
    safety.printSafetyReport(safetyResult);

    if (safetyResult.safe) {
      console.log('✅ This quote passed all safety checks and would be safe to execute.');
    } else {
      console.log('❌ This quote FAILED safety checks. Do NOT execute this trade!');
    }

  } catch (error) {
    console.error('❌ Error fetching quote:', error);
    process.exit(1);
  }
}

// Run the example
main();

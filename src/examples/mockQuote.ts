import { SafetyChecker } from '../utils/safety';
import { CONFIG, TOKENS } from '../config/config';
import { JupiterQuoteResponse } from '../jupiter/types';

// Mock quote data (example of what Jupiter returns)
const mockQuote: JupiterQuoteResponse = {
  inputMint: 'So11111111111111111111111111111111111111112',
  inAmount: '100000000', // 0.1 SOL in lamports
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  outAmount: '24567890', // ~24.56 USDC (6 decimals)
  otherAmountThreshold: '24323211',
  swapMode: 'ExactIn',
  slippageBps: 50,
  platformFee: null,
  priceImpactPct: '0.000234', // 0.0234%
  routePlan: [
    {
      swapInfo: {
        ammKey: 'EiEAydLqSKFqRPpuwYoVxEJ6h9UZh9tsTaHgs4f8b8Z5',
        label: 'Orca',
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        inAmount: '60000000',
        outAmount: '14740734',
        feeAmount: '0',
        feeMint: 'So11111111111111111111111111111111111111112',
      },
      percent: 60,
    },
    {
      swapInfo: {
        ammKey: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
        label: 'Raydium',
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        inAmount: '40000000',
        outAmount: '9827156',
        feeAmount: '0',
        feeMint: 'So11111111111111111111111111111111111111112',
      },
      percent: 40,
    },
  ],
};

async function main() {
  console.log('🚀 Jupiter Quote Example (Mock Data)\n');
  console.log('⚠️  This is using MOCK data since the Jupiter API is not reachable.');
  console.log('    Once your network is configured, this will fetch real quotes.\n');

  const safety = new SafetyChecker(CONFIG.safety);

  try {
    const inputDecimals = 9;  // SOL has 9 decimals
    const outputDecimals = 6; // USDC has 6 decimals

    // Display quote information
    console.log('📊 QUOTE DETAILS (Mock):');
    console.log('========================');
    
    const inputAmount = parseInt(mockQuote.inAmount) / Math.pow(10, inputDecimals);
    const outputAmount = parseInt(mockQuote.outAmount) / Math.pow(10, outputDecimals);
    const price = outputAmount / inputAmount;
    const priceImpact = parseFloat(mockQuote.priceImpactPct) * 100;

    console.log(`Input:  ${inputAmount.toFixed(6)} SOL`);
    console.log(`Output: ${outputAmount.toFixed(6)} USDC`);
    console.log(`Price:  ${price.toFixed(4)} USDC per SOL`);
    console.log(`Price Impact: ${priceImpact.toFixed(4)}%`);
    console.log(`Slippage: ${mockQuote.slippageBps} bps (${(mockQuote.slippageBps / 100).toFixed(2)}%)`);
    console.log(`Routes: ${mockQuote.routePlan.length}`);

    // Show route information
    console.log('\n🛣️  ROUTE PLAN:');
    mockQuote.routePlan.forEach((route, index) => {
      console.log(`  Route ${index + 1}: ${route.swapInfo.label} (${route.percent}%)`);
    });

    // Perform safety checks
    const safetyResult = safety.checkQuoteSafety(mockQuote, inputDecimals, outputDecimals);
    safety.printSafetyReport(safetyResult);

    if (safetyResult.safe) {
      console.log('✅ This quote passed all safety checks and would be safe to execute.');
    } else {
      console.log('❌ This quote FAILED safety checks. Do NOT execute this trade!');
    }

    console.log('\n💡 TIP: Once your network is working, run "npm run quote" to fetch real quotes!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the example
main();

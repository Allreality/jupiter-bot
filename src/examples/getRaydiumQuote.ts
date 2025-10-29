import { RaydiumClient, RAYDIUM_TOKENS } from '../raydium/client';

async function main() {
  console.log('🚀 Raydium Quote Example\n');

  const client = new RaydiumClient();

  try {
    // Get quote for 0.1 SOL → USDC
    console.log('Fetching quote for 0.1 SOL → USDC...\n');
    
    const quote = await client.getQuote(
      RAYDIUM_TOKENS.SOL,
      RAYDIUM_TOKENS.USDC,
      0.1
    );

    console.log('📊 QUOTE DETAILS:');
    console.log('========================');
    console.log(`Input:  ${quote.inputAmount.toFixed(6)} SOL`);
    console.log(`Output: ${quote.outputAmount.toFixed(6)} USDC`);
    console.log(`Price:  ${quote.price.toFixed(4)} USDC per SOL`);
    console.log(`Price Impact: ${quote.priceImpact.toFixed(4)}%`);
    console.log(`Route: ${quote.route}`);
    console.log('========================\n');

    console.log('✅ Successfully fetched quote from Raydium!');
    
  } catch (error) {
    console.error('❌ Error fetching quote:', error);
  }
}

main();

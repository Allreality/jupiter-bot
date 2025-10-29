import axios from 'axios';

async function debug() {
  console.log('🔍 Debugging Raydium API Response\n');

  try {
    const response = await axios.get('https://api.raydium.io/v2/main/pairs');
    const pairs = response.data;

    console.log(`Total pairs found: ${pairs.length}\n`);
    
    // Find SOL/USDC pairs
    const solPairs = pairs.filter((p: any) => 
      p.name && (p.name.includes('SOL') || p.name.includes('USDC'))
    ).slice(0, 5);

    console.log('Sample SOL/USDC pairs:\n');
    solPairs.forEach((pair: any, i: number) => {
      console.log(`Pair ${i + 1}:`);
      console.log(JSON.stringify(pair, null, 2));
      console.log('---\n');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debug();

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAgentWallet } from '../utils/walletRegistry';

async function checkWallet() {
  console.log('💰 Trading Bot Wallet Status\n');
  console.log('='.repeat(60));
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = getAgentWallet('trading-bot');
  
  if (!wallet) {
    console.log('❌ Wallet not found!');
    return;
  }
  
  console.log('📍 Address:', wallet.address);
  console.log('🔑 Agent ID:', wallet.agentId);
  console.log('📋 Type:', wallet.type);
  console.log('💵 Daily Limit:', `$${wallet.dailyLimit}\n`);
  
  try {
    const publicKey = new PublicKey(wallet.address);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    console.log('💎 Current Balance:');
    console.log(`   ${solBalance.toFixed(6)} SOL`);
    console.log(`   ${balance.toLocaleString()} lamports\n`);
    
    // Estimate USD value (approximate)
    const solPrice = 190; // Update with current price
    const usdValue = solBalance * solPrice;
    console.log(`💵 Estimated Value: $${usdValue.toFixed(2)} USD\n`);
    
    console.log('✅ Wallet is funded and ready for trading!');
    console.log('⚠️  Remember: Start with small test trades!\n');
    
  } catch (error: any) {
    console.error('❌ Error checking balance:', error.message);
  }
}

checkWallet();

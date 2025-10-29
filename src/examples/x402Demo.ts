/**
 * x402 Middleware Demo
 * Example showing how to use the x402 payment system
 */

import { createX402Handler } from '../middleware/x402Handler';
import { getAllWallets, getAgentWallet } from '../utils/walletRegistry';
import { getAllLogs, getPaymentStats, exportToCSV } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

async function demo() {
  console.log('\n🚀 x402 Middleware Demo\n');
  console.log('════════════════════════════════════════\n');

  // 1. Show registered wallets
  console.log('📋 Registered Agent Wallets:');
  const wallets = getAllWallets();
  wallets.forEach(wallet => {
    console.log(`  • ${wallet.name} (${wallet.agentId})`);
    console.log(`    Address: ${wallet.publicKey}`);
    console.log(`    Type: ${wallet.type}`);
    if (wallet.spendingLimit) {
      console.log(`    Daily Limit: $${wallet.spendingLimit}`);
    }
    console.log('');
  });

  // 2. Create x402 handler for an agent

  // Show MIDNIGHT agents specifically
  console.log('════════════════════════════════════════\n');
  console.log('🌙 MIDNIGHT INFRASTRUCTURE Agents:');
  const midnightAgents = wallets.filter(w => w.agentId.startsWith('midnight-'));
  midnightAgents.forEach(agent => {
    console.log(`  • ${agent.name} (${agent.agentId})`);
    console.log(`    Address: ${agent.publicKey}`);
    console.log(`    Revenue Split: Agent 90% | Treasury 10%`);
    if (agent.services && agent.services.length > 0) {
      console.log(`    Services: ${agent.services.join(', ')}`);
    }
    console.log('');
  });
  console.log('════════════════════════════════════════\n');
  console.log('🤖 Creating x402 Handler for trading-bot...\n');
  
  const handler = createX402Handler('trading-bot');

  // 3. Check service pricing
  console.log('💰 Checking Service Pricing:');
  const servicePrice = await handler.checkServicePrice('premium-api-access');
  if (servicePrice) {
    console.log(`  Service: ${servicePrice.serviceId}`);
    console.log(`  Price: ${servicePrice.amount} ${servicePrice.currency}`);
    console.log(`  Recipient: ${servicePrice.recipient}`);
    console.log('');
  }

  // 4. Show payment logs
  console.log('════════════════════════════════════════\n');
  console.log('📝 Payment Audit Trail:');
  const logs = getAllLogs();
  
  if (logs.length === 0) {
    console.log('  No payments logged yet.\n');
  } else {
    logs.slice(-5).forEach(log => {
      console.log(`  • ${log.timestamp}`);
      console.log(`    Agent: ${log.agentId}`);
      console.log(`    Service: ${log.serviceId}`);
      console.log(`    Amount: ${log.amount} ${log.currency}`);
      console.log(`    Tx: ${log.txHash.substring(0, 20)}...`);
      console.log('');
    });
  }

  // 5. Show payment statistics
  console.log('════════════════════════════════════════\n');
  console.log('📊 Payment Statistics:');
  const stats = getPaymentStats();
  console.log(`  Total Payments: ${stats.totalPayments}`);
  console.log(`  Unique Agents: ${stats.uniqueAgents}`);
  console.log(`  Unique Services: ${stats.uniqueServices}`);
  
  if (Object.keys(stats.totalVolume).length > 0) {
    console.log('\n  Total Volume:');
    Object.keys(stats.totalVolume).forEach(currency => {
      console.log(`    ${currency}: ${stats.totalVolume[currency]}`);
    });
    console.log('\n  Average Payment:');
    Object.keys(stats.averagePayment).forEach(currency => {
      console.log(`    ${currency}: ${stats.averagePayment[currency].toFixed(4)}`);
    });
  }
  console.log('');

  console.log('════════════════════════════════════════');
  console.log('\n✨ Demo Complete!\n');
  console.log('Next Steps:');
  console.log('  1. Configure your .env file with private keys');
  console.log('  2. Integrate x402Handler into your API clients');
  console.log('  3. Add more services to serviceRegistry.json');
  console.log('  4. Monitor spending with the dashboard panels\n');
}

// Run demo
if (require.main === module) {
  demo().catch(console.error);
}

export { demo };
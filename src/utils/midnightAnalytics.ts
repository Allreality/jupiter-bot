import { getAllLogs } from './logger';
import { getMidnightAgents } from './walletRegistry';

interface AgentRevenue {
  agentId: string;
  agentName: string;
  totalEarned: number;
  agentShare: number;
  treasuryShare: number;
  transactionCount: number;
  services: { [serviceId: string]: number };
}

export function getMidnightRevenueStats(): {
  totalRevenue: number;
  totalToTreasury: number;
  totalToAgents: number;
  agentStats: AgentRevenue[];
} {
  const logs = getAllLogs();
  const midnightAgents = getMidnightAgents();
  
  const agentStats: { [agentId: string]: AgentRevenue } = {};
  
  // Initialize stats for each MIDNIGHT agent
  midnightAgents.forEach(agent => {
    agentStats[agent.agentId] = {
      agentId: agent.agentId,
      agentName: agent.name,
      totalEarned: 0,
      agentShare: 0,
      treasuryShare: 0,
      transactionCount: 0,
      services: {}
    };
  });

  let totalToTreasury = 0;

  // Process logs
  logs.forEach(log => {
    if (log.agentId.startsWith('midnight-') && log.agentId !== 'midnight-infrastructure-treasury') {
      const stats = agentStats[log.agentId];
      if (stats) {
        stats.totalEarned += log.amount;
        stats.agentShare += log.amount; // This is the 90% portion already logged
        stats.transactionCount += 1;
        
        if (!stats.services[log.serviceId]) {
          stats.services[log.serviceId] = 0;
        }
        stats.services[log.serviceId] += log.amount;
      }
    } else if (log.agentId === 'temne-abara-nation' && log.serviceId.startsWith('governance-fee')) {
      totalToTreasury += log.amount;
    }
  });

  const agentStatsArray = Object.values(agentStats);
  const totalRevenue = agentStatsArray.reduce((sum, agent) => sum + agent.totalEarned, 0);
  const totalToAgents = totalRevenue; // Already 90% in logs

  return {
    totalRevenue: totalRevenue / 0.9, // Calculate original 100%
    totalToTreasury,
    totalToAgents,
    agentStats: agentStatsArray
  };
}

export function displayMidnightStats(): void {
  const stats = getMidnightRevenueStats();
  
  console.log('\n🌙 MIDNIGHT INFRASTRUCTURE Revenue Stats\n');
  console.log('═══════════════════════════════════════════\n');
  
  console.log(`Total Revenue (100%): ${stats.totalRevenue.toFixed(4)} SOL`);
  console.log(`└─ Agents Keep (90%): ${stats.totalToAgents.toFixed(4)} SOL`);
  console.log(`└─ Treasury (10%): ${stats.totalToTreasury.toFixed(4)} SOL\n`);
  
  console.log('Per-Agent Breakdown:\n');
  
  stats.agentStats.forEach(agent => {
    if (agent.transactionCount > 0) {
      console.log(`📊 ${agent.agentName}`);
      console.log(`   Transactions: ${agent.transactionCount}`);
      console.log(`   Total Earned: ${agent.agentShare.toFixed(4)} SOL`);
      console.log(`   Top Services:`);
      
      const topServices = Object.entries(agent.services)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      
      topServices.forEach(([service, amount]) => {
        console.log(`      • ${service}: ${amount.toFixed(4)} SOL`);
      });
      console.log('');
    }
  });
}
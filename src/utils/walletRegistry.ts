import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export interface AgentWallet {
  name: string;
  address: string;
  publicKey?: string;
  role: string;
  dailyLimit: number;
  spendingLimit?: number;
  agentId?: string;
  type?: string;
  services?: string[];
  keypair?: Keypair;
}

export interface WalletWithKeypair extends AgentWallet {
  keypair: Keypair;
  address: string;
  agentId: string;
  type: string;
  publicKey: string;
}

const walletRegistry: AgentWallet[] = [
  {
    name: 'trading-bot',
    address: 'TradeBotxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'TradeBotxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'trading-bot-001',
    type: 'trading',
    role: 'Automated Trading',
    dailyLimit: 100,
    spendingLimit: 100
  },
  {
    name: 'liquidity-manager',
    address: 'LiquidityMgrxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'LiquidityMgrxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'liquidity-mgr-001',
    type: 'liquidity',
    role: 'LP Management',
    dailyLimit: 500,
    spendingLimit: 500
  },
  {
    name: 'arbitrage-bot',
    address: 'ArbitrageBotxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'ArbitrageBotxxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'arbitrage-bot-001',
    type: 'arbitrage',
    role: 'Cross-DEX Arbitrage',
    dailyLimit: 200,
    spendingLimit: 200
  },
  {
    name: 'market-maker',
    address: 'MarketMakerxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'MarketMakerxxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'market-maker-001',
    type: 'market-making',
    role: 'Order Book MM',
    dailyLimit: 300,
    spendingLimit: 300
  },
  {
    name: 'yield-optimizer',
    address: 'YieldOptimizerxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'YieldOptimizerxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'yield-optimizer-001',
    type: 'yield',
    role: 'Yield Farming',
    dailyLimit: 150,
    spendingLimit: 150
  },
  {
    name: 'risk-manager',
    address: 'RiskManagerxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'RiskManagerxxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'risk-manager-001',
    type: 'risk',
    role: 'Portfolio Risk',
    dailyLimit: 50,
    spendingLimit: 50
  },
  {
    name: 'fee-collector',
    address: 'FeeCollectorxxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'FeeCollectorxxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'fee-collector-001',
    type: 'revenue',
    role: 'Revenue Collection',
    dailyLimit: 1000,
    spendingLimit: 1000
  },
  {
    name: 'midnight-zkproof',
    address: 'MidnightZKProofxxxxxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'MidnightZKProofxxxxxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'midnight-zkproof-001',
    type: 'midnight',
    role: 'zkProof Consulting',
    dailyLimit: 200,
    spendingLimit: 200,
    services: ['zkProof consulting', 'Privacy analysis']
  },
  {
    name: 'midnight-compliance',
    address: 'MidnightCompliancexxxxxxxxxxxxxxxxxxxxxx',
    publicKey: 'MidnightCompliancexxxxxxxxxxxxxxxxxxxxxx',
    agentId: 'midnight-compliance-001',
    type: 'midnight',
    role: 'Compliance Oracle',
    dailyLimit: 500,
    spendingLimit: 500,
    services: ['Regulatory compliance', 'Risk assessment']
  }
];

export function getAgentWallet(name: string): WalletWithKeypair | null {
  const wallet = walletRegistry.find(w => w.name === name);
  if (!wallet) return null;

  // Try to load keypair from environment
  const privateKeyEnv = `${name.toUpperCase().replace('-', '_')}_PRIVATE_KEY`;
  const privateKey = process.env[privateKeyEnv] || process.env.WALLET_PRIVATE_KEY;

  let keypair: Keypair;
  
  if (privateKey) {
    try {
      keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    } catch (error) {
      console.error(`Failed to load keypair for ${name}:`, error);
      keypair = Keypair.generate();
    }
  } else {
    keypair = Keypair.generate();
  }

  return {
    ...wallet,
    keypair,
    address: wallet.address,
    publicKey: wallet.publicKey || wallet.address,
    agentId: wallet.agentId || `${name}-001`,
    type: wallet.type || 'general'
  } as WalletWithKeypair;
}

export function getAllWallets(): AgentWallet[] {
  return [...walletRegistry];
}

export function getWalletByAddress(address: string): AgentWallet | null {
  return walletRegistry.find(w => w.address === address) || null;
}

export function getMidnightAgents(): AgentWallet[] {
  return walletRegistry.filter(w => w.agentId?.startsWith('midnight-'));
}
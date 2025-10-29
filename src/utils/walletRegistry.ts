import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

interface AgentWallet {
  agentId: string;
  publicKey: string;
  name: string;
  type: 'treasury' | 'agent' | 'multisig';
  spendingLimit?: number;
  permissions?: string[];
  services?: string[];
  revenueShare?: number;
  governanceFee?: number;
  createdAt: string;
}

interface WalletWithKeypair extends AgentWallet {
  keypair?: Keypair;
}

const walletRegistry: AgentWallet[] = [
  {
    agentId: 'temne-abara-nation',
    publicKey: '6QKbYCqU3SDp1jgcFGcRRwpekQY2CEVK7AMVHpU8iWSH',
    name: 'Temne Abara Nation Treasury',
    type: 'treasury',
    revenueShare: 0.10,
    permissions: ['send', 'receive', 'governance', 'delegate'],
    createdAt: '2025-10-29T00:00:00Z'
  },
  {
    agentId: 'midnitebotbank',
    publicKey: '3Amc3tkRvijtrRtE6XVAkYd8UxF9VKqm7mqDdyT6FPWm',
    name: 'Midnitebotbank Operational Reserve',
    type: 'treasury',
    permissions: ['send', 'receive', 'fund-agents'],
    createdAt: '2025-10-29T00:00:00Z'
  },
  {
    agentId: 'trading-bot',
    publicKey: '3AxdPSVxZWFRJUhw3BbRA69vbMvVCQBeSz3Fv7hiQDnf',
    name: 'Jupiter Trading Bot',
    type: 'agent',
    spendingLimit: 500,
    permissions: ['send', 'receive', 'pay-x402', 'trade'],
    createdAt: '2025-10-29T00:00:00Z'
  },
  {
    agentId: 'akil-agent',
    publicKey: '3AxdPSVxZWFRJUhw3BbRA69vbMvVCQBeSz3Fv7hiQDnf',
    name: 'Akil Agent Wallet',
    type: 'agent',
    spendingLimit: 100,
    permissions: ['send', 'receive', 'pay-x402'],
    createdAt: '2025-10-29T00:00:00Z'
  },
  {
    agentId: 'midnight-integration-agent',
    publicKey: '7xbS8JuRLoVeQsb1Sp6Bc4ESShp6LEb2eoJtjohr65KK',
    name: 'Midnight Integration Specialist',
    type: 'agent',
    revenueShare: 0.90,
    governanceFee: 0.10,
    spendingLimit: 1000,
    permissions: ['send', 'receive', 'provide-data', 'pay-x402'],
    services: ['midnight-zkproof-consulting', 'midnight-integration-analysis', 'midnight-smart-contract-templates'],
    createdAt: '2025-10-29T06:00:00Z'
  },
  {
    agentId: 'midnight-compliance-agent',
    publicKey: '4ppPain22Fx54vXvE4Fvk7cYjx4emkfTHVAQpobc4pLv',
    name: 'Midnight Compliance Oracle',
    type: 'agent',
    revenueShare: 0.90,
    governanceFee: 0.10,
    spendingLimit: 500,
    permissions: ['send', 'receive', 'provide-compliance', 'pay-x402'],
    services: ['midnight-compliance-data', 'midnight-regulatory-guidance', 'midnight-audit-trails'],
    createdAt: '2025-10-29T06:00:00Z'
  },
  {
    agentId: 'midnight-developer-agent',
    publicKey: 'FXL7intKqJPSvXorpNLePakfRbjqs3iJU18ftSZ9GVTr',
    name: 'Midnight Developer Assistant',
    type: 'agent',
    revenueShare: 0.90,
    governanceFee: 0.10,
    spendingLimit: 300,
    permissions: ['send', 'receive', 'provide-code', 'pay-x402'],
    services: ['midnight-api-docs', 'midnight-sdk-examples', 'midnight-integration-patterns'],
    createdAt: '2025-10-29T06:00:00Z'
  }
];

export function getAgentWallet(agentId: string): WalletWithKeypair | null {
  const wallet = walletRegistry.find(w => w.agentId === agentId);
  if (!wallet) {
    console.error(`❌ Wallet not found for agent: ${agentId}`);
    return null;
  }

  const privateKeyEnv = `${agentId.toUpperCase().replace(/-/g, '_')}_PRIVATE_KEY`;
  const privateKey = process.env[privateKeyEnv];

  if (!privateKey) {
    console.warn(`⚠️ No private key found for ${agentId}. Read-only mode.`);
    return { ...wallet, keypair: undefined };
  }

  try {
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    return { ...wallet, keypair };
  } catch (error) {
    console.error(`❌ Invalid private key for ${agentId}`);
    return { ...wallet, keypair: undefined };
  }
}

export function getAllWallets(): AgentWallet[] {
  return walletRegistry;
}

export function getMidnightAgents(): AgentWallet[] {
  return walletRegistry.filter(w => w.agentId.startsWith('midnight-'));
}

export function registerWallet(wallet: AgentWallet): boolean {
  const exists = walletRegistry.find(w => w.agentId === wallet.agentId);
  if (exists) {
    console.error(`❌ Agent ${wallet.agentId} already registered`);
    return false;
  }
  walletRegistry.push({ ...wallet, createdAt: new Date().toISOString() });
  console.log(`✅ Registered wallet for ${wallet.agentId}`);
  return true;
}

export function hasPermission(agentId: string, permission: string): boolean {
  const wallet = walletRegistry.find(w => w.agentId === agentId);
  if (!wallet || !wallet.permissions) return false;
  return wallet.permissions.includes(permission);
}

export const getRegistry = (): Readonly<AgentWallet[]> => walletRegistry;
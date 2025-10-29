import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import axios from 'axios';
import { getAgentWallet } from '../utils/walletRegistry';
import { logPayment } from '../utils/logger';

interface X402Response {
  statusCode: 402;
  paymentRequired: {
    amount: number;
    currency: string;
    recipient: string;
    serviceId: string;
    description?: string;
    chainId?: string;
  };
}

interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export class X402Handler {
  private connection: Connection;
  private agentId: string;
  private rpcUrl: string;

  constructor(agentId: string, rpcUrl?: string) {
    this.agentId = agentId;
    this.rpcUrl = rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  async fetch(url: string, options?: any): Promise<any> {
    try {
      const response = await axios({ url, ...options });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 402) {
        console.log(`💳 402 Payment Required for: ${url}`);
        const paymentInfo = error.response.data as X402Response['paymentRequired'];
        const result = await this.processPayment(paymentInfo);
        
        if (result.success) {
          console.log(`✅ Payment successful: ${result.txHash}`);
          return await this.retryWithPaymentProof(url, options, result.txHash!);
        } else {
          throw new Error(`Payment failed: ${result.error}`);
        }
      }
      throw error;
    }
  }

  private async processPayment(paymentInfo: X402Response['paymentRequired']): Promise<PaymentResult> {
    try {
      const wallet = getAgentWallet(this.agentId);
      if (!wallet || !wallet.keypair) {
        return { success: false, error: `No wallet or keypair found for agent: ${this.agentId}` };
      }

      const fromPubkey = new PublicKey(wallet.publicKey);
      const toPubkey = new PublicKey(paymentInfo.recipient);
      let txHash: string;
      
      if (paymentInfo.currency === 'SOL') {
        txHash = await this.sendSOL(fromPubkey, toPubkey, paymentInfo.amount, wallet.keypair);
      } else if (paymentInfo.currency === 'USDC') {
        return { success: false, error: 'USDC payments not yet implemented. Use SOL.' };
      } else {
        return { success: false, error: `Unsupported currency: ${paymentInfo.currency}` };
      }

      await logPayment({
        agentId: this.agentId,
        serviceId: paymentInfo.serviceId,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        recipient: paymentInfo.recipient,
        txHash,
        timestamp: new Date().toISOString(),
        description: paymentInfo.description
      });

      return { success: true, txHash };
    } catch (error: any) {
      console.error('❌ Payment processing error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  private async sendSOL(from: PublicKey, to: PublicKey, amount: number, keypair: Keypair): Promise<string> {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await this.connection.sendTransaction(transaction, [keypair]);
    await this.connection.confirmTransaction(signature, 'confirmed');
    return signature;
  }

  private async retryWithPaymentProof(url: string, options: any, txHash: string): Promise<any> {
    const response = await axios({
      url,
      ...options,
      headers: { ...options?.headers, 'X-Payment-Proof': txHash, 'X-Payment-Agent': this.agentId }
    });
    return response.data;
  }

  async checkServicePrice(serviceId: string): Promise<X402Response['paymentRequired'] | null> {
    try {
      const serviceRegistry = require('../config/serviceRegistry.json');
      const service = serviceRegistry.find((s: any) => s.serviceId === serviceId);
      return service ? {
        amount: service.price,
        currency: service.currency,
        recipient: service.recipient,
        serviceId: service.serviceId,
        description: service.description,
        chainId: service.chainId
      } : null;
    } catch {
      return null;
    }
  }
}

export const createX402Handler = (agentId: string, rpcUrl?: string): X402Handler => {
  return new X402Handler(agentId, rpcUrl);
};
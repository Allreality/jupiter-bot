import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { logPayment } from './logger';

const TREASURY_ADDRESS = '6QKbYCqU3SDp1jgcFGcRRwpekQY2CEVK7AMVHpU8iWSH';
const GOVERNANCE_FEE = 0.10; // 10% to treasury

interface RevenueSplitResult {
  success: boolean;
  agentShare: number;
  treasuryShare: number;
  treasuryTxHash?: string;
  error?: string;
}

export async function splitMidnightRevenue(
  connection: Connection,
  agentId: string,
  totalAmount: number,
  currency: string,
  agentKeypair: Keypair,
  serviceId: string,
  originalTxHash: string
): Promise<RevenueSplitResult> {
  
  const treasuryShare = totalAmount * GOVERNANCE_FEE;
  const agentShare = totalAmount * (1 - GOVERNANCE_FEE);

  console.log(`\n💰 Revenue Split for ${agentId}:`);
  console.log(`   Total received: ${totalAmount} ${currency}`);
  console.log(`   Agent keeps: ${agentShare} ${currency} (90%)`);
  console.log(`   Treasury gets: ${treasuryShare} ${currency} (10%)`);

  try {
    // Send 10% to treasury
    let treasuryTxHash: string;
    
    if (currency === 'SOL') {
      treasuryTxHash = await sendSOLToTreasury(connection, treasuryShare, agentKeypair);
    } else if (currency === 'USDC') {
      console.log('⚠️ USDC treasury split not yet implemented');
      return {
        success: false,
        agentShare,
        treasuryShare,
        error: 'USDC splits not implemented'
      };
    } else {
      return {
        success: false,
        agentShare,
        treasuryShare,
        error: `Unsupported currency: ${currency}`
      };
    }

    // Log agent's retained revenue
    await logPayment({
      agentId,
      serviceId,
      amount: agentShare,
      currency,
      recipient: agentKeypair.publicKey.toString(),
      txHash: originalTxHash,
      timestamp: new Date().toISOString(),
      description: `Agent revenue (90% of ${totalAmount} ${currency})`
    });

    // Log treasury's governance fee
    await logPayment({
      agentId: 'temne-abara-nation',
      serviceId: `governance-fee-${serviceId}`,
      amount: treasuryShare,
      currency,
      recipient: TREASURY_ADDRESS,
      txHash: treasuryTxHash,
      timestamp: new Date().toISOString(),
      description: `Governance fee from ${agentId} (10% of ${totalAmount} ${currency})`
    });

    console.log(`✅ Revenue split complete!`);
    return {
      success: true,
      agentShare,
      treasuryShare,
      treasuryTxHash
    };

  } catch (error: any) {
    console.error('❌ Revenue split failed:', error);
    return {
      success: false,
      agentShare,
      treasuryShare,
      error: error.message
    };
  }
}

async function sendSOLToTreasury(
  connection: Connection,
  amount: number,
  fromKeypair: Keypair
): Promise<string> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new PublicKey(TREASURY_ADDRESS),
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await connection.sendTransaction(transaction, [fromKeypair]);
  await connection.confirmTransaction(signature, 'confirmed');
  console.log(`   ✅ Sent ${amount} SOL to treasury: ${signature.substring(0, 20)}...`);
  return signature;
}

export function calculateSplit(totalAmount: number): { agent: number; treasury: number } {
  return {
    agent: totalAmount * (1 - GOVERNANCE_FEE),
    treasury: totalAmount * GOVERNANCE_FEE
  };
}
import axios from 'axios';

interface RaydiumPair {
  name: string;
  ammId: string;
  baseMint: string;
  quoteMint: string;
  liquidity: number;
  price: number;
  volume24h: number;
}

interface RaydiumQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  price: number;
  priceImpact: number;
  route: string;
  liquidityUSD: number;
}

export class RaydiumClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.raydium.io/v2';
  }

  async getPairs(): Promise<RaydiumPair[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/main/pairs`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Raydium API Error: ${error.message}`);
    }
  }

  async findBestPair(inputMint: string, outputMint: string): Promise<RaydiumPair | null> {
    try {
      const pairs = await this.getPairs();
      
      const matchingPairs = pairs.filter(p => 
        (p.baseMint === inputMint && p.quoteMint === outputMint) ||
        (p.baseMint === outputMint && p.quoteMint === inputMint)
      );

      if (matchingPairs.length === 0) {
        return null;
      }

      return matchingPairs.sort((a, b) => b.liquidity - a.liquidity)[0];
    } catch (error: any) {
      throw new Error(`Raydium Pair Search Error: ${error.message}`);
    }
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<RaydiumQuote> {
    try {
      const pair = await this.findBestPair(inputMint, outputMint);
      
      if (!pair) {
        throw new Error(`No liquidity pool found for tokens`);
      }

      let outputAmount: number;
      let price: number;

      if (pair.baseMint === inputMint) {
        price = pair.price;
        outputAmount = amount * price;
      } else {
        price = 1 / pair.price;
        outputAmount = amount * price;
      }

      const tradeValueUSD = amount * price;
      const priceImpact = Math.min((tradeValueUSD / pair.liquidity) * 100, 10);

      return {
        inputMint,
        outputMint,
        inputAmount: amount,
        outputAmount,
        price,
        priceImpact,
        route: `Raydium ${pair.name}`,
        liquidityUSD: pair.liquidity
      };
    } catch (error: any) {
      throw new Error(`Raydium Quote Error: ${error.message}`);
    }
  }
}

export const RAYDIUM_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
};
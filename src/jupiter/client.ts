import axios, { AxiosInstance } from 'axios';
import {
  JupiterQuoteResponse,
  JupiterSwapRequest,
  JupiterSwapResponse,
  QuoteParams,
  TokenInfo,
} from './types';

export class JupiterClient {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'https://quote-api.jup.ag/v6') {
    this.baseUrl = baseUrl;
    this.api = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch a quote for a token swap
   * @param params - Quote parameters
   * @returns Quote response from Jupiter
   */
  async getQuote(params: QuoteParams): Promise<JupiterQuoteResponse> {
    try {
      const queryParams = new URLSearchParams({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount.toString(),
        slippageBps: (params.slippageBps || 50).toString(),
      });

      if (params.swapMode) {
        queryParams.append('swapMode', params.swapMode);
      }

      if (params.dexes && params.dexes.length > 0) {
        queryParams.append('dexes', params.dexes.join(','));
      }

      if (params.excludeDexes && params.excludeDexes.length > 0) {
        queryParams.append('excludeDexes', params.excludeDexes.join(','));
      }

      if (params.onlyDirectRoutes) {
        queryParams.append('onlyDirectRoutes', 'true');
      }

      if (params.maxAccounts) {
        queryParams.append('maxAccounts', params.maxAccounts.toString());
      }

      if (params.platformFeeBps) {
        queryParams.append('platformFeeBps', params.platformFeeBps.toString());
      }

      const response = await this.api.get<JupiterQuoteResponse>(
        `/quote?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Jupiter API Error: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get multiple quotes for comparison
   * @param params - Quote parameters
   * @param count - Number of quotes to fetch
   * @returns Array of quote responses
   */
  async getMultipleQuotes(
    params: QuoteParams,
    count: number = 3
  ): Promise<JupiterQuoteResponse[]> {
    const quotes: JupiterQuoteResponse[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const quote = await this.getQuote(params);
        quotes.push(quote);
        
        // Small delay between requests to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to fetch quote ${i + 1}:`, error);
      }
    }

    return quotes;
  }

  /**
   * Build a swap transaction from a quote
   * @param swapRequest - Swap request parameters
   * @returns Serialized transaction
   */
  async getSwapTransaction(
    swapRequest: JupiterSwapRequest
  ): Promise<JupiterSwapResponse> {
    try {
      const response = await this.api.post<JupiterSwapResponse>(
        '/swap',
        swapRequest
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Jupiter Swap Error: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Fetch token list from Jupiter
   * @returns Array of supported tokens
   */
  async getTokenList(): Promise<TokenInfo[]> {
    try {
      const response = await axios.get<TokenInfo[]>(
        'https://token.jup.ag/all'
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch token list: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search for a token by symbol
   * @param symbol - Token symbol
   * @returns Token info or undefined
   */
  async findTokenBySymbol(symbol: string): Promise<TokenInfo | undefined> {
    const tokens = await this.getTokenList();
    return tokens.find(
      token => token.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }

  /**
   * Calculate price impact percentage
   * @param quote - Quote response
   * @returns Price impact as a percentage
   */
  calculatePriceImpact(quote: JupiterQuoteResponse): number {
    return parseFloat(quote.priceImpactPct) * 100;
  }

  /**
   * Calculate output amount in human-readable format
   * @param quote - Quote response
   * @param decimals - Token decimals
   * @returns Human-readable output amount
   */
  calculateOutputAmount(quote: JupiterQuoteResponse, decimals: number): number {
    return parseInt(quote.outAmount) / Math.pow(10, decimals);
  }

  /**
   * Calculate input amount in human-readable format
   * @param quote - Quote response
   * @param decimals - Token decimals
   * @returns Human-readable input amount
   */
  calculateInputAmount(quote: JupiterQuoteResponse, decimals: number): number {
    return parseInt(quote.inAmount) / Math.pow(10, decimals);
  }

  /**
   * Get price per token
   * @param quote - Quote response
   * @param inputDecimals - Input token decimals
   * @param outputDecimals - Output token decimals
   * @returns Price per input token
   */
  getPrice(
    quote: JupiterQuoteResponse,
    inputDecimals: number,
    outputDecimals: number
  ): number {
    const inputAmount = this.calculateInputAmount(quote, inputDecimals);
    const outputAmount = this.calculateOutputAmount(quote, outputDecimals);
    return outputAmount / inputAmount;
  }
}

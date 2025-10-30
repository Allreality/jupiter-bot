export const CONFIG = {
  RPC_URL: 'https://api.mainnet-beta.solana.com',
  SLIPPAGE_BPS: 50,
  MAX_TRADE_SIZE: 1.0,
  jupiterApiUrl: 'https://quote-api.jup.ag/v6',
  defaultSlippageBps: 50,
  safety: {
    maxTradeSize: 1.0,
    minTradeSize: 0.01,
    maxPriceImpact: 2.0,
    maxPriceImpactPercent: 2.0,
    maxSlippageBps: 100,
    minRouteCount: 1,
    minOutputRatio: 0.98,
    warnPriceImpactPercent: 1.0,
    warnSlippageBps: 50,
    requireConfirmation: true,
    minConfidence: 70
  }
};

export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
};

export const RAYDIUM_TOKENS = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6
  }
};

export const PAIRS = {
  SOL_USDC: {
    inputMint: TOKENS.SOL,
    outputMint: TOKENS.USDC,
    name: 'SOL/USDC'
  },
  USDC_SOL: {
    inputMint: TOKENS.USDC,
    outputMint: TOKENS.SOL,
    name: 'USDC/SOL'
  }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKENS = exports.CONFIG = void 0;
exports.getConfig = getConfig;
exports.CONFIG = {
    // Solana RPC (use Devnet for testing)
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    cluster: process.env.SOLANA_CLUSTER || 'devnet',
    // Jupiter API
    jupiterApiUrl: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
    // Trading settings
    defaultSlippageBps: parseInt(process.env.DEFAULT_SLIPPAGE_BPS || '50'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
    // Safety settings
    safety: {
        maxPriceImpactPercent: parseFloat(process.env.MAX_PRICE_IMPACT || '2.0'),
        maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS || '100'),
        minRouteCount: parseInt(process.env.MIN_ROUTE_COUNT || '1'),
        minOutputRatio: parseFloat(process.env.MIN_OUTPUT_RATIO || '0.90'),
        warnPriceImpactPercent: parseFloat(process.env.WARN_PRICE_IMPACT || '1.0'),
        warnSlippageBps: parseInt(process.env.WARN_SLIPPAGE_BPS || '50'),
    },
    // Paper trading
    paperTrading: process.env.PAPER_TRADING === 'true' || true, // Default to paper trading
    paperTradingBalance: parseFloat(process.env.PAPER_TRADING_BALANCE || '1000'),
};
// Common token addresses (Devnet)
exports.TOKENS = {
    // Devnet token addresses
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Note: Use devnet USDC for testing
    // Mainnet addresses (for reference - don't use on devnet!)
    // USDC_MAINNET: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    // USDT_MAINNET: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};
function getConfig() {
    return exports.CONFIG;
}

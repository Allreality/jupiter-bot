export const PORTS = {
  TRADING_BOT: parseInt(process.env.TRADING_BOT_PORT || '3000'),
  X402_SERVER: parseInt(process.env.X402_PORT || '3001'),
  MIDNIGHT_SERVICES: parseInt(process.env.MIDNIGHT_PORT || '3002'),
  DASHBOARD: parseInt(process.env.DASHBOARD_PORT || '3003'),
  WEBSOCKET: parseInt(process.env.WS_PORT || '8080'),
  ANALYTICS: parseInt(process.env.ANALYTICS_PORT || '3004')
};

export const getAvailablePort = async (preferredPort: number): Promise<number> => {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(preferredPort, () => {
      const port = (server.address() as any).port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      resolve(preferredPort + 1);
    });
  });
};

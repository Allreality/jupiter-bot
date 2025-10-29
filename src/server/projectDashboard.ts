import express from 'express';
import cors from 'cors';
import { PORTS } from '../config/ports';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Project Dashboard',
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jupiter Trading Bot - Project Dashboard</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          min-height: 100vh;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        
        .header {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          margin-bottom: 30px;
          color: white;
          text-align: center;
        }
        .header h1 { font-size: 3em; margin-bottom: 10px; }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .card {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          transition: transform 0.3s;
        }
        .card:hover { transform: translateY(-5px); }
        
        .card h2 {
          color: #667eea;
          margin-bottom: 20px;
          font-size: 1.5em;
        }
        
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: bold;
          margin: 5px 0;
        }
        .status.online { background: #d1fae5; color: #065f46; }
        .status.pending { background: #fef3c7; color: #92400e; }
        
        .service-link {
          display: block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
          text-align: center;
          font-weight: bold;
          transition: all 0.3s;
        }
        .service-link:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.5);
        }
        
        .stat {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .stat:last-child { border-bottom: none; }
        .stat-value { font-weight: bold; color: #667eea; }
        
        .feature-list {
          list-style: none;
          padding: 0;
        }
        .feature-list li {
          padding: 10px;
          margin: 5px 0;
          background: #f3f4f6;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌊 Jupiter Trading Bot</h1>
          <p style="font-size: 1.3em; margin-top: 10px;">Complete Project Dashboard</p>
          <div style="margin-top: 20px;">
            <span class="status online">🟢 All Systems Operational</span>
          </div>
        </div>
        
        <div class="grid">
          <div class="card">
            <h2>🤖 Trading Bot</h2>
            <div class="stat">
              <span>Status:</span>
              <span class="stat-value">Active</span>
            </div>
            <div class="stat">
              <span>Port:</span>
              <span class="stat-value">${PORTS.TRADING_BOT}</span>
            </div>
            <a href="http://localhost:${PORTS.TRADING_BOT}/health" target="_blank" class="service-link">
              Open Trading API
            </a>
          </div>
          
          <div class="card">
            <h2>💰 x402 Payment System</h2>
            <div class="stat">
              <span>Status:</span>
              <span class="stat-value">Active</span>
            </div>
            <div class="stat">
              <span>Port:</span>
              <span class="stat-value">${PORTS.X402_SERVER}</span>
            </div>
            <a href="http://localhost:${PORTS.X402_SERVER}/api/revenue" target="_blank" class="service-link">
              View Revenue
            </a>
          </div>
          
          <div class="card">
            <h2>🌙 MIDNIGHT Services</h2>
            <div class="stat">
              <span>Status:</span>
              <span class="stat-value">Active</span>
            </div>
            <div class="stat">
              <span>Port:</span>
              <span class="stat-value">${PORTS.MIDNIGHT_API}</span>
            </div>
            <a href="http://localhost:${PORTS.MIDNIGHT_API}/api/services" target="_blank" class="service-link">
              View Services
            </a>
          </div>
          
          <div class="card">
            <h2>📊 Live Dashboard</h2>
            <div class="stat">
              <span>Status:</span>
              <span class="stat-value">Active</span>
            </div>
            <div class="stat">
              <span>Port:</span>
              <span class="stat-value">${PORTS.DASHBOARD}</span>
            </div>
            <a href="http://localhost:3004/dashboard.html" target="_blank" class="service-link">
              Open Dashboard
            </a>
          </div>
        </div>
        
        <div class="grid">
          <div class="card" style="grid-column: 1 / -1;">
            <h2>🎯 Active Features</h2>
            <ul class="feature-list">
              <li>✅ Real-time price tracking with Raydium DEX</li>
              <li>✅ Technical indicators (RSI, MACD)</li>
              <li>✅ AI-powered trading signals</li>
              <li>✅ Paper trading simulation</li>
              <li>✅ HTTP 402 payment infrastructure</li>
              <li>✅ MIDNIGHT blockchain integration</li>
              <li>✅ 8 monetizable AI services</li>
              <li>✅ Multi-agent architecture</li>
            </ul>
          </div>
        </div>
        
        <div class="grid">
          <div class="card">
            <h2>📈 System Stats</h2>
            <div class="stat">
              <span>Services Running:</span>
              <span class="stat-value">7</span>
            </div>
            <div class="stat">
              <span>Active Agents:</span>
              <span class="stat-value">7</span>
            </div>
            <div class="stat">
              <span>Uptime:</span>
              <span class="stat-value">Running</span>
            </div>
          </div>
          
          <div class="card">
            <h2>🔗 Quick Links</h2>
            <a href="http://localhost:3003/api/live/history" target="_blank" class="service-link">
              📊 Live Analysis History
            </a>
            <a href="http://localhost:${PORTS.X402_SERVER}/api/agents/revenue" target="_blank" class="service-link">
              💰 Agent Revenue
            </a>
            <a href="http://localhost:${PORTS.MIDNIGHT_API}/api/services" target="_blank" class="service-link">
              🌙 MIDNIGHT Services
            </a>
          </div>
          
          <div class="card">
            <h2>📚 Documentation</h2>
            <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin: 10px 0;">
              <strong>Port Map:</strong><br>
              3003 - Trading Dashboard API<br>
              3004 - Dashboard UI<br>
              ${PORTS.TRADING_BOT} - Trading Bot API<br>
              ${PORTS.X402_SERVER} - x402 Payments<br>
              ${PORTS.MIDNIGHT_API} - MIDNIGHT Services<br>
              ${PORTS.PROJECT_DASHBOARD} - This Dashboard
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Auto-refresh status every 30 seconds
        setInterval(() => {
          location.reload();
        }, 30000);
      </script>
    </body>
    </html>
  `);
});

const PORT = PORTS.PROJECT_DASHBOARD;

app.listen(PORT, () => {
  console.log(`📊 Project Dashboard running on http://localhost:${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
});

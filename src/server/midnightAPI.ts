import express from 'express';
import cors from 'cors';
import { PORTS } from '../config/ports';

const app = express();

app.use(cors());
app.use(express.json());

const services = [
  { id: 'zkproof', name: 'zkProof Consulting', status: 'active', requests: 0 },
  { id: 'compliance', name: 'Compliance Oracle', status: 'active', requests: 0 },
  { id: 'security', name: 'Security Audit', status: 'active', requests: 0 },
  { id: 'developer', name: 'Developer Assistant', status: 'active', requests: 0 },
  { id: 'dataprivacy', name: 'Data Privacy', status: 'active', requests: 0 },
  { id: 'smartcontract', name: 'Smart Contract Review', status: 'active', requests: 0 },
  { id: 'documentation', name: 'Documentation Generator', status: 'active', requests: 0 },
  { id: 'integration', name: 'Integration Support', status: 'active', requests: 0 }
];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MIDNIGHT Services API',
    version: '1.0.0',
    activeServices: services.length
  });
});

app.get('/api/services', (req, res) => {
  res.json({
    services,
    totalRequests: services.reduce((sum, s) => sum + s.requests, 0)
  });
});

app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(service);
});

app.post('/api/services/:id/request', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  service.requests++;
  
  res.json({
    success: true,
    service: service.name,
    requestId: Date.now().toString(),
    estimatedCost: 0.1
  });
});

const PORT = PORTS.MIDNIGHT_API;

app.listen(PORT, () => {
  console.log(`🌙 MIDNIGHT Services API running on http://localhost:${PORT}`);
});

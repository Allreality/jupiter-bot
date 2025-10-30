# 📡 API Documentation

Complete API reference for Jupiter Trading Bot

## Base URLs
```
Trading Bot:    http://localhost:5000
x402 Payment:   http://localhost:5001
MIDNIGHT:       http://localhost:5002
Dashboard API:  http://localhost:3003
Project Tracker: http://localhost:5004
```

## Trading Bot API (Port 5000)

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "Trading Bot API",
  "version": "1.0.0"
}
```

## Dashboard API (Port 3003)

### Get Quote
```http
GET /api/quote/:from/:to/:amount
```

**Example:**
```bash
curl http://localhost:3003/api/quote/So11111111111111111111111111111111111111112/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/1
```

**Response:**
```json
{
  "price": 193.79,
  "indicators": {
    "rsi": {"value": 53.2, "signal": "NEUTRAL"},
    "macd": {"histogram": 0.05, "crossover": "BULLISH"},
    "signal": {"action": "HOLD", "confidence": 65}
  }
}
```

## Project Tracker API (Port 5004)

### List Projects
```http
GET /api/projects
```

### Start Timer
```http
POST /api/timer/start
Content-Type: application/json

{
  "projectId": "trading-bot"
}
```

### Stop Timer
```http
POST /api/timer/stop
Content-Type: application/json

{
  "projectId": "trading-bot"
}
```

### Add Project
```http
POST /api/projects
Content-Type: application/json

{
  "id": "new-project",
  "name": "New Project",
  "category": "Development"
}
```

## Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

Currently no rate limiting in development.
For production: 60 requests/minute recommended.

cd /mnt/c/projects/akil-studio/tx-hub/Trading-bot/jupiter-bot

# Recreate the quick reference properly

# ⚡ Quick Reference

## 🚀 Starting Services
```bash
# Everything
npm run start:everything

# Individual services
npm run start:trading
npm run start:x402
npm run start:midnight
npm run start:dashboard
npm run start:tracker
npm run start:project
npm run dashboard:ui
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Hub | http://localhost:3004/index.html |
| Live Trading | http://localhost:3004/dashboard.html |
| Time Tracker | http://localhost:3004/projects-dashboard.html |
| Master Control | http://localhost:5003 |

## 🔧 Common Commands
```bash
# Health checks
curl http://localhost:5000/health  # Trading
curl http://localhost:5004/health  # Tracker
curl http://localhost:3003/health  # Dashboard

# Kill all services
pkill -f node

# Restart everything
npm run start:everything

# Run tests
npm test

# Build
npm run build
```

## 🔒 Claude-Proof
```bash
# Protect current state
./claude-proof.sh protect "Your message"

# List backups
./claude-proof.sh list

# Restore
./claude-proof.sh restore TIMESTAMP
```

## 📊 API Quick Calls
```bash
# Get quote
curl http://localhost:3003/api/quote/So11111111111111111111111111111111111111112/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/1

# List projects
curl http://localhost:5004/api/projects

# Start timer
curl -X POST http://localhost:5004/api/timer/start \
  -H "Content-Type: application/json" \
  -d '{"projectId":"trading-bot"}'

# Stop timer
curl -X POST http://localhost:5004/api/timer/stop \
  -H "Content-Type: application/json" \
  -d '{"projectId":"trading-bot"}'
```

## 🎯 Port Reference

| Port | Service |
|------|---------|
| 3003 | Dashboard API |
| 3004 | UI Server |
| 5000 | Trading Bot |
| 5001 | x402 Payment |
| 5002 | MIDNIGHT |
| 5003 | Project Dashboard |
| 5004 | Project Tracker |

## 🐛 Quick Fixes
```bash
# Services won't start
pkill -f node && sleep 2 && npm run start:everything

# Dashboard not loading
# Hard refresh: Ctrl+Shift+R

# Projects not showing
curl http://localhost:5004/api/projects
# Then refresh browser

# VPN blocking API
# Switch VPN or disable temporarily
```
ENDOFFILE

# Commit the fix
git add docs/QUICK_REFERENCE.md
git commit -m "fix: Repair corrupted QUICK_REFERENCE.md"
git push origin main
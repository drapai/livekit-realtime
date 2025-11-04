#!/bin/bash

# Script to run all services separately for manual execution
# Usage: Run each command in a separate terminal

echo "=== Agent 786 Services ==="
echo ""
echo "Run these commands in separate terminals:"
echo ""
echo "1. FastAPI Backend (Terminal 1):"
echo "   cd /home/faryal/agent-786 && source venv/bin/activate && uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "2. LiveKit Agent Worker (Terminal 2):"
echo "   cd /home/faryal/agent-786 && source venv/bin/activate && python backend/agent/agent.py dev"
echo ""
echo "3. Next.js Frontend (Terminal 3):"
echo "   cd /home/faryal/agent-786/frontend && yarn dev -p 3001"
echo ""
echo "=== OR use Docker Compose ==="
echo "   cd /home/faryal/agent-786/docker && docker-compose up --build"
echo ""

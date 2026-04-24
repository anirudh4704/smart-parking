#!/bin/bash

echo "======================================"
echo "  Smart Parking App - Auto Setup"
echo "======================================"

# Find available Python (3.12 preferred, 3.11 fallback)
if command -v python3.12 &>/dev/null; then
  PYTHON=python3.12
elif command -v python3.11 &>/dev/null; then
  PYTHON=python3.11
elif command -v python3 &>/dev/null; then
  PYTHON=python3
else
  echo "ERROR: Python 3 not found. Install from https://python.org/downloads"
  exit 1
fi

echo "Using Python: $PYTHON"

# Check Node
if ! command -v npm &>/dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org"
  exit 1
fi

# ── Backend setup ──
echo ""
echo "Setting up backend..."
cd backend
$PYTHON -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# ── Frontend setup ──
echo ""
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "======================================"
echo "  Setup complete!"
echo ""
echo "  To run the app:"
echo "  1. Open Terminal 1 and run:  ./start_backend.sh"
echo "  2. Open Terminal 2 and run:  ./start_frontend.sh"
echo "  3. Open browser:             http://localhost:5173"
echo "======================================"

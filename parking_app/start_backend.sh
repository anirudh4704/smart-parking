#!/bin/bash
echo "Starting backend..."
cd backend
source venv/bin/activate
python3 -m uvicorn app.main:app --reload

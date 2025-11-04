# Dockerfile for LiveKit Agent with custom plugins
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY backend/agent/ ./backend/agent/
COPY backend/api/ ./backend/api/

# Expose ports
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["python", "backend/agent/agent.py", "dev"]

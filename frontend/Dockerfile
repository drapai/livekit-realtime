# Dockerfile for Next.js Frontend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Set environment variable for port
ENV PORT=3001

# Run in development mode
CMD ["npm", "run", "dev", "--", "-p", "3001"]

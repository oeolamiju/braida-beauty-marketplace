# Braida Beauty Marketplace - Backend
# Self-hosted Encore application

FROM ghcr.io/encoredev/encore:latest AS builder

WORKDIR /app

# Copy the entire backend
COPY . .

# Build the Encore application
RUN encore build --output=/app/build

# Production runtime
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production 2>/dev/null || npm install --only=production

# Copy built application
COPY --from=builder /app/build ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health/check', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start the application
CMD ["node", "index.js"]

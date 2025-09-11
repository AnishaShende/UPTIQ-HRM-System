# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for building native modules
RUN apk add --no-cache libc6-compat

# Copy shared package first
COPY shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Set working directory back to api-gateway
WORKDIR /app/api-gateway

# Copy package files for api-gateway
COPY api-gateway/package*.json ./
COPY api-gateway/tsconfig*.json ./

# Development stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
COPY api-gateway/ .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force
COPY api-gateway/ .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hrmuser

# Copy built application
COPY --from=builder --chown=hrmuser:nodejs /app/api-gateway/dist ./dist
COPY --from=builder --chown=hrmuser:nodejs /app/api-gateway/node_modules ./node_modules
COPY --from=builder --chown=hrmuser:nodejs /app/api-gateway/package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R hrmuser:nodejs /app/logs

# Switch to non-root user
USER hrmuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Start the application
CMD ["node", "dist/server.js"]

# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for building native modules and curl
RUN apk add --no-cache libc6-compat curl

# Copy shared package first
COPY shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Set working directory back to app
WORKDIR /app/employee-service

# Copy package files for employee service
COPY employee-service/package*.json ./
COPY employee-service/tsconfig*.json ./

# Development stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
COPY employee-service/ .
EXPOSE 3002
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force
COPY employee-service/ .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hrmuser

# Copy built application
COPY --from=builder --chown=hrmuser:nodejs /app/employee-service/dist ./dist
COPY --from=builder --chown=hrmuser:nodejs /app/employee-service/node_modules ./node_modules
COPY --from=builder --chown=hrmuser:nodejs /app/employee-service/package*.json ./
COPY --from=builder --chown=hrmuser:nodejs /app/employee-service/prisma ./prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R hrmuser:nodejs /app/uploads

# Switch to non-root user
USER hrmuser

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Start the application
CMD ["node", "dist/server.js"]

# Multi-stage build for production optimization
FROM node:20-slim AS base

# Set working directory
WORKDIR /app

# Install system dependencies for building native modules and curl
RUN apt-get update && apt-get install -y \
  curl \
  openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy and build shared package first
COPY shared ./shared
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install && npm run build

# Set working directory back to recruitment-service
WORKDIR /app/recruitment-service

# Copy package files for recruitment-service
COPY recruitment-service/package*.json ./
COPY recruitment-service/tsconfig*.json ./

# Development stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY recruitment-service/ .
RUN npx prisma generate
EXPOSE 3005
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
RUN npm install --only=production && npm cache clean --force
COPY recruitment-service/ .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl openssl

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hrmuser

# Copy built application
COPY --from=builder --chown=hrmuser:nodejs /app/recruitment-service/dist ./dist
COPY --from=builder --chown=hrmuser:nodejs /app/recruitment-service/node_modules ./node_modules
COPY --from=builder --chown=hrmuser:nodejs /app/recruitment-service/package*.json ./
COPY --from=builder --chown=hrmuser:nodejs /app/recruitment-service/prisma ./prisma

# Create uploads directory
RUN mkdir -p /app/uploads/resumes /app/uploads/cover-letters && chown -R hrmuser:nodejs /app/uploads

# Switch to non-root user
USER hrmuser

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Start the application
CMD ["node", "dist/server.js"]

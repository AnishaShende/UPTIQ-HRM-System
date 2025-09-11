FROM node:18-alpine

WORKDIR /app

# Copy shared package first
COPY shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Set working directory to auth-service
WORKDIR /app/auth-service

# Install dependencies
COPY auth-service/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY auth-service/ .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app/auth-service
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]
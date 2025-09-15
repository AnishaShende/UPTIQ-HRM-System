FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ src/
COPY prisma/ prisma/

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads/resumes uploads/cover-letters

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# Start the application
CMD ["npm", "start"]

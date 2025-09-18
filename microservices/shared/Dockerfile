FROM node:20-slim

WORKDIR /app/shared

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY shared/package*.json ./
COPY shared/tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY shared/src/ ./src/

# Build the package
RUN npm run build

# Keep the container running
CMD ["tail", "-f", "/dev/null"]

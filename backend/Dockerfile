# Use Node.js 18 (standard image instead of Alpine for better Prisma compatibility)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Remove any existing lockfiles to prevent conflicts
RUN rm -f bun.lockb yarn.lock pnpm-lock.yaml

# Copy package files
COPY package*.json ./

# Install dependencies with npm only
RUN npm ci --only=production --no-audit --no-fund

# Copy source code
COPY . .

# Remove any lockfiles that might have been copied
RUN rm -f bun.lockb yarn.lock pnpm-lock.yaml

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "start"]

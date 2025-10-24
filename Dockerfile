# Multi-stage Dockerfile for Node.js Express application
ARG NODE_VERSION=20-alpine

#==============================================================================
# Base stage - Common dependencies
#==============================================================================
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

#==============================================================================
# Dependencies stage - Install and cache dependencies
#==============================================================================
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

#==============================================================================
# Development stage
#==============================================================================
FROM base AS development
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --frozen-lockfile

# Copy source code
COPY --chown=nodejs:nodejs . .

# Change ownership to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:${PORT:-8000}/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Expose port
EXPOSE 8000

# Start application with file watching for development
CMD ["dumb-init", "npm", "dev"]
# CMD ["dumb-init", "node", "--watch", "src/index.js"]

#==============================================================================
# Production build stage
#==============================================================================
FROM base AS builder
ENV NODE_ENV=development  

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies like ESLint)
RUN npm ci --frozen-lockfile --no-audit --no-fund --prefer-offline || \
    (sleep 5 && npm ci --frozen-lockfile --no-audit --no-fund) || \
    (sleep 10 && npm ci --frozen-lockfile --no-audit --no-fund)

# Copy source code
COPY . .

# Run any build processes (linting, etc.)
RUN npm run lint
#==============================================================================
# Production stage
#==============================================================================
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Change to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:${PORT:-8000}/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Expose port
EXPOSE 8000

# Start application
CMD ["dumb-init", "npm", "dev"]
# CMD ["dumb-init", "node", "src/index.js"]
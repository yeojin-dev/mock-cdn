# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Base Configuration
# ============================================
FROM node:20-alpine AS base

# Install Sharp's native dependencies for Alpine Linux
# Sharp requires vips and build tools when using musl (Alpine's C library)
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    build-base \
    python3

WORKDIR /app

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
# Rebuild Sharp for Alpine/musl architecture
RUN npm ci && \
    npm rebuild --arch=x64 --platform=linux --libc=musl sharp

# ============================================
# Stage 3: Build Stage (TypeScript Compilation)
# ============================================
FROM base AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config
COPY src ./src
COPY tsconfig.json ./
COPY package.json ./

# Build TypeScript application
RUN npm run build

# ============================================
# Stage 4: Production Runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install only runtime dependencies for Sharp (vips library)
RUN apk add --no-cache vips

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy package files and install production-only dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    npm rebuild --arch=x64 --platform=linux --libc=musl sharp && \
    npm cache clean --force

# Copy compiled application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose application port (Back4app uses PORT env variable)
EXPOSE 3001

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start application
CMD ["node", "dist/server.js"]

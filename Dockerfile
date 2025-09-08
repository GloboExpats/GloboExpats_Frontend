# Dockerfile for Next.js App

# 1. Base image for dependencies and building
FROM node:20-alpine AS base
LABEL maintainer="Your Name <you@example.com>"
LABEL stage="base"

# Install pnpm
RUN npm i -g pnpm

# Set working directory
WORKDIR /app


# 2. Installer stage for dependencies
FROM base AS installer
LABEL stage="installer"
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile --prod


# 3. Builder stage for building the app
FROM base AS builder
LABEL stage="builder"
COPY --from=installer /app/node_modules ./node_modules
COPY . .
RUN pnpm build


# 4. Runner stage for the final image
FROM node:20-alpine AS runner
LABEL stage="runner"
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Disable telemetry (fixed legacy format)
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install production dependencies only
COPY --from=installer /app/node_modules ./node_modules
# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/public ./public
# Copy .next directory for static files
COPY --from=builder /app/.next/static ./.next/static

# Set correct ownership for the app files
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the server
CMD ["node", "server.js"]
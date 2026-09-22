# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src/ ./src/

# API URL is injected at build time via build arg
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Production stage (nginx) ──────────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: serve SPA with fallback to index.html for client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

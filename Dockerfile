# ==========================================
# Stage 1: Build Frontend SPA
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Monolithic Node.js Production Server
# ==========================================
FROM node:20-alpine
WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy backend source code
COPY backend/ ./

# Copy compiled frontend from Stage 1 into backend public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

# Expose monolithic application port
EXPOSE 5000

# Set default production environment
ENV PORT=5000
ENV NODE_ENV=production

# Start monolithic web server
CMD ["node", "server.js"]

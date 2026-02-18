# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY knexfile.ts ./

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# Change ownership and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

CMD ["node", "dist/server.js"]

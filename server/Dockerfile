# ---- Stage 1: build ----
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

# ---- Stage 2: production ----
FROM node:22-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
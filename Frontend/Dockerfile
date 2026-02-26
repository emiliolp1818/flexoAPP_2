# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:railway

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# http-server: más simple y confiable que serve para puertos dinámicos
RUN npm install -g http-server

WORKDIR /app

COPY --from=builder /app/dist/flexoapp/browser ./browser

EXPOSE 3000

# http-server usa -p PORT (sin esquemas tcp://, sin bugs de protocolo)
CMD ["sh", "-c", "http-server browser -p ${PORT:-3000} --cors -c-1 -g"]

# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
# node:22-alpine da Node.js 22.x >= 22.12 (compatible con Angular 20)
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (mejor uso de caché Docker)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código y compilar con configuración Railway
COPY . .
RUN npm run build:railway

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Instalar 'serve' para servir archivos estáticos
RUN npm install -g serve

WORKDIR /app

# Copiar solo el build final (no el código fuente)
COPY --from=builder /app/dist/flexoapp/browser ./browser

# Railway asigna el puerto dinámicamente via $PORT
CMD serve -s browser -l ${PORT:-3000} --no-clipboard

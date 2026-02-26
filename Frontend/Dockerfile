# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:railway

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copiar el build de Angular al directorio de nginx
COPY --from=builder /app/dist/flexoapp/browser /usr/share/nginx/html

# Copiar config de nginx directamente (puerto 8080 hardcodeado)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script de arranque
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/bin/sh", "/start.sh"]


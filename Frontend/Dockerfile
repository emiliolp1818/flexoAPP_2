# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:railway

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
# nginx es el servidor estático estándar para SPAs en Docker/Railway
FROM nginx:alpine AS runner

# Copiar el build de Angular al directorio de nginx
COPY --from=builder /app/dist/flexoapp/browser /usr/share/nginx/html

# Copiar config de nginx con soporte para variable $PORT de Railway
COPY nginx.conf /etc/nginx/templates/default.conf.template

# gettext provee envsubst para reemplazar $PORT en nginx.conf en runtime
RUN apk add --no-cache gettext

# Script de arranque
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000

CMD ["/bin/sh", "/start.sh"]

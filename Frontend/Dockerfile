# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build:railway

# ── Etapa 2: RUNTIME (imagen mínima) ─────────────────────────────────────────
FROM nginx:alpine AS runner

# Limpiar config default de nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar build de Angular
COPY --from=builder /app/dist/flexoapp/browser /usr/share/nginx/html

# Copiar nginx.conf como config PRINCIPAL (no como site)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

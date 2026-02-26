# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:railway

# Verificar dónde quedó el build (para debugging)
RUN echo "=== Contenido de dist/ ===" && find dist -maxdepth 3 -type f -name "index.html"

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# serve -s: modo SPA — redirige todas las rutas a index.html (necesario para Angular Router)
RUN npm install -g serve

WORKDIR /app

# Angular 17+ con @angular/build:application genera en dist/<proyecto>/browser/
COPY --from=builder /app/dist/flexoapp/browser ./public

EXPOSE 3000

# -s = single-page app mode (redirige 404 a index.html para rutas de Angular)
# --listen solo acepta número de puerto — Railway pasa $PORT como variable de entorno
CMD ["sh", "-c", "serve -s public --listen ${PORT:-3000}"]

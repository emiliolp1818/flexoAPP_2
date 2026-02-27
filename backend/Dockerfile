# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /app

COPY *.csproj ./
RUN dotnet restore --no-cache

COPY . .

# Self-contained: TODOS los assemblies van en el ejecutable
# runtime-deps: solo librerías nativas necesarias (no el runtime de .NET)
RUN dotnet publish -c Release -o out \
    --self-contained true \
    -r linux-x64 \
    -p:PublishSingleFile=false && \
    chmod +x out/FlexoAPP.API

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
# runtime-deps = solo libssl, libicu, etc. — ningún runtime .NET instalado
# El ejecutable self-contained trae su propio runtime
FROM mcr.microsoft.com/dotnet/runtime-deps:8.0 AS runner

WORKDIR /app

COPY --from=builder /app/out .

RUN mkdir -p uploads

EXPOSE 8080

# ASPNETCORE_URLS es el método estándar de Railway para .NET
# El shell expande $PORT antes de lanzar la app
CMD ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} ./FlexoAPP.API"]


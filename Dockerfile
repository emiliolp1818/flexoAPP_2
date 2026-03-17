# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /app

COPY backend/*.csproj ./
RUN dotnet restore --no-cache

COPY backend/. .

# Self-contained: TODOS los assemblies van en el ejecutable
RUN dotnet publish -c Release -o out \
    --self-contained true \
    -r linux-x64 \
    -p:PublishSingleFile=false && \
    chmod +x out/FlexoAPP.API

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/runtime-deps:8.0 AS runner

WORKDIR /app

COPY --from=builder /app/out .

RUN mkdir -p uploads

EXPOSE 8080

CMD ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} ./FlexoAPP.API"]

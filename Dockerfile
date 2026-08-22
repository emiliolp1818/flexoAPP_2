# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS builder
WORKDIR /app

COPY backend/*.csproj ./
RUN dotnet restore --no-cache

COPY backend/. .
RUN dotnet publish -c Release -o out \
    --self-contained true \
    -r linux-musl-x64 \
    -p:PublishSingleFile=false && \
    chmod +x out/FlexoAPP.API && \
    rm -rf out/*.pdb out/*.xml

# ── Etapa 2: RUNTIME (alpine mínima) ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/runtime-deps:8.0-alpine AS runner
WORKDIR /app

COPY --from=builder /app/out .
RUN mkdir -p uploads

ENV DOTNET_GCConserveMemory=9
ENV DOTNET_GCHeapHardLimit=0x10000000
ENV DOTNET_EnableDiagnostics=0

EXPOSE 8080
CMD ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} ./FlexoAPP.API"]

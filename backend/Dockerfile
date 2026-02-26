# ── Etapa 1: BUILD ──────────────────────────────────────────────────────────
# Imagen oficial Microsoft — da siempre el último parche de .NET 8.x
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /app

# Copiar solo el .csproj primero (mejor caché de Docker)
COPY *.csproj ./
RUN dotnet restore --no-cache

# Copiar el resto y compilar en Release
COPY . .
RUN dotnet publish -c Release -o out

# ── Etapa 2: RUNTIME ─────────────────────────────────────────────────────────
# aspnet:8.0 = runtime ASP.NET Core 8.x (sin SDK, imagen más pequeña)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runner

WORKDIR /app

# Copiar el publish
COPY --from=builder /app/out .

# Crear directorio de uploads (necesario para archivos subidos)
RUN mkdir -p uploads

EXPOSE 8080

# Railway asigna $PORT dinámicamente — sh -c para expandir la variable
CMD ["sh", "-c", "dotnet FlexoAPP.API.dll --urls http://0.0.0.0:${PORT:-8080}"]

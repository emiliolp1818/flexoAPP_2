# Dockerfile para FlexoAPP Backend - Railway/Render
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 flexoapp && \
    adduser --system --uid 1001 --gid 1001 flexoapp

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["flexoAPP.csproj", "."]
RUN dotnet restore "./flexoAPP.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "flexoAPP.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "flexoAPP.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/logs /app/uploads && \
    chown -R flexoapp:flexoapp /app

# Cambiar a usuario no-root
USER flexoapp

# Variables de entorno por defecto
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "flexoAPP.dll"]
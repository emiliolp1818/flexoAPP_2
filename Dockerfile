# Dockerfile para FlexoAPP Backend - Ejecutar desde raíz del proyecto
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivo de proyecto
COPY backend/flexoAPP.csproj ./backend/
RUN dotnet restore "backend/flexoAPP.csproj"

# Copiar código fuente
COPY backend/ ./backend/
WORKDIR "/src/backend"
RUN dotnet build "flexoAPP.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "flexoAPP.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/uploads

# Variables de entorno
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "flexoAPP.dll"]
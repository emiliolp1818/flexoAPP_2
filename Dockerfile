# Multi-stage build para FlexoAPP Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copiar archivos del proyecto
COPY backend/*.csproj ./
RUN dotnet restore

# Copiar todo el código fuente
COPY backend/ ./
RUN dotnet publish -c Release -o out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Crear directorios
RUN mkdir -p logs uploads

# Configuración
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "FlexoAPP.API.dll"]
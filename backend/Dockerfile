# ===== DOCKERFILE PARA FLEXOAPP BACKEND EN RAILWAY =====
# Este archivo define cómo construir y ejecutar la aplicación en un contenedor Docker

# ===== ETAPA 1: BASE - IMAGEN DE RUNTIME =====
# FROM: especifica la imagen base de Docker Hub
# mcr.microsoft.com/dotnet/aspnet:8.0: imagen oficial de Microsoft con .NET 8.0 runtime (solo para ejecutar, no compilar)
# AS base: nombra esta etapa como "base" para referenciarla después
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base

# WORKDIR: establece el directorio de trabajo dentro del contenedor
# /app: todos los comandos siguientes se ejecutarán en este directorio
WORKDIR /app

# EXPOSE: documenta qué puerto usa la aplicación (no abre el puerto, solo es informativo)
# 8080: puerto estándar para Railway (Railway asigna automáticamente el puerto)
EXPOSE 8080

# ===== ETAPA 2: BUILD - COMPILACIÓN DE LA APLICACIÓN =====
# FROM: usa la imagen SDK de .NET 8.0 que incluye herramientas de compilación
# mcr.microsoft.com/dotnet/sdk:8.0: imagen con compilador, herramientas de desarrollo
# AS build: nombra esta etapa como "build"
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# WORKDIR: establece /src como directorio de trabajo para la compilación
WORKDIR /src

# COPY: copia el archivo de proyecto desde el host al contenedor
# ["FlexoAPP.API.csproj", "./"]: copia el .csproj al directorio actual del contenedor
# Se copia primero solo el .csproj para aprovechar el caché de Docker (si no cambia, no restaura paquetes)
# Nota: Railway ejecuta desde la raíz, pero el contexto es la carpeta backend
COPY ["FlexoAPP.API.csproj", "./"]

# RUN: ejecuta un comando dentro del contenedor durante la construcción
# dotnet restore: descarga todas las dependencias NuGet especificadas en el .csproj
# "./FlexoAPP.API.csproj": archivo de proyecto a restaurar
RUN dotnet restore "./FlexoAPP.API.csproj"

# COPY: copia todo el código fuente del backend al contenedor
# .: copia todo desde el contexto actual (carpeta backend)
# .: directorio destino en el contenedor (WORKDIR actual: /src)
COPY . .

# RUN: compila la aplicación en modo Release
# dotnet build: comando de compilación de .NET
# "FlexoAPP.API.csproj": proyecto a compilar
# -c Release: configuración de compilación (Release = optimizado para producción)
# -o /app/build: directorio de salida de los archivos compilados
RUN dotnet build "FlexoAPP.API.csproj" -c Release -o /app/build

# ===== ETAPA 3: PUBLISH - PUBLICACIÓN DE LA APLICACIÓN =====
# FROM build: continúa desde la etapa "build" anterior
# AS publish: nombra esta etapa como "publish"
FROM build AS publish

# RUN: publica la aplicación (prepara archivos para producción)
# dotnet publish: crea una versión lista para desplegar
# "FlexoAPP.API.csproj": proyecto a publicar
# -c Release: configuración Release (optimizado)
# -o /app/publish: directorio de salida de los archivos publicados
# /p:UseAppHost=false: no crear ejecutable nativo (usar dotnet para ejecutar)
RUN dotnet publish "FlexoAPP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ===== ETAPA 4: FINAL - IMAGEN FINAL DE PRODUCCIÓN =====
# FROM base: usa la etapa "base" (runtime ligero, sin SDK)
# AS final: nombra esta etapa como "final" (imagen que se desplegará)
FROM base AS final

# WORKDIR: establece /app como directorio de trabajo en la imagen final
WORKDIR /app

# COPY: copia los archivos publicados desde la etapa "publish" a la imagen final
# --from=publish: toma archivos de la etapa "publish"
# /app/publish: directorio fuente en la etapa publish
# .: directorio destino en la imagen final (/app)
COPY --from=publish /app/publish .

# ===== CREAR DIRECTORIOS NECESARIOS =====
# RUN: ejecuta comando para crear directorios que la aplicación necesita
# mkdir -p: crea directorios (y subdirectorios si no existen)
# /app/logs: directorio para archivos de log de Serilog
# /app/uploads: directorio para archivos subidos por usuarios (PDFs, imágenes, Excel)
# /app/Backups/Machines: directorio para backups automáticos de máquinas
RUN mkdir -p /app/logs /app/uploads /app/Backups/Machines

# ===== COMANDO DE INICIO =====
# ENTRYPOINT: define el comando que se ejecuta cuando inicia el contenedor
# ["dotnet", "FlexoAPP.API.dll"]: ejecuta la aplicación .NET
# dotnet: runtime de .NET
# FlexoAPP.API.dll: archivo DLL compilado de la aplicación
ENTRYPOINT ["dotnet", "FlexoAPP.API.dll"]

# Explicación del archivo railway.json

## Estructura del archivo railway.json

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
  },
  "deploy": {
    "startCommand": "dotnet FlexoAPP.API.dll",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Explicación línea por línea:

### Sección "build" (Construcción)

**"build"**: Sección que define cómo Railway debe construir la aplicación

**"builder": "DOCKERFILE"**: 
- Indica a Railway que use Docker para construir la aplicación
- Railway buscará un Dockerfile en el proyecto
- Alternativas: "NIXPACKS" (detección automática), "BUILDPACKS"

**"dockerfilePath": "backend/Dockerfile"**:
- Ruta relativa al Dockerfile desde la raíz del repositorio
- Railway usará este archivo para construir la imagen Docker
- Si no se especifica, Railway busca "Dockerfile" en la raíz

### Sección "deploy" (Despliegue)

**"deploy"**: Sección que define cómo Railway debe ejecutar la aplicación

**"startCommand": "dotnet FlexoAPP.API.dll"**:
- Comando que Railway ejecutará para iniciar la aplicación
- "dotnet": runtime de .NET que ejecuta aplicaciones compiladas
- "FlexoAPP.API.dll": archivo DLL principal de la aplicación
- Este comando sobrescribe el ENTRYPOINT del Dockerfile si se especifica

**"restartPolicyType": "ON_FAILURE"**:
- Política de reinicio automático de la aplicación
- "ON_FAILURE": Railway reiniciará la aplicación solo si falla (código de salida != 0)
- Alternativas: "ALWAYS" (siempre reiniciar), "NEVER" (nunca reiniciar)

**"restartPolicyMaxRetries": 10**:
- Número máximo de intentos de reinicio antes de marcar el servicio como fallido
- 10: Railway intentará reiniciar hasta 10 veces
- Después de 10 fallos, Railway detendrá los intentos de reinicio
- Útil para evitar loops infinitos de reinicios

## Variables de entorno necesarias en Railway:

Para que la aplicación funcione correctamente en Railway, debes configurar estas variables:

1. **DATABASE_URL**: Cadena de conexión a MySQL
   - Ejemplo: `Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=xxx;`

2. **JWT_SECRET_KEY**: Clave secreta para tokens JWT
   - Ejemplo: `FlexoAPP-Super-Secret-Key-2024-Production-Ready`

3. **ASPNETCORE_ENVIRONMENT**: Entorno de ejecución
   - Valor: `Production`

4. **PORT**: Puerto donde escucha la aplicación (Railway lo asigna automáticamente)
   - Railway lo configura automáticamente, no necesitas agregarlo manualmente

# Cómo Iniciar el Backend

## 🚀 Pasos para Iniciar el Backend

### Opción 1: Usando la terminal de Kiro

1. Abre una terminal en la carpeta `backend`
2. Ejecuta:

```bash
cd backend
dotnet run
```

### Opción 2: Usando Visual Studio

1. Abre el proyecto en Visual Studio
2. Presiona F5 o haz clic en "Run"

### Opción 3: Usando el comando directo

```bash
dotnet run --project backend
```

## 📋 Verificar que el Backend Está Corriendo

Deberías ver algo como:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:7003
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

## 🧪 Probar el Backend

Una vez iniciado, prueba en el navegador:

```
http://localhost:7003/api/maquinas
```

Deberías ver una respuesta JSON con los datos de las máquinas.

## ⚠️ Problemas Comunes

### Puerto ya en uso

Si ves un error como "Address already in use", significa que el puerto 7003 ya está ocupado.

**Solución:**
1. Cierra cualquier otra instancia del backend
2. O cambia el puerto en `backend/Properties/launchSettings.json`

### Base de datos no conecta

Si ves errores de conexión a MySQL:

**Solución:**
1. Verifica que MySQL esté corriendo
2. Verifica la cadena de conexión en `backend/appsettings.json`

### Dependencias faltantes

Si ves errores de paquetes NuGet:

**Solución:**
```bash
cd backend
dotnet restore
dotnet build
```

## 📝 Configuración del Puerto

El backend debe estar configurado para escuchar en el puerto **7003**.

Verifica en `backend/Properties/launchSettings.json`:

```json
{
  "profiles": {
    "backend": {
      "commandName": "Project",
      "launchBrowser": false,
      "applicationUrl": "http://localhost:7003",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

## ✅ Una Vez Iniciado

Cuando el backend esté corriendo:

1. Regresa al frontend (http://localhost:4200)
2. Intenta cargar el archivo Excel nuevamente
3. Ahora debería funcionar correctamente

---

**Nota:** El backend debe estar corriendo ANTES de intentar cargar archivos desde el frontend.

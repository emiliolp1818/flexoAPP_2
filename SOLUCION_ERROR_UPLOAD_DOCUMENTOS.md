# 🔧 Solución Error 500 en Upload de Documentos

## ⚠️ Problema Actual

Error 500 (Internal Server Error) al intentar subir documentos en Render:
```
POST https://flexoapp-backend.onrender.com/api/documentos/upload 500
```

---

## 🔍 Posibles Causas

### 1. Carpeta de Uploads No Existe
Render usa un sistema de archivos efímero. La carpeta `uploads/documentos` se crea en el código, pero puede no tener permisos o no persistir.

### 2. Permisos de Escritura
El backend en Render puede no tener permisos para escribir archivos en el sistema de archivos.

### 3. Tabla Documento Incompleta
La tabla `Documento` en la base de datos de Render puede no tener todas las columnas necesarias.

### 4. Columnas Faltantes
El código intenta insertar en columnas que pueden no existir:
- `NombreArchivo`
- `TamanoBytes`
- `Extension`

---

## ✅ Soluciones

### Solución 1: Usar Almacenamiento Externo (Recomendado para Producción)

Render no es ideal para almacenar archivos porque el sistema de archivos es efímero. Se recomienda usar un servicio de almacenamiento externo:

**Opciones:**
- **AWS S3** - Servicio de almacenamiento de Amazon
- **Cloudinary** - Especializado en imágenes y documentos
- **Azure Blob Storage** - Servicio de Microsoft
- **Google Cloud Storage** - Servicio de Google

**Ventajas:**
- ✅ Archivos persisten entre deploys
- ✅ No se pierden al reiniciar el servicio
- ✅ Mejor rendimiento
- ✅ CDN integrado

### Solución 2: Verificar Estructura de la Tabla

Ejecutar este script SQL en la base de datos de Render para verificar/actualizar la tabla:

```sql
-- Verificar estructura actual
DESCRIBE Documento;

-- Si faltan columnas, agregarlas:
ALTER TABLE Documento 
ADD COLUMN IF NOT EXISTS NombreArchivo VARCHAR(255) AFTER Estado;

ALTER TABLE Documento 
ADD COLUMN IF NOT EXISTS TamanoBytes BIGINT AFTER RutaArchivo;

ALTER TABLE Documento 
ADD COLUMN IF NOT EXISTS Extension VARCHAR(10) AFTER TamanoFormateado;

-- Verificar que se agregaron
DESCRIBE Documento;
```

### Solución 3: Modificar el Código para Manejar Archivos Efímeros

Si decides mantener el almacenamiento local (solo para desarrollo), modifica el código para manejar mejor los errores:

```csharp
// En DocumentosController.cs, método Upload

// Verificar que el directorio existe y tiene permisos
try
{
    if (!Directory.Exists(_uploadsPath))
    {
        Directory.CreateDirectory(_uploadsPath);
        _logger.LogInformation($"Created uploads directory: {_uploadsPath}");
    }
    
    // Probar permisos de escritura
    var testFile = Path.Combine(_uploadsPath, "test.txt");
    File.WriteAllText(testFile, "test");
    File.Delete(testFile);
    _logger.LogInformation("Write permissions verified");
}
catch (Exception ex)
{
    _logger.LogError(ex, "No write permissions in uploads directory");
    return StatusCode(500, new { 
        message = "Error de permisos en el servidor", 
        error = "No se puede escribir en el directorio de uploads" 
    });
}
```

### Solución 4: Simplificar el INSERT (Temporal)

Modificar el INSERT para usar solo las columnas que seguro existen:

```csharp
// Consulta SQL simplificada
var query = @"INSERT INTO Documento 
    (Nombre, Tipo, Categoria, Descripcion, Estado, RutaArchivo, TamanoFormateado, FechaCreacion) 
    VALUES 
    (@Nombre, @Tipo, @Categoria, @Descripcion, @Estado, @RutaArchivo, @TamanoFormateado, @FechaCreacion);
    SELECT LAST_INSERT_ID();";

// Remover estos parámetros si las columnas no existen:
// command.Parameters.AddWithValue("@NombreArchivo", file.FileName);
// command.Parameters.AddWithValue("@TamanoBytes", file.Length);
// command.Parameters.AddWithValue("@Extension", extension.TrimStart('.'));
```

---

## 🔧 Pasos para Diagnosticar

### 1. Verificar Logs del Backend en Render

1. Ir a Render Dashboard
2. Seleccionar el servicio de backend
3. Ir a la pestaña "Logs"
4. Buscar el error específico cuando se intenta subir un archivo
5. El log mostrará el error exacto (columna faltante, permisos, etc.)

### 2. Probar el Endpoint de Test

Abrir en el navegador:
```
https://flexoapp-backend.onrender.com/api/documentos/test
```

**Respuesta esperada:**
```json
{
  "message": "Documentos Controller is working",
  "timestamp": "2026-01-17...",
  "status": "OK",
  "uploadsPath": "/app/uploads/documentos"
}
```

Esto confirma que el controller funciona y muestra la ruta de uploads.

### 3. Verificar Estructura de la Tabla

Conectarse a la base de datos de Render y ejecutar:
```sql
DESCRIBE Documento;
```

**Columnas requeridas:**
- DocumentoID (INT, PK, AUTO_INCREMENT)
- Nombre (VARCHAR)
- Tipo (VARCHAR)
- Categoria (VARCHAR)
- Descripcion (TEXT, NULL)
- Estado (VARCHAR)
- RutaArchivo (VARCHAR, NULL)
- TamanoFormateado (VARCHAR, NULL)
- FechaCreacion (DATETIME)
- NombreArchivo (VARCHAR, NULL) ← Verificar
- TamanoBytes (BIGINT, NULL) ← Verificar
- Extension (VARCHAR, NULL) ← Verificar

---

## 📝 Recomendación Final

**Para Producción (Render):**
1. Usar servicio de almacenamiento externo (S3, Cloudinary, etc.)
2. Modificar el código para subir archivos al servicio externo
3. Guardar solo la URL del archivo en la base de datos

**Para Desarrollo Local:**
1. El almacenamiento local funciona bien
2. Los archivos se guardan en `backend/uploads/documentos`

**Implementación Sugerida:**
```csharp
// Detectar si estamos en producción
var isProduction = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production";

if (isProduction)
{
    // Subir a S3/Cloudinary
    var url = await _cloudinaryService.UploadAsync(file);
    rutaArchivo = url;
}
else
{
    // Guardar localmente
    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
    var filePath = Path.Combine(_uploadsPath, fileName);
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }
    rutaArchivo = $"/uploads/documentos/{fileName}";
}
```

---

## 🚀 Acción Inmediata

1. **Revisar logs en Render** para ver el error exacto
2. **Verificar estructura de tabla** con `DESCRIBE Documento`
3. **Agregar columnas faltantes** si es necesario
4. **Considerar migrar a almacenamiento externo** para producción

---

**Fecha:** 17 de enero de 2026  
**Prioridad:** 🔴 ALTA - Funcionalidad crítica bloqueada  
**Estado:** Requiere diagnóstico en Render

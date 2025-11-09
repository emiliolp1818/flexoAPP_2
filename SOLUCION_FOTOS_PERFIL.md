# Solución: Fotos de Perfil No Se Cargan en Configuraciones

## Problema Identificado

Las fotos de perfil de los usuarios no se están cargando en la sección de Configuraciones/Gestión de Usuarios debido a múltiples problemas de conectividad y configuración:

### Errores Detectados:
1. **ERR_ADDRESS_INVALID** para `http://0.0.0.0:7003` - Dirección inválida
2. **ERR_CONNECTION_TIMED_OUT** para varias IPs (192.168.1.28, 192.168.0.28, 10.0.0.28)
3. Las imágenes intentan cargarse desde URLs que no son accesibles desde el navegador

## Cambios Realizados

### 1. Archivo: `Frontend/src/app/auth/settings/settings.ts`

#### Mejora en `getProfileImageUrl()`:
- **Prioridad a imágenes Base64**: Las imágenes en formato base64 se devuelven directamente sin procesamiento
- **Uso de `imageBaseUrl`**: Se usa la configuración de `environment.imageBaseUrl` para construir URLs correctas
- **Validación mejorada**: Se validan valores nulos, vacíos o inválidos

#### Mejora en `onImageError()`:
- **Fallback automático**: Cuando una imagen falla al cargar, se limpia la URL y se muestra el avatar por defecto
- **Actualización reactiva**: Se actualiza el estado del usuario para mostrar el avatar inmediatamente
- **Diagnóstico mejorado**: Logs detallados solo en modo debug

### 2. Archivo: `Frontend/src/app/auth/settings/edit-user-dialog/edit-user-dialog.component.ts`

#### Mejoras en carga de imágenes:
- **Detección de formato**: Distingue entre imágenes base64 y URLs
- **Validación de datos**: Verifica que la URL no sea nula o vacía antes de procesarla
- **Construcción correcta de URLs**: Usa `imageBaseUrl` del environment

## Recomendaciones Adicionales

### 1. Verificar Configuración del Backend

Asegúrate de que el backend en `http://192.168.1.28:7003` esté:
- ✅ Ejecutándose correctamente
- ✅ Accesible desde la red local
- ✅ Configurado para servir archivos estáticos (imágenes)
- ✅ Con CORS habilitado para permitir peticiones desde el frontend

### 2. Configuración de Rutas de Imágenes en el Backend

El backend debe servir las imágenes de perfil en una de estas formas:

**Opción A: Imágenes como Base64 (Recomendado para este caso)**
```csharp
// En el endpoint de usuarios, incluir la imagen como base64
public class UserDto {
    public string ProfileImage { get; set; } // "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Opción B: Imágenes como archivos estáticos**
```csharp
// Configurar carpeta estática en Program.cs
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads")),
    RequestPath = "/uploads"
});

// Retornar URL relativa en el DTO
public class UserDto {
    public string ProfileImageUrl { get; set; } // "/uploads/profiles/user123.jpg"
}
```

### 3. Verificar Firewall y Permisos de Red

```bash
# En Windows, verificar que el puerto 7003 esté abierto
netsh advfirewall firewall add rule name="FlexoApp Backend" dir=in action=allow protocol=TCP localport=7003

# Verificar que el backend esté escuchando en todas las interfaces
# En Program.cs del backend:
builder.WebHost.UseUrls("http://0.0.0.0:7003");
```

### 4. Probar Conectividad

Desde otro dispositivo en la red, probar:
```bash
# Probar endpoint de salud
curl http://192.168.1.28:7003/health

# Probar endpoint de usuarios
curl http://192.168.1.28:7003/api/auth/users

# Si hay una imagen de prueba
curl http://192.168.1.28:7003/uploads/profiles/test.jpg
```

### 5. Formato Recomendado para Imágenes

Para mejor rendimiento y compatibilidad, se recomienda:

**En la Base de Datos:**
```sql
-- Opción 1: Guardar como base64 (más simple, sin archivos externos)
ALTER TABLE Users ADD ProfileImage NVARCHAR(MAX);

-- Opción 2: Guardar solo la ruta (requiere gestión de archivos)
ALTER TABLE Users ADD ProfileImageUrl NVARCHAR(500);
```

**En el Backend (C#):**
```csharp
// Convertir imagen a base64 al leer de BD
public string GetProfileImageBase64(byte[] imageBytes)
{
    if (imageBytes == null || imageBytes.Length == 0)
        return null;
    
    string base64 = Convert.ToBase64String(imageBytes);
    return $"data:image/jpeg;base64,{base64}";
}

// Guardar imagen desde base64
public byte[] SaveProfileImageFromBase64(string base64Image)
{
    if (string.IsNullOrEmpty(base64Image))
        return null;
    
    // Remover prefijo "data:image/...;base64,"
    string base64Data = base64Image.Split(',')[1];
    return Convert.FromBase64String(base64Data);
}
```

### 6. Debugging en el Frontend

Para diagnosticar problemas, ejecuta en la consola del navegador:
```javascript
// Ver configuración actual
console.log('API URL:', environment.apiUrl);
console.log('Image Base URL:', environment.imageBaseUrl);

// Probar carga de usuarios
// (Esto ya está implementado en el botón de debug del componente)
```

## Pruebas Recomendadas

1. **Verificar que el backend esté corriendo:**
   - Abrir `http://192.168.1.28:7003/health` en el navegador
   - Debe responder con status 200

2. **Verificar endpoint de usuarios:**
   - Abrir `http://192.168.1.28:7003/api/auth/users` en el navegador
   - Debe retornar JSON con lista de usuarios

3. **Verificar formato de imágenes:**
   - Las imágenes deben venir como base64: `"data:image/jpeg;base64,/9j/4AAQ..."`
   - O como URLs relativas: `"/uploads/profiles/user123.jpg"`

4. **Usar el botón de Debug:**
   - En la interfaz de Configuraciones, hacer clic en el botón rojo de "bug"
   - Revisar la consola del navegador para ver información detallada

## Resultado Esperado

Después de aplicar estos cambios:
- ✅ Las imágenes base64 se mostrarán correctamente
- ✅ Las imágenes que fallen mostrarán automáticamente el avatar por defecto
- ✅ No habrá errores de red en la consola para imágenes inválidas
- ✅ El sistema será más robusto ante problemas de conectividad

## Contacto para Soporte

Si el problema persiste después de aplicar estos cambios, verificar:
1. Logs del backend para errores de CORS o permisos
2. Configuración del firewall de Windows
3. Que la IP 192.168.1.28 sea la correcta y esté accesible en la red

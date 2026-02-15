# 📦 Aumento de Límite de Tamaño de Archivos

## 🎯 Problema Resuelto

El archivo Excel era muy grande y no se podía importar debido a límites de tamaño configurados en el servidor.

## ✅ Cambios Realizados

### 1. Program.cs - Configuración de Kestrel
**Antes:**
```csharp
options.Limits.MaxRequestBodySize = 52428800; // 50MB
```

**Ahora:**
```csharp
options.Limits.MaxRequestBodySize = 524_288_000; // 500MB
```

### 2. Program.cs - Configuración de FormOptions
**Agregado:**
```csharp
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524_288_000; // 500MB
    options.ValueLengthLimit = 524_288_000;
    options.MultipartHeadersLengthLimit = 524_288_000;
});
```

### 3. MaquinasController.cs - Endpoint de Importación
**Antes:**
```csharp
[RequestSizeLimit(100_000_000)] // 100MB limit
```

**Ahora:**
```csharp
[RequestSizeLimit(524_288_000)] // 500MB limit
[RequestFormLimits(MultipartBodyLengthLimit = 524_288_000)]
```

## 📊 Nuevos Límites

| Configuración                    | Antes  | Ahora  |
|----------------------------------|--------|--------|
| MaxRequestBodySize (Kestrel)     | 50MB   | 500MB  |
| MultipartBodyLengthLimit (Form)  | N/A    | 500MB  |
| RequestSizeLimit (Endpoint)      | 100MB  | 500MB  |

## 🚀 Despliegue

Después de hacer estos cambios:

1. **Compilar el proyecto:**
   ```bash
   dotnet build
   ```

2. **Hacer commit y push:**
   ```bash
   git add backend/Program.cs backend/Controllers/MaquinasController.cs
   git commit -m "feat: Aumentar límite de archivos a 500MB para importación masiva"
   git push origin render
   ```

3. **Render desplegará automáticamente** los cambios

4. **Probar la importación** con el archivo Excel grande

## ⚠️ Consideraciones

### Ventajas
- ✅ Permite importar archivos Excel muy grandes (hasta 500MB)
- ✅ Soporta múltiples hojas con miles de registros
- ✅ No requiere dividir archivos

### Desventajas
- ⚠️ Mayor uso de memoria durante la importación
- ⚠️ Tiempo de procesamiento más largo para archivos grandes
- ⚠️ Mayor consumo de ancho de banda

### Recomendaciones
1. **Monitorear memoria**: Verificar que el servidor tenga suficiente RAM
2. **Timeout**: Considerar aumentar timeout si archivos muy grandes tardan mucho
3. **Progreso**: Implementar barra de progreso en frontend para archivos grandes
4. **Validación**: Validar tamaño antes de subir en el frontend

## 🔍 Verificación

Para verificar que los cambios funcionan:

1. **Verificar límites en logs:**
   ```
   Buscar en logs de Render:
   "MaxRequestBodySize: 524288000"
   ```

2. **Probar con archivo grande:**
   - Subir archivo Excel > 50MB
   - Debe importarse correctamente
   - Verificar logs de importación

3. **Verificar respuesta:**
   ```json
   {
     "message": "Importación completada",
     "sheetsProcessed": 11,
     "totalCreated": 1500,
     "totalErrors": 0
   }
   ```

## 📝 Notas Adicionales

### Si aún hay problemas de tamaño:

1. **Aumentar timeout de Render:**
   - Ir a Settings → Environment
   - Agregar variable: `ASPNETCORE_REQUESTTIMEOUT=600` (10 minutos)

2. **Verificar límites de Render:**
   - Plan Free: Puede tener límites de memoria
   - Plan Starter: Mejor para archivos grandes

3. **Optimizar Excel:**
   - Eliminar formatos innecesarios
   - Eliminar hojas vacías
   - Comprimir imágenes si las hay

### Alternativa: Procesamiento por lotes

Si archivos son extremadamente grandes (>500MB), considerar:
- Dividir importación en múltiples archivos
- Procesar hojas de forma asíncrona
- Implementar cola de procesamiento

---

**Fecha**: 2026-02-15  
**Sistema**: FlexoAPP  
**Límite anterior**: 50MB  
**Límite nuevo**: 500MB  
**Factor de aumento**: 10x

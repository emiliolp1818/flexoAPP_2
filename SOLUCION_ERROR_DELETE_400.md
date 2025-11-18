# 🔴 ERROR 400 AL ELIMINAR DISEÑO

## Problema Identificado

```
DELETE http://localhost:7003/api/designs/f3333-COPIA 400 (Bad Request)
```

El backend está devolviendo **400 Bad Request** al intentar eliminar un diseño.

## Causa del Error

El error 400 indica que **el endpoint DELETE no está implementado correctamente en el backend** o no existe.

### Verificación en el Backend

El backend necesita tener este endpoint implementado:

```csharp
[HttpDelete("{articleF}")]
public async Task<IActionResult> DeleteDesign(string articleF)
{
    // Implementación de eliminación
}
```

## Solución

### OPCIÓN 1: Implementar el Endpoint DELETE en el Backend (RECOMENDADO)

Crear el endpoint en el controlador de diseños:

```csharp
[HttpDelete("{articleF}")]
public async Task<IActionResult> DeleteDesign(string articleF)
{
    try
    {
        // Decodificar el ArticleF de la URL
        articleF = Uri.UnescapeDataString(articleF);
        
        // Buscar el diseño en la base de datos
        var design = await _context.FlexographicDesigns
            .FirstOrDefaultAsync(d => d.ArticleF == articleF);
        
        if (design == null)
        {
            return NotFound(new { message = $"Diseño {articleF} no encontrado" });
        }
        
        // Eliminar el diseño
        _context.FlexographicDesigns.Remove(design);
        await _context.SaveChangesAsync();
        
        return Ok(new { 
            message = $"Diseño {articleF} eliminado exitosamente",
            articleF = articleF
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { 
            message = "Error al eliminar el diseño",
            error = ex.Message
        });
    }
}
```

### OPCIÓN 2: Usar ID en lugar de ArticleF (Temporal)

Si el backend solo acepta ID numérico, modificar el frontend:

```typescript
// En lugar de:
await this.http.delete(`${environment.apiUrl}/designs/${design.articleF}`).toPromise();

// Usar:
await this.http.delete(`${environment.apiUrl}/designs/${design.id}`).toPromise();
```

**NOTA:** Esta opción requiere que el diseño tenga un campo `id`.

## Diagnóstico Mejorado

He mejorado el código del frontend para mostrar más información cuando ocurre el error:

```typescript
✅ Logging detallado:
   - ArticleF del diseño
   - URL completa de la petición
   - Status del error
   - Mensaje de error del backend
   - Posibles causas del error 400
```

## Próximos Pasos

1. **Verificar el Backend:**
   - Abrir el archivo del controlador de diseños
   - Buscar el método `[HttpDelete]`
   - Si no existe, implementarlo

2. **Probar el Endpoint:**
   ```bash
   # Desde Postman o curl
   DELETE http://localhost:7003/api/designs/f3333-COPIA
   ```

3. **Revisar Logs:**
   - Abrir consola del navegador (F12)
   - Intentar eliminar un diseño
   - Copiar los logs completos

## Código del Frontend (Ya Implementado)

El frontend ahora muestra mensajes claros:

- ✅ Error 400: "El servidor no acepta la petición de eliminación. El endpoint DELETE puede no estar implementado."
- ✅ Error 404: "Diseño no encontrado"
- ✅ Error 405: "Método no permitido"
- ✅ Logging completo en consola

## Resumen

**El problema está en el BACKEND, no en el FRONTEND.**

El frontend está enviando la petición correctamente, pero el backend no tiene implementado el endpoint DELETE o está devolviendo 400 por alguna validación.

**Acción requerida:** Implementar el endpoint DELETE en el backend del controlador de diseños.

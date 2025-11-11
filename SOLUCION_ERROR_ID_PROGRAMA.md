# Solución: Error "El programa no tiene un ID válido"

## Problema Identificado

El error ocurría en `machines.ts:484` cuando se intentaba cambiar el estado de un programa:

```
❌ Error: El programa no tiene un ID válido {id: undefined, numeroMaquina: 11, articulo: 'F204567', ...}
```

### Causa Raíz

La tabla `maquinas` en MySQL usa `articulo` como clave primaria (PRIMARY KEY) en lugar de un campo auto-incremental `id`. El backend no estaba retornando un campo `id` en las respuestas JSON, pero el frontend esperaba este campo para identificar cada programa.

## Solución Implementada

### 1. Backend - MaquinasController.cs

Se agregó el campo `id` a todas las respuestas JSON, usando el valor de `articulo` como ID:

#### GET /api/maquinas
```csharp
var result = maquinas.Select(m => new
{
    id = m.Articulo, // ✅ NUEVO: ID para compatibilidad con frontend
    articulo = m.Articulo,
    numeroMaquina = m.NumeroMaquina,
    // ... resto de campos
});
```

#### PATCH /api/maquinas/{articulo}/status
```csharp
return Ok(new
{
    success = true,
    data = new
    {
        id = maquina.Articulo, // ✅ NUEVO: ID para compatibilidad con frontend
        articulo = maquina.Articulo,
        // ... resto de campos
    }
});
```

#### POST /api/maquinas/test
```csharp
return Ok(new
{
    success = true,
    data = new
    {
        id = maquinaPrueba.Articulo, // ✅ NUEVO: ID para compatibilidad con frontend
        articulo = maquinaPrueba.Articulo,
        // ... resto de campos
    }
});
```

#### GET /api/maquinas/machine/{numeroMaquina}
```csharp
var result = programs.Select(p => new
{
    id = p.Articulo, // ✅ NUEVO: ID para compatibilidad con frontend
    articulo = p.Articulo,
    // ... resto de campos
});
```

### 2. Frontend - machines.ts

Se mejoró la lógica de generación de ID para usar `articulo` como fallback:

```typescript
// ===== GENERACIÓN DE ID =====
// El backend ahora devuelve el campo 'id' usando 'articulo' como valor
// Si por alguna razón no viene, usar 'articulo' directamente como fallback
const programId = program.id || program.articulo || 
  `temp-${program.articulo}-${program.otSap}-${program.numeroMaquina || program.machineNumber || 11}`.replace(/\s+/g, '-');
```

## Archivos Modificados

1. `backend/Controllers/MaquinasController.cs`
   - Agregado campo `id` en GET /api/maquinas (línea ~90)
   - Agregado campo `id` en PATCH /api/maquinas/{articulo}/status (línea ~270)
   - Agregado campo `id` en POST /api/maquinas/test (línea ~365)
   - Agregado campo `id` en GET /api/maquinas/machine/{numeroMaquina} (línea ~435)

2. `Frontend/src/app/shared/components/machines/machines.ts`
   - Mejorada lógica de generación de ID (línea ~265)

## Verificación

Para verificar que el fix funciona correctamente:

1. **Reiniciar el backend:**
   ```bash
   cd backend
   dotnet run
   ```

2. **Verificar que el endpoint retorna el campo `id`:**
   ```bash
   curl http://localhost:5000/api/maquinas
   ```
   
   Deberías ver en la respuesta:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "F204567",
         "articulo": "F204567",
         "numeroMaquina": 11,
         ...
       }
     ]
   }
   ```

3. **Probar cambio de estado en el frontend:**
   - Abrir el módulo de máquinas
   - Seleccionar una máquina
   - Cambiar el estado de un programa (LISTO → CORRIENDO)
   - Verificar que no aparece el error "El programa no tiene un ID válido"

## Notas Técnicas

- La tabla `maquinas` usa `articulo VARCHAR(50)` como PRIMARY KEY
- No hay campo auto-incremental `id` en la base de datos
- El campo `articulo` es único y sirve perfectamente como identificador
- Esta solución mantiene la compatibilidad con el frontend sin modificar la estructura de la base de datos

## Estado

✅ **SOLUCIONADO** - El error ya no debería aparecer. Todos los endpoints ahora retornan el campo `id` requerido por el frontend.

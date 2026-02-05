# Guía de Depuración - Colores Pantone

## Cambios Aplicados

### ✅ Eliminado Debug Stats del HTML
- Removido el bloque de debug que mostraba estadísticas en la interfaz

### ✅ Mejorados Logs de Depuración
- Logs más detallados para identificar por qué no se cargan los colores
- Información sobre extracción de artículos
- Detalles de errores en llamadas al endpoint

---

## Pasos para Depurar

### 1. Abrir la Consola del Navegador
- Presionar F12
- Ir a la pestaña "Console"

### 2. Ir a Reportes y Buscar
- Aplicar filtros (opcional)
- Hacer clic en "Buscar"

### 3. Revisar Logs en Consola

#### A. Verificar Enriquecimiento de Colores
Buscar en la consola:
```
🎨 ===== INICIO ENRIQUECIMIENTO DE COLORES PANTONE =====
🎨 Total actividades de máquinas: X
🎨 Artículos únicos encontrados: Y
🎨 Lista de artículos: [...]
🎨 Debug de extracción de artículos: [...]
```

**¿Qué verificar?**
- ¿Se encontraron artículos? (Y > 0)
- ¿Los artículos tienen valores válidos? (no son null, undefined, o '-')
- ¿Los artículos coinciden con los de la tabla `designs`?

#### B. Verificar Consultas al Endpoint
Para cada artículo, buscar:
```
🔍 Consultando: http://localhost:5000/api/designs/pantone-colors/FXXXXXX
🎨 ✅ Colores Pantone para FXXXXXX: Y ["P-102", "P-485", ...]
```

**Si hay error:**
```
❌ Error al obtener colores Pantone para FXXXXXX: {
  status: 404,
  message: "Not Found",
  url: "..."
}
```

#### C. Verificar Cache
```
🎨 ===== CACHE DE COLORES PANTONE =====
🎨 Contenido del cache: [["FXXXXXX", Y], ...]
✅ Enriquecimiento de colores Pantone completado
```

#### D. Verificar Uso del Cache
Al procesar pedidos:
```
⚠️ Artículo FXXXXXX no encontrado en cache de colores Pantone
```

---

## Problemas Comunes y Soluciones

### Problema 1: No se encuentran artículos
**Síntoma:**
```
🎨 Artículos únicos encontrados: 0
⚠️ NO SE ENCONTRARON ARTÍCULOS - No se consultarán colores Pantone
```

**Causas posibles:**
1. Las actividades no tienen el campo `articulo` en `details`
2. El campo `articulo` está vacío o es '-'
3. No hay actividades de máquinas

**Solución:**
1. Verificar que las actividades tengan datos en `details`:
```javascript
// En la consola del navegador:
activities.filter(a => a.module === 'MACHINES').forEach(a => {
  console.log('Details:', a.details);
});
```

2. Verificar estructura de `details`:
```sql
-- En la base de datos:
SELECT details FROM activities 
WHERE module = 'MACHINES' 
LIMIT 5;
```

### Problema 2: Endpoint devuelve 404
**Síntoma:**
```
❌ Error al obtener colores Pantone para FXXXXXX: {
  status: 404,
  message: "Not Found"
}
```

**Causas posibles:**
1. El artículo no existe en la tabla `designs`
2. El backend no está corriendo
3. El endpoint no está configurado correctamente

**Solución:**
1. Verificar que el artículo existe:
```sql
SELECT * FROM designs WHERE ArticleF = 'FXXXXXX';
```

2. Verificar que el backend esté corriendo:
```bash
# Probar el endpoint directamente:
curl http://localhost:5000/api/designs/pantone-colors/FXXXXXX
```

3. Si no existe, verificar qué artículos hay:
```sql
SELECT ArticleF FROM designs LIMIT 10;
```

### Problema 3: Artículos no coinciden
**Síntoma:**
```
🎨 Lista de artículos: ["F204567", "F305678"]
```
Pero en la base de datos:
```sql
SELECT ArticleF FROM designs;
-- Resultado: F-204567, F-305678 (con guión)
```

**Solución:**
Verificar formato de artículos:
- ¿Tienen guión? (F-204567 vs F204567)
- ¿Tienen espacios?
- ¿Mayúsculas/minúsculas?

### Problema 4: Colores no tienen formato P-
**Síntoma:**
```
🎨 ✅ Colores Pantone para FXXXXXX: 0 []
```

**Solución:**
Verificar formato de colores en la base de datos:
```sql
SELECT Color1, Color2, Color3, Color4, Color5 
FROM designs 
WHERE ArticleF = 'FXXXXXX';
```

Los colores deben tener formato: `P-102`, `P-485`, etc.

Si tienen otro formato (ej: `Pantone 102`, `102`, etc.), actualizar:
```sql
UPDATE designs 
SET Color1 = CONCAT('P-', Color1)
WHERE ArticleF = 'FXXXXXX' 
AND Color1 NOT LIKE 'P-%';
```

---

## Checklist de Verificación

### Backend
- [ ] Backend está corriendo
- [ ] Endpoint responde: `GET /api/designs/pantone-colors/{articleF}`
- [ ] Tabla `designs` tiene datos
- [ ] Campo `ArticleF` tiene valores
- [ ] Colores tienen formato "P-XXX"

### Frontend
- [ ] Se ejecuta `enrichActivitiesWithPantoneColors`
- [ ] Se encuentran artículos (> 0)
- [ ] Se consulta el endpoint para cada artículo
- [ ] Se puebla el cache correctamente
- [ ] Se usa el cache al procesar actividades

### Datos
- [ ] Artículos en `maquinas` coinciden con `designs`
- [ ] Formato de artículos es consistente
- [ ] Colores tienen prefijo "P-"
- [ ] No hay espacios en blanco extra

---

## Comandos Útiles

### Verificar artículos en base de datos
```sql
-- Ver todos los artículos
SELECT DISTINCT ArticleF FROM designs ORDER BY ArticleF;

-- Ver artículos con colores
SELECT ArticleF, Color1, Color2, Color3, Color4, Color5 
FROM designs 
WHERE Color1 IS NOT NULL 
LIMIT 10;

-- Contar colores Pantone por artículo
SELECT ArticleF,
  (CASE WHEN Color1 LIKE 'P-%' THEN 1 ELSE 0 END +
   CASE WHEN Color2 LIKE 'P-%' THEN 1 ELSE 0 END +
   CASE WHEN Color3 LIKE 'P-%' THEN 1 ELSE 0 END +
   CASE WHEN Color4 LIKE 'P-%' THEN 1 ELSE 0 END +
   CASE WHEN Color5 LIKE 'P-%' THEN 1 ELSE 0 END) as pantone_count
FROM designs
WHERE ArticleF = 'FXXXXXX';
```

### Probar endpoint desde navegador
```
http://localhost:5000/api/designs/pantone-colors/F204567
```

### Ver logs del backend
```bash
# En la terminal donde corre el backend
# Buscar logs como:
🎨 Getting Pantone colors for article: F204567
```

---

## Ejemplo de Logs Exitosos

```
🎨 ===== INICIO ENRIQUECIMIENTO DE COLORES PANTONE =====
🎨 Total actividades de máquinas: 6
🎨 Artículos únicos encontrados: 2
🎨 Lista de artículos: ["F204567", "F305678"]
🎨 Debug de extracción de artículos: [
  { activityId: 1, articulo: "F204567", otSap: "313430", details: "Sí", newValues: "Sí" },
  { activityId: 2, articulo: "F204567", otSap: "313430", details: "Sí", newValues: "Sí" },
  { activityId: 3, articulo: "F305678", otSap: "313431", details: "Sí", newValues: "Sí" },
  ...
]
🔍 Consultando: http://localhost:5000/api/designs/pantone-colors/F204567
🎨 ✅ Colores Pantone para F204567: 4 ["P-102", "P-485", "P-1235", "P-877"]
🔍 Consultando: http://localhost:5000/api/designs/pantone-colors/F305678
🎨 ✅ Colores Pantone para F305678: 3 ["P-200", "P-300", "P-400"]
🎨 ===== CACHE DE COLORES PANTONE =====
🎨 Contenido del cache: [["F204567", 4], ["F305678", 3]]
✅ Enriquecimiento de colores Pantone completado

🔧 ===== PEDIDOS AGRUPADOS =====
🔧 Total de pedidos únicos: 2
🔧 Pedido #1: { articulo: "F204567", numeroColores: 4, ... }
🔧 Pedido #2: { articulo: "F305678", numeroColores: 3, ... }

🔧 ===== ESTADÍSTICAS DE COLORES =====
🔧 Total de colores: 7
🔧 Pedidos con colores: 2
🔧 Promedio de colores: 3.5
```

---

**Fecha:** 2026-02-05  
**Estado:** ✅ LISTO PARA DEPURAR

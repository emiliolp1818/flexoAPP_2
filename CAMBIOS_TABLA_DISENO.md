# Cambios Implementados: Integración con Tabla de Diseño

## 📋 Resumen
Se ha modificado el módulo de máquinas para que al subir la programación desde Excel, el sistema consulte la tabla de diseño (`designs`) y use esa información si el artículo existe.

## 🎯 Objetivo
Cuando se carga un archivo Excel con programación de máquinas:
- **Si el artículo EXISTE en la tabla de diseño** → Se usa la información de la tabla de diseño (colores, cliente, sustrato, referencia, TD)
- **Si el artículo NO EXISTE en la tabla de diseño** → Se usa la información del Excel

## 📝 Cambios Realizados

### Archivo Modificado: `backend/Services/MaquinaService.cs`

#### 1. Actualización del Método `ProcessExcelLine`

Se agregó la siguiente lógica después de validar los campos obligatorios:

```csharp
// PASO 4B: CONSULTAR TABLA DE DISEÑO
// Buscar el artículo en la tabla designs usando el código de artículo
Design? designFromTable = await _context.Designs
    .Where(d => d.ArticleF == columns[1])
    .FirstOrDefaultAsync();
```

#### 2. Obtención de Colores

**ANTES:**
```csharp
// Siempre se generaban colores genéricos: COLOR1, COLOR2, COLOR3...
for (int i = 0; i < numeroColores; i++)
{
    colores.Add($"COLOR{i + 1}");
}
```

**DESPUÉS:**
```csharp
if (designFromTable != null)
{
    // Usar colores de la tabla de diseño
    if (!string.IsNullOrWhiteSpace(designFromTable.Color1)) colores.Add(designFromTable.Color1);
    if (!string.IsNullOrWhiteSpace(designFromTable.Color2)) colores.Add(designFromTable.Color2);
    // ... hasta Color10
}
else
{
    // Generar colores genéricos
    for (int i = 0; i < numeroColores; i++)
    {
        colores.Add($"COLOR{i + 1}");
    }
}
```

#### 3. Asignación de Campos del DTO

Se modificó la creación del DTO para usar información de la tabla de diseño cuando existe:

| Campo | Origen si existe en tabla de diseño | Origen si NO existe |
|-------|-------------------------------------|---------------------|
| **Cliente** | `designFromTable.Client` | Excel columna 3 |
| **Sustrato** | `designFromTable.Substrate` | Excel columna 9 |
| **Referencia** | `designFromTable.Description` | Excel columna 4 |
| **TD** | `designFromTable.Type` | Excel columna 5 |
| **Colores** | `designFromTable.Color1-10` | Genéricos (COLOR1, COLOR2...) |
| **Kilos** | Siempre del Excel | Excel columna 7 |
| **Fecha** | Siempre del Excel | Excel columna 8 |
| **OT SAP** | Siempre del Excel | Excel columna 2 |
| **Máquina** | Siempre del Excel | Excel columna 0 |

#### 4. Logs Mejorados

Se agregaron logs detallados para rastrear el origen de los datos:

```csharp
// Log cuando se encuentra el diseño
_logger.LogInformation("✅ Artículo '{Articulo}' encontrado en tabla de diseño - Se usará información de diseño", columns[1]);

// Log cuando NO se encuentra
_logger.LogInformation("⚠️ Artículo '{Articulo}' NO encontrado en tabla de diseño - Se usará información del Excel", columns[1]);

// Log del DTO creado con origen de datos
_logger.LogInformation("✅ DTO creado desde {Origen}: Máquina={Machine}, Artículo={Articulo}...", origenDatos, ...);
```

#### 5. Observaciones Actualizadas

Las observaciones ahora indican el origen de los datos:

```csharp
Observaciones = designFromTable != null 
    ? "Programa nuevo - Información de tabla de diseño - Pendiente de asignación de estado por operario"
    : "Programa nuevo - Información de Excel - Pendiente de asignación de estado por operario"
```

## 🔍 Flujo de Procesamiento

```
1. Usuario sube archivo Excel con programación
   ↓
2. Sistema lee cada fila del Excel
   ↓
3. Para cada fila:
   a. Extrae el código de artículo (columna 1)
   b. Busca el artículo en la tabla designs
   ↓
4. Si el artículo EXISTE en designs:
   ✅ Usa: Cliente, Sustrato, Referencia, TD, Colores de la tabla
   ✅ Usa: Kilos, Fecha, OT SAP, Máquina del Excel
   ↓
5. Si el artículo NO EXISTE en designs:
   ✅ Usa: Toda la información del Excel
   ✅ Genera: Colores genéricos (COLOR1, COLOR2...)
   ↓
6. Crea/actualiza el registro en la tabla maquinas
```

## 📊 Ejemplo Práctico

### Escenario 1: Artículo EXISTE en tabla de diseño

**Excel:**
```
MQ IMP | ARTICULO F | OT SAP  | CLIENTE      | REFERENCIA | TD   | NUM COLORES | KILOS | FECHA        | SUSTRATO
11     | F204567    | OT12345 | Cliente Excel| Ref Excel  | TD-1 | 4           | 1000  | 10-nov-25 PM | BOPP Excel
```

**Tabla de diseño (designs):**
```
ArticleF: F204567
Client: ABSORBENTES DE COLOMBIA S.A
Substrate: R PE COEX BCO
Description: IMP BL PROTECTORES MULTIESTILO
Type: LAMINA
Color1: CYAN
Color2: MAGENTA
Color3: YELLOW
Color4: BLACK
```

**Resultado en tabla maquinas:**
```
articulo: F204567
numero_maquina: 11
ot_sap: OT12345
cliente: ABSORBENTES DE COLOMBIA S.A  ← De tabla de diseño
referencia: IMP BL PROTECTORES MULTIESTILO  ← De tabla de diseño
td: LAMINA  ← De tabla de diseño
colores: ["CYAN", "MAGENTA", "YELLOW", "BLACK"]  ← De tabla de diseño
kilos: 1000  ← Del Excel
fecha_tinta_en_maquina: 2025-11-10 17:00:00  ← Del Excel
sustrato: R PE COEX BCO  ← De tabla de diseño
```

### Escenario 2: Artículo NO EXISTE en tabla de diseño

**Excel:**
```
MQ IMP | ARTICULO F | OT SAP  | CLIENTE      | REFERENCIA | TD   | NUM COLORES | KILOS | FECHA        | SUSTRATO
11     | F999999    | OT12345 | Cliente Excel| Ref Excel  | TD-1 | 4           | 1000  | 10-nov-25 PM | BOPP Excel
```

**Tabla de diseño (designs):**
```
(No existe F999999)
```

**Resultado en tabla maquinas:**
```
articulo: F999999
numero_maquina: 11
ot_sap: OT12345
cliente: Cliente Excel  ← Del Excel
referencia: Ref Excel  ← Del Excel
td: TD-1  ← Del Excel
colores: ["COLOR1", "COLOR2", "COLOR3", "COLOR4"]  ← Genéricos
kilos: 1000  ← Del Excel
fecha_tinta_en_maquina: 2025-11-10 17:00:00  ← Del Excel
sustrato: BOPP Excel  ← Del Excel
```

## ✅ Ventajas de esta Implementación

1. **Consistencia de Datos**: Los artículos que ya están en la tabla de diseño mantienen su información correcta
2. **Flexibilidad**: Los artículos nuevos pueden cargarse desde Excel sin problemas
3. **Trazabilidad**: Los logs y observaciones indican claramente el origen de los datos
4. **Manejo de Errores**: Si falla la consulta a la tabla de diseño, se usa la información del Excel como fallback
5. **No Rompe Funcionalidad Existente**: Si la tabla de diseño está vacía, todo funciona como antes

## 🧪 Pruebas Recomendadas

1. **Cargar artículo existente en tabla de diseño**
   - Verificar que use colores, cliente, sustrato de la tabla
   - Verificar que use kilos, fecha, OT del Excel

2. **Cargar artículo NO existente en tabla de diseño**
   - Verificar que use toda la información del Excel
   - Verificar que genere colores genéricos

3. **Cargar múltiples artículos mezclados**
   - Algunos en tabla de diseño, otros no
   - Verificar que cada uno use el origen correcto

4. **Verificar logs**
   - Revisar que los logs indiquen claramente el origen de datos
   - Verificar que los errores se manejen correctamente

## 📌 Notas Importantes

- Los campos **Kilos**, **Fecha**, **OT SAP** y **Número de Máquina** SIEMPRE se toman del Excel
- Solo se consulta la tabla de diseño para: **Cliente**, **Sustrato**, **Referencia**, **TD** y **Colores**
- Si hay error al consultar la tabla de diseño, se usa la información del Excel como fallback
- El código está completamente comentado en español para facilitar el mantenimiento

## 🔧 Mantenimiento Futuro

Si necesitas agregar más campos de la tabla de diseño:

1. Busca la sección `// ===== PASO 10: CREAR DTO CON LOS DATOS PROCESADOS =====`
2. Agrega la lógica similar a los campos existentes:
```csharp
string nuevoCampoFinal = designFromTable != null && !string.IsNullOrWhiteSpace(designFromTable.NuevoCampo)
    ? designFromTable.NuevoCampo  // De tabla de diseño
    : columns[X];                 // Del Excel
```
3. Usa `nuevoCampoFinal` en el DTO

---

**Fecha de implementación:** 2025-11-17  
**Desarrollador:** Kiro AI Assistant  
**Archivo modificado:** `backend/Services/MaquinaService.cs`

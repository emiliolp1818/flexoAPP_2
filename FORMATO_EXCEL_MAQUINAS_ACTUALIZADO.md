# Formato de Archivo Excel para Carga de Programación de Máquinas

## 📋 Estructura del Archivo

El archivo Excel debe contener **10 columnas** en el siguiente orden:

| # | Columna | Nombre | Tipo | Obligatorio | Descripción | Ejemplo |
|---|---------|--------|------|-------------|-------------|---------|
| 1 | A | **MQ IMP** | Número | ✅ Sí | Número de máquina impresora (11-21) | `11`, `12`, `13`, etc. |
| 2 | B | **ARTICULO F** | Texto | ✅ Sí | Código del artículo (único, clave primaria) | `F204567`, `ART-001` |
| 3 | C | **OT SAP** | Texto | ✅ Sí | Orden de trabajo SAP | `OT123456`, `SAP-789` |
| 4 | D | **CLIENTE** | Texto | ✅ Sí | Nombre del cliente | `ABSORBENTES DE COLOMBIA S.A` |
| 5 | E | **REFERENCIA** | Texto | ❌ No | Referencia del producto | `REF-001`, `PROD-ABC` |
| 6 | F | **TD** | Texto | ❌ No | Código TD (Tipo de Diseño) | `TD-ABC`, `DIS-123` |
| 7 | G | **NUMERO DE COLORES** | Número | ✅ Sí | Cantidad de colores (1-10) | `4`, `6`, `8` |
| 8 | H | **KILOS** | Decimal | ✅ Sí | Cantidad en kilogramos | `1500`, `2000.5`, `3250,75` |
| 9 | I | **COLORES EN MAQUINA** | Texto | ✅ Sí | Lista de colores separados por coma<br>**NOTA:** El encabezado puede mostrar una fecha (ej: "10-nov-25 05 PM") pero el contenido son los colores | `CYAN,MAGENTA,AMARILLO,NEGRO` |
| 10 | J | **SUSTRATOS** | Texto | ✅ Sí | Tipo de material base | `BOPP`, `PE`, `PET` |

---

## 📝 Ejemplo de Archivo Excel

### Fila de Encabezados (Fila 1):
```
MQ IMP | ARTICULO F | OT SAP | CLIENTE | REFERENCIA | TD | NUMERO DE COLORES | KILOS | COLORES EN MAQUINA (10-nov-25 05 PM) | SUSTRATOS
```
**NOTA:** El encabezado de la columna 9 puede mostrar una fecha como "10-nov-25 05 PM", pero el contenido de las celdas son los colores.

### Ejemplo de Datos (Fila 2):
```
11 | F204567 | OT123456 | ABSORBENTES DE COLOMBIA S.A | REF-001 | TD-ABC | 4 | 1500 | CYAN,MAGENTA,AMARILLO,NEGRO | BOPP
```

### Ejemplo de Datos (Fila 3):
```
12 | F204568 | OT123457 | CLIENTE EJEMPLO S.A.S | REF-002 | TD-XYZ | 6 | 2000.5 | CYAN,MAGENTA,AMARILLO,NEGRO,BLANCO,VERDE | PE
```

---

## ⚙️ Reglas de Procesamiento

### 1. **Campos Obligatorios**
Los siguientes campos **NO pueden estar vacíos**:
- ✅ MQ IMP (Columna A)
- ✅ ARTICULO F (Columna B) - **Clave primaria única**
- ✅ OT SAP (Columna C)
- ✅ CLIENTE (Columna D)
- ✅ NUMERO DE COLORES (Columna G)
- ✅ KILOS (Columna H)
- ✅ COLORES EN MAQUINA (Columna I)
- ✅ SUSTRATOS (Columna K)

### 2. **Formato de Colores**
- Los colores deben estar separados por **coma** (`,`) o **punto y coma** (`;`)
- Ejemplo válido: `CYAN,MAGENTA,AMARILLO,NEGRO`
- Ejemplo válido: `CYAN;MAGENTA;AMARILLO;NEGRO`
- Los espacios antes y después de cada color se eliminan automáticamente

### 3. **Formato de Kilos**
- Se acepta formato con **coma** (`,`) o **punto** (`.`) como separador decimal
- Ejemplo válido: `1500` (entero)
- Ejemplo válido: `2000.5` (decimal con punto)
- Ejemplo válido: `3250,75` (decimal con coma)
- Los espacios se eliminan automáticamente

### 4. **Formato de Fecha**
- Si no se proporciona fecha, se usa la **fecha y hora actual**
- Formatos aceptados:
  - `dd/MM/yyyy HH:mm` → `16/11/2024 14:30`
  - `yyyy-MM-dd` → `2024-11-16`
  - `dd/MM/yyyy` → `16/11/2024`

### 5. **Número de Máquina**
- Debe ser un número entre **11 y 21**
- Si no se puede parsear, se usa **11** por defecto

### 6. **Estado Inicial**
- Todos los programas se cargan **SIN ESTADO** (vacío)
- El operario debe asignar el primer estado manualmente:
  - `PREPARANDO` - Programa en preparación
  - `LISTO` - Programa listo para producción
  - `SUSPENDIDO` - Programa pausado
  - `CORRIENDO` - Programa en ejecución
  - `TERMINADO` - Programa completado

---

## 🔄 Comportamiento al Cargar Archivo

### Programas que se **MANTIENEN**:
- ✅ Programas en estado `PREPARANDO`
- ✅ Programas en estado `LISTO`
- ✅ Programas en estado `SUSPENDIDO`

### Programas que se **ELIMINAN**:
- ❌ Programas en estado `CORRIENDO` (se reemplazan con los nuevos)

### Programas **NUEVOS**:
- Se agregan con estado **vacío** (sin estado)
- El operario debe asignar el estado manualmente

---

## ⚠️ Errores Comunes

### Error: "Se esperan al menos 10 columnas"
**Causa:** El archivo no tiene las 10 columnas requeridas  
**Solución:** Verifica que el archivo tenga todas las columnas en el orden correcto

### Error: "El campo ARTICULO F es obligatorio"
**Causa:** La columna B (ARTICULO F) está vacía  
**Solución:** Asegúrate de que cada fila tenga un código de artículo único

### Error: "El campo CLIENTE es obligatorio"
**Causa:** La columna D (CLIENTE) está vacía  
**Solución:** Completa el nombre del cliente en todas las filas

### Error: "No se pudo parsear kilos"
**Causa:** El formato de kilos no es válido  
**Solución:** Usa solo números con punto o coma como separador decimal (ej: `1500`, `2000.5`, `3250,75`)

---

## 📊 Ejemplo Completo de Archivo Excel

```
MQ IMP | ARTICULO F | OT SAP    | CLIENTE                      | REFERENCIA | TD     | NUMERO DE COLORES | KILOS  | COLORES EN MAQUINA (10-nov-25 05 PM)  | SUSTRATOS
-------|------------|-----------|------------------------------|------------|--------|-------------------|--------|---------------------------------------|----------
11     | F204567    | OT123456  | ABSORBENTES DE COLOMBIA S.A  | REF-001    | TD-ABC | 4                 | 1500   | CYAN,MAGENTA,AMARILLO,NEGRO           | BOPP
12     | F204568    | OT123457  | CLIENTE EJEMPLO S.A.S        | REF-002    | TD-XYZ | 6                 | 2000.5 | CYAN,MAGENTA,AMARILLO,NEGRO,BLANCO,VERDE | PE
13     | F204569    | OT123458  | EMPRESA PRUEBA LTDA          | REF-003    | TD-123 | 3                 | 1750   | CYAN,MAGENTA,AMARILLO                 | PET
```

**NOTA:** El encabezado de la columna 9 muestra "COLORES EN MAQUINA (10-nov-25 05 PM)" pero el contenido de las celdas son los colores, no fechas.

---

## 🎯 Notas Importantes

1. **La primera fila debe contener los encabezados** (se ignora al procesar)
2. **El ARTICULO F es único** - Si se carga un artículo que ya existe, se actualiza
3. **Los colores deben coincidir con el número de colores** - Si hay discrepancia, se usa la lista de colores
4. **El archivo debe ser Excel (.xlsx, .xls)** - No se aceptan otros formatos
5. **Tamaño máximo: 10MB** - Archivos más grandes serán rechazados

---

**Última actualización:** 2024-11-16  
**Versión:** 2.1 (10 columnas - Estructura corregida con COLORES EN MAQUINA)

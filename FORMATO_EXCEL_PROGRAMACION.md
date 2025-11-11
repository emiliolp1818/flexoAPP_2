# 📊 Formato Excel para Cargar Programación de Máquinas

## 🎯 Columnas Requeridas (en orden)

El archivo Excel o CSV debe tener **exactamente** estas 11 columnas en este orden:

| Columna | Nombre | Tipo | Descripción | Ejemplo |
|---------|--------|------|-------------|---------|
| **A (0)** | MÁQUINA | Número | Número de la máquina (11-21) | 11 |
| **B (1)** | ARTÍCULO | Texto | Código del artículo | F204567 |
| **C (2)** | OT SAP | Texto | Orden de trabajo SAP | OT123456 |
| **D (3)** | CLIENTE | Texto | Nombre del cliente | ABSORBENTES DE COLOMBIA S.A |
| **E (4)** | REFERENCIA | Texto | Referencia del producto | REF-001 |
| **F (5)** | TD | Texto | Código TD (Tipo de Diseño) | TD-ABC |
| **G (6)** | N° COLORES | Número | Cantidad de colores | 4 |
| **H (7)** | COLORES | Texto | Lista de colores separados por coma | CYAN,MAGENTA,AMARILLO,NEGRO |
| **I (8)** | KILOS | Número | Cantidad en kilogramos | 1000 |
| **J (9)** | FECHA TINTA EN MÁQUINA | Fecha/Texto | Fecha de tinta (dd/mm/yyyy HH:mm) | 11/11/2025 14:30 |
| **K (10)** | SUSTRATO | Texto | Tipo de material base | BOPP |

**IMPORTANTE**: El archivo debe tener exactamente 11 columnas. No incluir columnas adicionales como ESTADO, OBSERVACIONES, etc.

---

## 📝 Ejemplo de Archivo Excel

### Fila 1 (Encabezados):
```
MÁQUINA | ARTÍCULO | OT SAP | CLIENTE | REFERENCIA | TD | N° COLORES | COLORES | KILOS | FECHA TINTA EN MÁQUINA | SUSTRATO
```

### Fila 2 (Datos):
```
11 | F204567 | OT123456 | ABSORBENTES DE COLOMBIA S.A | REF-001 | TD-ABC | 4 | CYAN,MAGENTA,AMARILLO,NEGRO | 1000 | 11/11/2025 14:30 | BOPP
```

### Fila 3 (Datos):
```
12 | F204568 | OT123457 | CLIENTE XYZ | REF-002 | TD-DEF | 3 | CYAN,MAGENTA,AMARILLO | 500 | 12/11/2025 08:00 | PE
```

---

## ✅ Reglas de Validación

### Columna MÁQUINA:
- ✅ Debe ser un número entre 11 y 21
- ❌ No puede estar vacío
- ❌ No puede ser texto

### Columna ARTÍCULO:
- ✅ Debe ser único (no se permiten duplicados)
- ❌ No puede estar vacío
- ✅ Puede contener letras y números

### Columna OT SAP:
- ✅ Puede contener letras y números
- ❌ No puede estar vacío

### Columna CLIENTE:
- ✅ Texto libre
- ❌ No puede estar vacío

### Columna REFERENCIA:
- ✅ Texto libre
- ⚪ Puede estar vacío

### Columna TD:
- ✅ Texto libre
- ⚪ Puede estar vacío

### Columna N° COLORES:
- ✅ Debe ser un número entre 1 y 10
- ✅ Debe coincidir con la cantidad de colores en la columna COLORES
- ❌ No puede estar vacío

### Columna COLORES:
- ✅ Lista de colores separados por coma (,)
- ✅ Ejemplo: "CYAN,MAGENTA,AMARILLO,NEGRO"
- ✅ Máximo 10 colores
- ❌ No puede estar vacío

### Columna KILOS:
- ✅ Debe ser un número positivo
- ✅ Puede tener decimales (ej: 1000.5)
- ❌ No puede estar vacío
- ❌ No puede ser negativo

### Columna FECHA TINTA EN MÁQUINA:
- ✅ Formato: dd/mm/yyyy HH:mm
- ✅ Ejemplo: 11/11/2025 14:30
- ✅ También acepta: dd/mm/yyyy (sin hora)
- ❌ No puede estar vacío

### Columna SUSTRATO:
- ✅ Texto libre
- ✅ Ejemplos comunes: BOPP, PE, PET, PP
- ⚪ Puede estar vacío

---

## 🔄 Proceso de Carga

### 1. Usuario hace clic en "Agregar Programación"
- Se abre el selector de archivos
- Solo acepta: .xlsx, .xls, .csv

### 2. Usuario selecciona el archivo
- Se valida el tipo de archivo
- Se valida el tamaño (máximo 10MB)

### 3. Archivo se envía al backend
- El backend procesa el Excel/CSV
- Valida cada fila según las reglas
- Convierte los datos al formato de la base de datos

### 4. Backend retorna los programas procesados
- Frontend recibe los programas nuevos
- Mantiene los programas existentes en estado PREPARANDO, LISTO o SUSPENDIDO
- Elimina solo los programas en estado CORRIENDO

### 5. Frontend actualiza la tabla
- Combina programas mantenidos + programas nuevos
- Selecciona automáticamente la primera máquina con programas
- Muestra notificación de éxito

---

## 📋 Plantilla Excel

### Descargar Plantilla:
El usuario puede descargar una plantilla Excel con:
- Encabezados correctos
- Ejemplos de datos
- Validaciones de datos (listas desplegables)
- Formato de celdas correcto

### Contenido de la Plantilla:
```excel
Hoja: Programación de Máquinas

Fila 1 (Encabezados en negrita, fondo gris):
MÁQUINA | ARTÍCULO | OT SAP | CLIENTE | REFERENCIA | TD | N° COLORES | COLORES | KILOS | FECHA TINTA EN MÁQUINA | SUSTRATO

Fila 2 (Ejemplo 1):
11 | F204567 | OT123456 | ABSORBENTES DE COLOMBIA S.A | REF-001 | TD-ABC | 4 | CYAN,MAGENTA,AMARILLO,NEGRO | 1000 | 11/11/2025 14:30 | BOPP

Fila 3 (Ejemplo 2):
12 | F204568 | OT123457 | CLIENTE XYZ | REF-002 | TD-DEF | 3 | CYAN,MAGENTA,AMARILLO | 500 | 12/11/2025 08:00 | PE

Fila 4 en adelante: Vacías para que el usuario llene
```

---

## ⚠️ Errores Comunes

### Error: "Formato de archivo inválido"
**Causa**: Las columnas no coinciden con el formato esperado
**Solución**: Verificar que los encabezados sean exactamente como se especifica

### Error: "MÁQUINA debe ser un número entre 11 y 21"
**Causa**: Número de máquina fuera de rango
**Solución**: Usar solo números del 11 al 21

### Error: "ARTÍCULO duplicado"
**Causa**: Dos filas tienen el mismo código de artículo
**Solución**: Cada artículo debe ser único

### Error: "N° COLORES no coincide con COLORES"
**Causa**: La cantidad de colores no coincide con la lista
**Solución**: Si N° COLORES es 4, debe haber 4 colores separados por coma

### Error: "FECHA TINTA EN MÁQUINA inválida"
**Causa**: Formato de fecha incorrecto
**Solución**: Usar formato dd/mm/yyyy HH:mm (ej: 11/11/2025 14:30)

---

## 💡 Consejos

1. **Usa la plantilla**: Descarga la plantilla para evitar errores de formato
2. **Revisa los datos**: Verifica que no haya celdas vacías en columnas requeridas
3. **Formato de fecha**: Excel puede cambiar el formato automáticamente, verifica que sea dd/mm/yyyy
4. **Colores**: Separa los colores con coma sin espacios (CYAN,MAGENTA,AMARILLO)
5. **Máquinas**: Solo usa números del 11 al 21
6. **Artículos únicos**: No repitas códigos de artículo

---

## 🎨 Formato Visual del Excel

```
┌──────────┬──────────┬──────────┬─────────────────────────────┬────────────┬────────┬───────────┬──────────────────────────────┬───────┬─────────────────────────┬──────────┐
│ MÁQUINA  │ ARTÍCULO │ OT SAP   │ CLIENTE                     │ REFERENCIA │ TD     │ N° COLORES│ COLORES                      │ KILOS │ FECHA TINTA EN MÁQUINA  │ SUSTRATO │
├──────────┼──────────┼──────────┼─────────────────────────────┼────────────┼────────┼───────────┼──────────────────────────────┼───────┼─────────────────────────┼──────────┤
│ 11       │ F204567  │ OT123456 │ ABSORBENTES DE COLOMBIA S.A │ REF-001    │ TD-ABC │ 4         │ CYAN,MAGENTA,AMARILLO,NEGRO  │ 1000  │ 11/11/2025 14:30        │ BOPP     │
├──────────┼──────────┼──────────┼─────────────────────────────┼────────────┼────────┼───────────┼──────────────────────────────┼───────┼─────────────────────────┼──────────┤
│ 12       │ F204568  │ OT123457 │ CLIENTE XYZ                 │ REF-002    │ TD-DEF │ 3         │ CYAN,MAGENTA,AMARILLO        │ 500   │ 12/11/2025 08:00        │ PE       │
└──────────┴──────────┴──────────┴─────────────────────────────┴────────────┴────────┴───────────┴──────────────────────────────┴───────┴─────────────────────────┴──────────┘
```

---

**Fecha de creación**: 11 de noviembre de 2025  
**Versión**: 1.0  
**Estado**: ✅ DOCUMENTADO

# Orden de Columnas del Excel - Módulo de Máquinas

## Formato del Archivo Excel

El archivo Excel debe tener **13 columnas** (de la B a la N). La columna A se ignora.

### Estructura de Columnas

| Columna | Nombre | Descripción | Tipo | Obligatorio | Ejemplo |
|---------|--------|-------------|------|-------------|---------|
| **B** (0) | MQ IMP | Número de máquina impresora | Número (11-21) | ✅ Sí | 15 |
| **C** (1) | ARTICULO F | Código del artículo (clave primaria) | Texto | ✅ Sí | F204567 |
| **D** (2) | OT SAP | Orden de trabajo SAP | Texto | ✅ Sí | 12345678 |
| **E** (3) | CLIENTE | Nombre del cliente | Texto | ✅ Sí | ABSORBENTES DE COLOMBIA S.A |
| **F** (4) | REFERENCIA | Referencia del producto | Texto | ❌ No | REF-001 |
| **G** (5) | TD | Código TD (Tipo de Diseño) | Texto | ❌ No | TD-ABC |
| **H** (6) | TIMP | Tipo de impresión | Texto | ❌ No | 07A |
| **I** (7) | NUMERO DE COLORES | Cantidad de colores | Número (1-10) | ✅ Sí | 4 |
| **J** (8) | KILOS | Cantidad en kilogramos | Decimal | ✅ Sí | 150.500 |
| **K** (9) | METROS | Metros a fabricar | Decimal | ❌ No | 5000.00 |
| **L** (10) | COLORES EN MAQUINA | Fecha límite para tener colores listos | Fecha/Hora | ✅ Sí | 10/11/2025 17:00 |
| **M** (11) | SUSTRATOS | Tipo de material base | Texto | ✅ Sí | BOPP |
| **N** (12) | COLORES | Colores del pedido separados por coma | Texto | ✅ Sí | Cyan,Magenta,Amarillo,Negro |

## Notas Importantes

### 1. Columna A (Ignorada)
- La columna A del Excel se ignora completamente
- Puede contener cualquier información o estar vacía
- El sistema comienza a leer desde la columna B

### 2. Fila de Encabezados
- La fila 1 debe contener los encabezados de las columnas
- Los datos comienzan desde la fila 2

### 3. Formato de Fecha (Columna L)
- Formato esperado: `dd/MM/yyyy HH:mm`
- Ejemplo: `10/11/2025 17:00`
- Esta es la fecha límite para tener los colores preparados en la máquina

### 4. Formato de Colores (Columna N)
- Los colores deben estar separados por comas
- Ejemplo: `Cyan,Magenta,Amarillo,Negro`
- No usar espacios después de las comas
- La cantidad de colores debe coincidir con el número en la columna I

### 5. Número de Máquina (Columna B)
- Valores válidos: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
- Si no se puede parsear, se usa 11 por defecto

### 6. Integración con Tabla de Diseño
- El sistema busca el artículo (columna C) en la tabla `designs`
- Si el artículo existe en `designs`, se usa la información de diseño (cliente, sustrato, colores)
- Si NO existe, se usa la información del Excel

## Ejemplo de Fila Válida

```
B: 15
C: F204567
D: 12345678
E: ABSORBENTES DE COLOMBIA S.A
F: REF-001
G: TD-ABC
H: 07A
I: 4
J: 150.500
K: 5000.00
L: 10/11/2025 17:00
M: BOPP
N: Cyan,Magenta,Amarillo,Negro
```

## Validaciones del Sistema

### Campos Obligatorios
El sistema valida que los siguientes campos NO estén vacíos:
- ARTICULO F (columna C)
- OT SAP (columna D)
- CLIENTE (columna E)

### Validación de Columnas
- El archivo debe tener al menos 13 columnas
- Si tiene menos, se rechaza con un mensaje de error detallado

### Comportamiento de Carga
1. **Programas TERMINADOS y SIN_ASIGNAR**: Se eliminan y reemplazan con la nueva programación
2. **Programas PREPARANDO, LISTO, SUSPENDIDO, CORRIENDO**: Se mantienen y actualizan con la nueva información
3. **Duplicados**: Si hay duplicados por OT SAP, se mantiene el más reciente

## Tipos de Archivo Soportados
- `.xlsx` (Excel moderno)
- `.xls` (Excel antiguo)

## Tamaño Máximo
- 10 MB por archivo

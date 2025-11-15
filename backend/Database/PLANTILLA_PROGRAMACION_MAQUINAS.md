# 📋 PLANTILLA PARA CARGAR PROGRAMACIÓN DE MÁQUINAS

## Formato del Archivo Excel

El archivo Excel debe tener **exactamente estas columnas en este orden**:

| Columna | Nombre | Descripción | Ejemplo | Obligatorio |
|---------|--------|-------------|---------|-------------|
| 1 | **MQ** | Número de máquina (11-21) | 15 | ✅ Sí |
| 2 | **ARTICULO F** | Código del artículo | F204567 | ✅ Sí |
| 3 | **OT SAP** | Orden de trabajo SAP | OT123456 | ✅ Sí |
| 4 | **CLIENTE** | Nombre del cliente | ABSORBENTES DE COLOMBIA S.A | ✅ Sí |
| 5 | **REFERENCIA** | Referencia del producto | REF-001 | ❌ No |
| 6 | **TD** | Código TD (Tipo de Diseño) | TD1 | ❌ No |
| 7 | **N° COLORES** | Cantidad de colores (1-10) | 4 | ✅ Sí |
| 8 | **KILOS** | Cantidad en kilogramos | 1500.50 | ✅ Sí |
| 9 | **FECHA TINTAS EN MAQUINA** | Fecha de aplicación de tinta | 14/11/2024 08:00 | ✅ Sí |
| 10 | **SUSTRATOS** | Tipo de material base | BOPP | ✅ Sí |

## Ejemplo de Datos

```
MQ | ARTICULO F | OT SAP    | CLIENTE                      | REFERENCIA | TD  | N° COLORES | KILOS   | FECHA TINTAS EN MAQUINA | SUSTRATOS
11 | F204567    | OT123456  | ABSORBENTES DE COLOMBIA S.A  | REF-001    | TD1 | 4          | 1500.50 | 14/11/2024 08:00       | BOPP
12 | F204568    | OT123457  | EMPAQUES DEL VALLE LTDA      | REF-002    | TD2 | 6          | 2000.00 | 14/11/2024 09:00       | PE
13 | F204569    | OT123458  | PLASTICOS INDUSTRIALES S.A.S | REF-003    | TD3 | 3          | 800.00  | 14/11/2024 10:00       | PET
```

## Notas Importantes

1. **La primera fila debe contener los encabezados** (nombres de las columnas)
2. **Los datos comienzan en la fila 2**
3. **No dejes filas vacías** entre los datos
4. **El formato de fecha** puede ser: `dd/mm/yyyy HH:mm` o `dd/mm/yyyy`
5. **Los kilos** pueden usar punto o coma como separador decimal (ej: `1500.50` o `1500,50`)
6. **El número de máquina** debe estar entre 11 y 21
7. **El número de colores** debe estar entre 1 y 10

## Formato de Archivo

- **Extensión permitida**: `.xlsx` o `.xls`
- **Tamaño máximo**: 10 MB
- **Codificación**: UTF-8 (para caracteres especiales)

## Comportamiento al Cargar

- Los programas en estado **CORRIENDO** serán eliminados antes de cargar los nuevos
- Si un artículo ya existe, será **actualizado** con los nuevos datos
- Los programas nuevos se crearán con estado **PREPARANDO**
- Los colores se generarán automáticamente como COLOR1, COLOR2, etc.

## Ejemplo de Archivo Excel

Puedes crear un archivo Excel con esta estructura:

**Fila 1 (Encabezados):**
```
MQ | ARTICULO F | OT SAP | CLIENTE | REFERENCIA | TD | N° COLORES | KILOS | FECHA TINTAS EN MAQUINA | SUSTRATOS
```

**Fila 2 (Datos):**
```
15 | F204567 | OT123456 | ABSORBENTES DE COLOMBIA S.A | REF-001 | TD1 | 4 | 1500.50 | 14/11/2024 08:00 | BOPP
```

## Solución de Problemas

### Error: "Formato de archivo inválido"
- ✅ Verifica que el archivo tenga **exactamente 10 columnas**
- ✅ Verifica que la **primera fila contenga los encabezados**
- ✅ Verifica que haya **al menos una fila de datos** (fila 2)
- ✅ Verifica que las columnas obligatorias **no estén vacías**

### Error: "El campo ARTICULO F es obligatorio"
- ✅ La columna 2 (ARTICULO F) no puede estar vacía

### Error: "El campo OT SAP es obligatorio"
- ✅ La columna 3 (OT SAP) no puede estar vacía

### Error: "El campo CLIENTE es obligatorio"
- ✅ La columna 4 (CLIENTE) no puede estar vacía

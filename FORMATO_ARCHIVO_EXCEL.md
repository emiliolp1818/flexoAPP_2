# FORMATO DEL ARCHIVO EXCEL PARA CARGA DE PROGRAMACION

## Estructura Requerida

El archivo Excel debe tener **exactamente 10 columnas** en este orden:

| # | Columna | Tipo | Obligatorio | Ejemplo | Descripción |
|---|---------|------|-------------|---------|-------------|
| 1 | MQ | Número | ✅ Sí | 15 | Número de máquina (11-21) |
| 2 | ARTICULO F | Texto | ✅ Sí | F204567 | Código único del artículo |
| 3 | OT SAP | Texto | ✅ Sí | OT123456 | Orden de trabajo SAP |
| 4 | CLIENTE | Texto | ✅ Sí | ABSORBENTES DE COLOMBIA S.A | Nombre del cliente |
| 5 | REFERENCIA | Texto | ❌ No | REF-001 | Referencia del producto |
| 6 | TD | Texto | ❌ No | TD1 | Código TD (Tipo de Diseño) |
| 7 | N° COLORES | Número | ✅ Sí | 4 | Cantidad de colores (1-10) |
| 8 | KILOS | Decimal | ✅ Sí | 1500.50 | Cantidad en kilogramos |
| 9 | FECHA TINTAS EN MAQUINA | Fecha | ✅ Sí | 14/11/2024 10:30 | Fecha y hora de tinta |
| 10 | SUSTRATOS | Texto | ✅ Sí | BOPP | Tipo de material base |

---

## Ejemplo de Archivo Excel

### Fila 1 (Encabezados):
```
MQ | ARTICULO F | OT SAP | CLIENTE | REFERENCIA | TD | N° COLORES | KILOS | FECHA TINTAS EN MAQUINA | SUSTRATOS
```

### Fila 2 (Datos):
```
15 | F204567 | OT123456 | ABSORBENTES DE COLOMBIA S.A | REF-001 | TD1 | 4 | 1500.50 | 14/11/2024 10:30 | BOPP
```

### Fila 3 (Datos):
```
16 | F204568 | OT123457 | CLIENTE EJEMPLO S.A.S | REF-002 | TD2 | 6 | 2000.00 | 14/11/2024 11:00 | PE
```

---

## Reglas Importantes

### ✅ Campos Obligatorios
- **MQ**: Debe ser un número entre 11 y 21
- **ARTICULO F**: No puede estar vacío (es la clave primaria)
- **OT SAP**: No puede estar vacío
- **CLIENTE**: No puede estar vacío
- **N° COLORES**: Debe ser un número entre 1 y 10
- **KILOS**: Debe ser un número decimal positivo
- **FECHA TINTAS EN MAQUINA**: Debe ser una fecha válida
- **SUSTRATOS**: No puede estar vacío

### ❌ Errores Comunes

1. **"Se esperan al menos 10 columnas"**
   - Solución: Verifica que tu archivo tenga exactamente 10 columnas
   - No elimines columnas aunque estén vacías

2. **"El campo ARTICULO F es obligatorio"**
   - Solución: Asegúrate de que la columna 2 tenga un valor en todas las filas

3. **"El campo OT SAP es obligatorio"**
   - Solución: Asegúrate de que la columna 3 tenga un valor en todas las filas

4. **"El campo CLIENTE es obligatorio"**
   - Solución: Asegúrate de que la columna 4 tenga un valor en todas las filas

### 📝 Notas

- La primera fila debe contener los encabezados
- Las filas vacías se ignoran automáticamente
- Los campos opcionales pueden dejarse vacíos pero la columna debe existir
- El formato de fecha puede ser: dd/mm/yyyy HH:mm o dd/mm/yyyy
- Los kilos pueden usar punto o coma como separador decimal (1500.50 o 1500,50)

---

## Ejemplo de Archivo Válido

```
MQ	ARTICULO F	OT SAP	CLIENTE	REFERENCIA	TD	N° COLORES	KILOS	FECHA TINTAS EN MAQUINA	SUSTRATOS
15	F204567	OT123456	ABSORBENTES DE COLOMBIA S.A	REF-001	TD1	4	1500.50	14/11/2024 10:30	BOPP
16	F204568	OT123457	CLIENTE EJEMPLO S.A.S	REF-002	TD2	6	2000.00	14/11/2024 11:00	PE
17	F204569	OT123458	OTRO CLIENTE LTDA		TD3	3	800.00	14/11/2024 12:00	PET
```

---

## Verificación Antes de Cargar

Antes de cargar el archivo, verifica:

1. ✅ El archivo es .xlsx o .xls
2. ✅ Tiene exactamente 10 columnas
3. ✅ La primera fila tiene los encabezados
4. ✅ Todas las filas de datos tienen valores en las columnas obligatorias
5. ✅ Los números de máquina están entre 11 y 21
6. ✅ Las fechas tienen formato válido
7. ✅ Los kilos son números positivos

---

Fecha: 2025-11-14

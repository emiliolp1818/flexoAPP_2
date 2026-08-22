# Formato de Excel para Importar Códigos de Tintas

## Estructura del Archivo

El archivo Excel debe tener las siguientes columnas en este orden:

| Columna | Nombre | Descripción | Ejemplo | Requerido |
|---------|--------|-------------|---------|-----------|
| A | Artículo | Código del artículo | `ART001` | ✅ Sí |
| B | Descripción | Descripción del artículo | `Bolsa plástica 20x30` | ❌ No |
| C | - | (No usado) | - | ❌ No |
| D | Código Tinta | Código de la tinta | `T001` | ❌ No |
| E | - | (No usado) | - | ❌ No |
| F | Color | Nombre del color | `CYAN` | ✅ Sí |
| G | Cobertura | Cobertura en % | `2.5` | ❌ No |
| H | Código Anilox | Código del anilox | `A100` | ❌ No |

## Ejemplo de Datos Válidos

```
| A       | B                  | C | D    | E | F       | G   | H    |
|---------|-------------------|---|------|---|---------|-----|------|
| ART001  | Bolsa 20x30       |   | T001 |   | CYAN    | 2.5 | A100 |
| ART001  | Bolsa 20x30       |   | T002 |   | MAGENTA | 3.0 | A101 |
| ART001  | Bolsa 20x30       |   | T003 |   | AMARILLO| 2.8 | A102 |
| ART002  | Bolsa 30x40       |   | T004 |   | CYAN    | 2.2 | A100 |
| ART002  | Bolsa 30x40       |   | T005 |   | NEGRO   | 3.5 | A103 |
```

## Reglas Importantes

1. **Primera fila**: Debe contener los encabezados (se saltará automáticamente)
2. **Artículo (Columna A)**: 
   - Debe ser un código único del artículo
   - NO debe contener fórmulas ni texto descriptivo
   - Ejemplos válidos: `ART001`, `12345`, `PROD-A`
   - Ejemplos inválidos: `Metros lineales`, `=A1+B1`, `(Cálculo)`

3. **Color (Columna F)**:
   - Es obligatorio para que la fila se importe
   - Debe ser el nombre del color
   - Ejemplos: `CYAN`, `MAGENTA`, `AMARILLO`, `NEGRO`, `BLANCO`

4. **Múltiples colores por artículo**:
   - Puedes tener varias filas con el mismo artículo
   - Cada fila representa un color diferente del mismo artículo

5. **Cobertura (Columna G)**:
   - Debe ser un número decimal
   - Puede usar punto o coma como separador decimal
   - Ejemplos válidos: `2.5`, `3,0`, `10.25`

## Errores Comunes

❌ **Usar una plantilla de cálculo**: El archivo no debe contener fórmulas ni cálculos
❌ **Encabezados en columna A**: La columna A debe tener códigos de artículos, no nombres de campos
❌ **Objetos en lugar de texto**: Asegúrate de que las celdas contengan texto simple, no fórmulas complejas
❌ **Filas sin color**: Las filas sin color en la columna F serán ignoradas

## Cómo Crear el Excel Correcto

1. Abre Excel o Google Sheets
2. Crea una hoja con los encabezados en la primera fila
3. A partir de la segunda fila, ingresa los datos de tus artículos
4. Asegúrate de que cada artículo tenga al menos un color
5. Guarda como archivo `.xlsx` o `.xls`
6. Importa el archivo en la aplicación

## Resultado de la Importación

- **Creados**: Artículos nuevos que no existían en la base de datos
- **Actualizados**: Artículos existentes que se actualizaron con nueva información
- **Errores**: Filas que no pudieron procesarse (revisa los detalles en la consola)

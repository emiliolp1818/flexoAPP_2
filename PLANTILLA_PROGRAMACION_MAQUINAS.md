# Plantilla para Carga de Programación de Máquinas

## Formato del Archivo Excel

El archivo Excel debe tener **exactamente 11 columnas** en este orden:

### Columnas (Fila 1 - Encabezados):

| Columna | Nombre | Descripción | Ejemplo |
|---------|--------|-------------|---------|
| A | MQ | Número de máquina (11-21) | 11 |
| B | ARTICULO | Código del artículo (único) | f203456 |
| C | OT SAP | Orden de trabajo SAP | 203456 |
| D | CLIENTE | Nombre del cliente | Nestlé |
| E | REFERENCIA | Referencia del producto | Etiqueta Yogurt 150g |
| F | F | Campo adicional (se ignora) | ac |
| G | TD | Código TD (Tipo de Diseño) | td |
| H | N° COLORES | Cantidad de colores (1-10) | 8 |
| I | KILOS | Cantidad en kilogramos | 1,654 |
| J | FECHA DE TINTAS EN MAQUINA | Fecha | 10-nov-25 |
| K | SUSTRATOS | Tipo de material base | BOPP |

### Ejemplo de Datos (Filas 2+):

```
MQ | ARTICULO | OT SAP | CLIENTE    | REFERENCIA            | F  | TD | N° COLORES | KILOS | FECHA DE TINTAS EN MAQUINA | SUSTRATOS
11 | f203456  | 203456 | Nestlé     | Etiqueta Yogurt 150g  | ac | td | 8          | 1,654 | 10-nov-25                  | BOPP
11 | f203457  | 203457 | Nestlé     | Etiqueta Yogurt 150g  | ac | td | 8          | 1,655 | 10-nov-25                  | BOPP
11 | f203458  | 203458 | Coca-Cola  | Etiqueta Botella 500ml| td | pe | 6          | 2,1   | 10 nov 25                  | BOPP
```

## Notas Importantes:

1. **La fila 1 debe contener los encabezados** (el sistema la salta automáticamente)
2. **Los datos comienzan en la fila 2**
3. **Todas las columnas son obligatorias** (excepto la columna F que se ignora)
4. **N° COLORES**: Solo el número (ejemplo: 4), el sistema genera los colores automáticamente
5. **La fecha puede estar en cualquier formato** que Excel reconozca
6. **El número de máquina (MQ) debe estar entre 11 y 21**
7. **El archivo debe ser .xlsx o .xls** (no CSV)

## Comportamiento al Cargar:

- Se eliminan automáticamente los programas en estado **CORRIENDO**
- Se mantienen los programas en estado **PREPARANDO**, **LISTO** y **SUSPENDIDO**
- Los nuevos programas se cargan en estado **PREPARANDO** por defecto

## Tipos de Sustrato Comunes:

- BOPP (Polipropileno Biorientado)
- PE (Polietileno)
- PET (Polietileno Tereftalato)
- PP (Polipropileno)
- PAPEL

## Colores Comunes:

- CYAN
- MAGENTA
- AMARILLO
- NEGRO
- BLANCO
- VERDE
- ROJO
- AZUL
- NARANJA
- VIOLETA

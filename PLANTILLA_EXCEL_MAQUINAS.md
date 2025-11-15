# PLANTILLA DE EXCEL PARA CARGA DE MÁQUINAS

## Copia y pega esto en Excel

Copia la siguiente tabla y pégala en Excel (Ctrl+C, luego Ctrl+V en Excel):

```
MQ	ARTICULO F	OT SAP	CLIENTE	REFERENCIA	TD	N° COLORES	KILOS	FECHA TINTAS EN MAQUINA	SUSTRATOS
15	F204567	OT123456	ABSORBENTES DE COLOMBIA S.A	REF-001	TD1	4	1500.50	14/11/2024 10:30	BOPP
16	F204568	OT123457	CLIENTE EJEMPLO S.A.S	REF-002	TD2	6	2000.00	14/11/2024 11:00	PE
17	F204569	OT123458	OTRO CLIENTE LTDA	REF-003	TD3	3	800.00	14/11/2024 12:00	PET
```

## Pasos para crear el archivo:

1. **Abre Excel** (nuevo libro en blanco)

2. **Pega los datos** en la celda A1

3. **Verifica que tengas 10 columnas:**
   - A: MQ
   - B: ARTICULO F
   - C: OT SAP
   - D: CLIENTE
   - E: REFERENCIA
   - F: TD
   - G: N° COLORES
   - H: KILOS
   - I: FECHA TINTAS EN MAQUINA
   - J: SUSTRATOS

4. **Guarda el archivo** como `.xlsx`

5. **Carga el archivo** en el sistema

## Importante:

- La primera fila DEBE ser los encabezados
- NO elimines ninguna columna aunque esté vacía
- Los campos obligatorios son: MQ, ARTICULO F, OT SAP, CLIENTE, N° COLORES, KILOS, FECHA, SUSTRATOS
- Los campos opcionales pueden dejarse vacíos: REFERENCIA, TD

## Si el error persiste:

1. Revisa los logs del backend en la terminal
2. Verifica que el archivo tenga exactamente 10 columnas
3. Asegúrate de que no haya filas completamente vacías entre los datos
4. Verifica que los números de máquina estén entre 11 y 21

---

Fecha: 2025-11-14

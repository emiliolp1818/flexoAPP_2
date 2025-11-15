# 🔍 Verificación de Kilos - Debugging

## Problema
Los kilos aparecen como 0 en la tabla después de cargar el archivo Excel.

## Posibles Causas

### 1. **Formato del Archivo Excel**
El archivo puede tener un formato diferente al esperado.

**Formato esperado:**
```
Columna 0: MQ (Máquina)
Columna 1: ARTICULO F
Columna 2: OT SAP
Columna 3: CLIENTE
Columna 4: REFERENCIA
Columna 5: TD
Columna 6: N° COLORES
Columna 7: KILOS          ← Esta es la columna que debe tener los kilos
Columna 8: FECHA TINTAS
Columna 9: SUSTRATOS
```

### 2. **Formato de Número**
Los kilos pueden tener un formato que no se está parseando correctamente:
- Con coma: `1.000,50` (formato europeo)
- Con punto: `1,000.50` (formato americano)
- Con espacios: `1 000.50`
- Con texto: `1000 kg`

### 3. **Columna Incorrecta**
Los kilos pueden estar en una columna diferente a la 7.

---

## 🧪 Pasos para Verificar

### **Paso 1: Ver los Logs del Backend**

Cuando cargues el archivo Excel, busca en los logs del backend:

```
🔍 Parseando kilos - Valor original: '1000' (índice 7)
🔍 Kilos después de limpieza: '1000'
✅ Kilos parseados exitosamente: 1000
✅ DTO creado: Máquina=11, Artículo=F204567, OT=OT123, Cliente=ABC, Kilos=1000
```

Si ves:
```
⚠️ Columna de kilos vacía o no existe (índice 7), usando 0
```

Significa que la columna 7 está vacía o no existe.

### **Paso 2: Verificar el Archivo Excel**

1. Abre el archivo Excel
2. Verifica que la columna H (índice 7) tenga los kilos
3. Verifica el formato de los números:
   - ¿Tienen comas? `1.000,50`
   - ¿Tienen puntos? `1,000.50`
   - ¿Tienen texto? `1000 kg`

### **Paso 3: Verificar en la Base de Datos**

```sql
-- Ver los kilos de los programas recién cargados
SELECT 
    articulo,
    numero_maquina,
    cliente,
    kilos,
    created_at
FROM maquinas
ORDER BY created_at DESC
LIMIT 10;
```

Si todos los kilos son 0, el problema está en el parseo.

### **Paso 4: Probar con un Archivo de Prueba**

Crea un archivo Excel simple con este formato:

| MQ | ARTICULO F | OT SAP | CLIENTE | REFERENCIA | TD | N° COLORES | KILOS | FECHA TINTAS | SUSTRATOS |
|----|------------|--------|---------|------------|----|-----------:|------:|--------------|-----------|
| 11 | TEST001    | OT001  | ABC     | REF001     | TD1| 4          | 1000  | 15/11/2025   | BOPP      |
| 12 | TEST002    | OT002  | XYZ     | REF002     | TD2| 3          | 2500  | 15/11/2025   | PE        |

**Importante:**
- La columna KILOS debe ser la columna H (índice 7)
- Los kilos deben ser números sin formato especial
- No debe tener texto como "kg"

---

## 🔧 Soluciones

### **Solución 1: Si el formato tiene comas**

El código ya maneja esto:
```csharp
var kilosStr = columns[7]
    .Replace(",", ".") // Reemplazar coma por punto
    .Replace(" ", "")  // Eliminar espacios
    .Trim();
```

### **Solución 2: Si los kilos tienen texto**

Necesitamos limpiar el texto antes de parsear:

```csharp
var kilosStr = columns[7]
    .Replace(",", ".")
    .Replace(" ", "")
    .Replace("kg", "")
    .Replace("KG", "")
    .Replace("Kg", "")
    .Trim();
```

### **Solución 3: Si los kilos están en otra columna**

Verifica en qué columna están realmente los kilos y cambia el índice:

```csharp
// Si los kilos están en la columna 8 (índice 8):
if (columns.Count > 8 && !string.IsNullOrWhiteSpace(columns[8]))
{
    var kilosStr = columns[8]...
```

---

## 📋 Checklist de Verificación

- [ ] Backend reiniciado después de los cambios
- [ ] Archivo Excel tiene la columna KILOS en la posición H (índice 7)
- [ ] Los kilos son números sin texto adicional
- [ ] Los logs del backend muestran el valor de los kilos
- [ ] La base de datos muestra los kilos correctamente

---

## 🆘 Si Sigue Sin Funcionar

1. **Copia los logs del backend** cuando cargues el archivo
2. **Copia una fila del archivo Excel** (con todos los valores)
3. **Ejecuta esta consulta SQL:**
   ```sql
   SELECT articulo, kilos, created_at 
   FROM maquinas 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
4. **Comparte:**
   - Los logs del backend
   - Una fila de ejemplo del Excel
   - El resultado de la consulta SQL

---

## 📝 Ejemplo de Logs Correctos

```
📋 Procesando línea con 10 columnas
📋 Datos: [0]=11 | [1]=F204567 | [2]=OT123 | [3]=ABC | [4]=REF001 | [5]=TD1 | [6]=4 | [7]=1000 | [8]=15/11/2025 | [9]=BOPP
🔍 Parseando kilos - Valor original: '1000' (índice 7)
🔍 Kilos después de limpieza: '1000'
✅ Kilos parseados exitosamente: 1000
🎨 Número de colores: 4
📅 Fecha parseada: 15/11/2025 00:00:00
✅ DTO creado: Máquina=11, Artículo=F204567, OT=OT123, Cliente=ABC, Kilos=1000
✅ Programa procesado: F204567
```

---

## 🎯 Acción Inmediata

1. **Reinicia el backend** para aplicar los nuevos logs
2. **Carga el archivo Excel** nuevamente
3. **Copia los logs** de la terminal del backend
4. **Comparte los logs** para identificar el problema exacto

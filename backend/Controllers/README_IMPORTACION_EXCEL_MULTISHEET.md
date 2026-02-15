# 📊 Importación Masiva de Programación desde Excel (Múltiples Hojas)

## 🎯 Funcionalidad

Permite importar la programación de múltiples máquinas desde un solo archivo Excel que contiene una hoja por cada máquina.

## 📋 Formato del Archivo Excel

### Estructura de Hojas

El archivo Excel debe contener hojas con nombres que identifiquen cada máquina:

```
📁 Programacion_Semanal.xlsx
  ├── 📄 MAQ 11  (programación para máquina 11)
  ├── 📄 MAQ 12  (programación para máquina 12)
  ├── 📄 MAQ 13  (programación para máquina 13)
  ├── ...
  └── 📄 MAQ 21  (programación para máquina 21)
```

**Formatos de nombre aceptados:**
- `MAQ 11`, `MAQ 12`, ..., `MAQ 21`
- `MAQ11`, `MAQ12`, ..., `MAQ21`
- `Maquina 11`, `Maquina 12`, etc.
- `11`, `12`, ..., `21`

El sistema extrae automáticamente el número de máquina del nombre de la hoja.

### Estructura de Columnas

Cada hoja debe tener las siguientes columnas:

| Columna | Nombre Campo              | Campo BD                  | Obligatorio | Tipo      |
|---------|---------------------------|---------------------------|-------------|-----------|
| A       | mq imp                    | (ignorado)                | No          | -         |
| C       | articulo f                | articulo                  | ✅ Sí       | Texto     |
| D       | cliente                   | cliente                   | ✅ Sí       | Texto     |
| E       | referencia                | referencia                | No          | Texto     |
| F       | td                        | td                        | No          | Texto     |
| G       | timp                      | tipo_impresion            | No          | Texto     |
| K       | numero de colores         | numero_colores            | No          | Número    |
| O       | kilos                     | kilos                     | ✅ Sí       | Decimal   |
| S       | sustrato                  | sustrato                  | No          | Texto     |
| T       | ot sap                    | ot_sap                    | ✅ Sí       | Texto     |
| W       | colores en maquina        | fecha_tinta_en_maquina    | No          | Fecha     |
| AG      | metros                    | metros                    | No          | Decimal   |

### Formato de Filas

- **Fila 1-2**: Encabezados (se ignoran)
- **Fila 3 en adelante**: Datos de programación

**Ejemplo:**

```
Fila 1: [Encabezado principal]
Fila 2: [Encabezado de columnas]
Fila 3: [Primer registro de programación] ← Se importa
Fila 4: [Segundo registro de programación] ← Se importa
Fila 5: [Tercer registro de programación] ← Se importa
...
```

### Formato de Fecha (Columna W)

Formatos aceptados:
- `dd/MM/yyyy HH:mm` (ej: `15/02/2026 14:30`)
- `dd/MM/yyyy` (ej: `15/02/2026`)
- `d/M/yyyy HH:mm` (ej: `5/2/2026 9:15`)
- Formato ISO estándar

Si la fecha no se puede parsear, se usa la fecha actual.

## 🔌 Endpoint API

### POST `/api/maquinas/import/excel-multisheet`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
file: [archivo .xlsx]
```

**Respuesta exitosa (200 OK):**
```json
{
  "message": "Importación completada",
  "sheetsProcessed": 5,
  "totalCreated": 47,
  "totalErrors": 2,
  "results": [
    {
      "machineNumber": 11,
      "created": 10,
      "errors": 0,
      "errorDetails": []
    },
    {
      "machineNumber": 12,
      "created": 8,
      "errors": 1,
      "errorDetails": [
        "Fila 5: kilos inválido 'abc', usando 0"
      ]
    },
    {
      "machineNumber": 13,
      "created": 12,
      "errors": 0,
      "errorDetails": []
    },
    {
      "machineNumber": 14,
      "created": 9,
      "errors": 1,
      "errorDetails": [
        "Fila 7: fecha inválida '32/13/2026', usando fecha actual"
      ]
    },
    {
      "machineNumber": 15,
      "created": 8,
      "errors": 0,
      "errorDetails": []
    }
  ]
}
```

**Respuesta con error (400 Bad Request):**
```json
{
  "message": "No se proporcionó ningún archivo"
}
```

**Respuesta con error (500 Internal Server Error):**
```json
{
  "message": "Error al importar Excel",
  "error": "Descripción del error",
  "stackTrace": "..."
}
```

## 📝 Ejemplo de Uso con JavaScript/TypeScript

```typescript
async function importarProgramacionMasiva(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://tu-api.com/api/maquinas/import/excel-multisheet', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  
  if (response.ok) {
    console.log(`✅ Importación exitosa:`);
    console.log(`   - Hojas procesadas: ${result.sheetsProcessed}`);
    console.log(`   - Registros creados: ${result.totalCreated}`);
    console.log(`   - Errores: ${result.totalErrors}`);
    
    result.results.forEach(r => {
      console.log(`   Máquina ${r.machineNumber}: ${r.created} creados, ${r.errors} errores`);
    });
  } else {
    console.error('❌ Error:', result.message);
  }
}

// Uso
const fileInput = document.getElementById('excelFile');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    importarProgramacionMasiva(file);
  }
});
```

## 🔍 Validaciones

### Validaciones de Hoja
- ✅ Nombre de hoja debe contener un número entre 11 y 21
- ✅ Hojas sin número válido se ignoran (no generan error)

### Validaciones de Datos
- ✅ **OT SAP** (columna T): Obligatorio, no puede estar vacío
- ✅ **Artículo** (columna C): Obligatorio, no puede estar vacío
- ✅ **Cliente** (columna D): Obligatorio, no puede estar vacío
- ⚠️ **Kilos** (columna O): Si es inválido, se usa 0
- ⚠️ **Número de colores** (columna K): Si es inválido, se usa 1
- ⚠️ **Metros** (columna AG): Opcional, puede estar vacío
- ⚠️ **Fecha** (columna W): Si es inválida, se usa fecha actual

### Comportamiento con Errores
- Las filas con datos incompletos se **ignoran** (no se importan)
- Las filas con errores de formato se **intentan corregir** (valores por defecto)
- Los errores se reportan en `errorDetails` pero no detienen la importación
- Cada hoja se procesa independientemente

## 📊 Logs del Sistema

El sistema genera logs detallados durante la importación:

```
📥 Iniciando importación masiva desde Excel: Programacion_Semanal.xlsx
📊 Excel contiene 11 hojas
📄 Procesando hoja: MAQ 11
✅ Máquina identificada: 11
📊 Hoja tiene 15 filas
✅ Fila 3: Registro creado - OT 12345
✅ Fila 4: Registro creado - OT 12346
⚠️ Fila 5 ignorada: faltan datos obligatorios (OT SAP, Artículo o Cliente)
✅ Fila 6: Registro creado - OT 12347
...
📊 Máquina 11: 10 creados, 0 errores
📄 Procesando hoja: MAQ 12
...
✅ Importación completada: 5 hojas procesadas, 47 registros creados, 2 errores
```

## ⚠️ Consideraciones Importantes

1. **Tamaño máximo**: 100MB por archivo
2. **Formato**: Solo archivos `.xlsx` (Excel 2007+)
3. **Hojas ignoradas**: Hojas sin número de máquina válido se ignoran silenciosamente
4. **Duplicados**: El sistema NO verifica duplicados, crea todos los registros
5. **Estado inicial**: Todos los registros se crean con estado `PENDIENTE`
6. **Colores**: El campo `colores` se inicializa como array vacío `[]`
7. **Observaciones**: Se agrega automáticamente "Importado desde Excel - Hoja MAQ {número}"

## 🎯 Casos de Uso

### Caso 1: Importación Semanal Completa
```
Usuario sube archivo con 11 hojas (MAQ 11 a MAQ 21)
Sistema procesa todas las hojas
Resultado: Programación de toda la semana cargada
```

### Caso 2: Importación Parcial
```
Usuario sube archivo con 3 hojas (MAQ 11, MAQ 15, MAQ 18)
Sistema procesa solo esas 3 hojas
Otras hojas se ignoran si no tienen formato válido
```

### Caso 3: Actualización de Programación
```
Usuario sube nuevo archivo con programación actualizada
Sistema crea nuevos registros (no actualiza existentes)
Registros antiguos permanecen en la base de datos
```

## 🆘 Solución de Problemas

### Error: "No se proporcionó ningún archivo"
**Causa**: No se envió archivo en la petición  
**Solución**: Verificar que el FormData contenga el archivo

### Error: "El archivo debe ser formato .xlsx"
**Causa**: Archivo no es Excel 2007+  
**Solución**: Convertir archivo a formato .xlsx

### Advertencia: "Hoja ignorada: no se pudo extraer número de máquina"
**Causa**: Nombre de hoja no contiene número válido  
**Solución**: Renombrar hoja a formato "MAQ 11", "MAQ 12", etc.

### Advertencia: "Fila ignorada: faltan datos obligatorios"
**Causa**: Falta OT SAP, Artículo o Cliente  
**Solución**: Completar datos obligatorios en Excel

### Error: "kilos inválido, usando 0"
**Causa**: Valor de kilos no es numérico  
**Solución**: Corregir valor en Excel (usar números, no texto)

---

**Fecha**: 2026-02-15  
**Sistema**: FlexoAPP  
**Módulo**: Máquinas - Importación Masiva  
**Endpoint**: `/api/maquinas/import/excel-multisheet`

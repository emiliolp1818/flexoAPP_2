# Solución Error 500 en Importación Excel Multisheet (Render)

## Problema
Error 500 al intentar importar archivo Excel multisheet en producción (Render):
```
POST https://flexoapp-backend.onrender.com/api/maquinas/import/excel-multisheet 500 (Internal Server Error)
```

## Causas Posibles

### 1. Límite de Memoria Excedido
**Síntoma**: El servidor se queda sin memoria al procesar archivos grandes
**Solución**:
- Verificar el plan de Render (Free tier tiene 512MB RAM)
- Considerar upgrade a plan Starter ($7/mes) con 512MB garantizados
- Optimizar el código para procesar el Excel en chunks

### 2. Timeout de la Petición
**Síntoma**: La importación tarda más de 30 segundos (límite de Render Free)
**Solución**:
- Implementar procesamiento asíncrono con jobs
- Dividir la importación en lotes más pequeños
- Aumentar timeout en Render (solo disponible en planes pagos)

### 3. Librería EPPlus No Instalada
**Síntoma**: Error al intentar usar ExcelPackage
**Solución**:
```bash
# Verificar que EPPlus esté en el .csproj
dotnet add package EPPlus --version 7.0.0
```

### 4. Error de Conexión a Base de Datos
**Síntoma**: No puede conectar a MySQL
**Solución**:
- Verificar que la cadena de conexión esté correcta en Render
- Verificar que la base de datos MySQL esté activa
- Revisar logs de Render para ver el error exacto

## Pasos para Diagnosticar

### 1. Ver Logs en Render
```bash
# En el dashboard de Render:
1. Ir a tu servicio backend
2. Click en "Logs"
3. Buscar el error exacto cuando haces la importación
4. Copiar el stack trace completo
```

### 2. Verificar Variables de Entorno
```bash
# En Render Dashboard > Environment:
- DATABASE_URL o ConnectionStrings__DefaultConnection
- ASPNETCORE_ENVIRONMENT=Production
```

### 3. Probar Localmente con Datos de Producción
```bash
# Usar la misma cadena de conexión de Render
dotnet run --environment Production
```

## Soluciones Inmediatas

### Opción 1: Reducir Tamaño del Archivo
- Dividir el Excel en archivos más pequeños (5-6 hojas por archivo)
- Importar en múltiples operaciones

### Opción 2: Optimizar el Código
```csharp
// En MaquinasController.cs, línea ~1260
// Agregar procesamiento por lotes:

private async Task<ImportSheetResult> ProcessWorksheet(ExcelWorksheet worksheet, int machineNumber)
{
    var result = new ImportSheetResult();
    var rowCount = worksheet.Dimension?.Rows ?? 0;
    var batchSize = 50; // Procesar 50 filas a la vez
    
    for (int startRow = 3; startRow <= rowCount; startRow += batchSize)
    {
        var endRow = Math.Min(startRow + batchSize - 1, rowCount);
        
        // Procesar lote
        await ProcessBatch(worksheet, machineNumber, startRow, endRow, result);
        
        // Guardar cambios cada lote
        await _context.SaveChangesAsync();
        
        // Liberar memoria
        GC.Collect();
    }
    
    return result;
}
```

### Opción 3: Aumentar Límites en Render
```bash
# En render.yaml o Dashboard:
services:
  - type: web
    name: flexoapp-backend
    env: dotnet
    plan: starter  # Upgrade a plan pagado
    buildCommand: dotnet publish -c Release -o out
    startCommand: dotnet out/flexoAPP.dll
    envVars:
      - key: ASPNETCORE_URLS
        value: http://0.0.0.0:$PORT
```

## Verificación del Error Exacto

Para saber exactamente qué está fallando, necesitas:

1. **Ver los logs de Render**:
   - Dashboard > Tu servicio > Logs
   - Buscar el timestamp del error
   - Copiar el stack trace completo

2. **Verificar el tamaño del archivo**:
   - ¿Cuántas hojas tiene el Excel?
   - ¿Cuántas filas por hoja?
   - ¿Tamaño total del archivo?

3. **Probar con archivo pequeño**:
   - Crear un Excel de prueba con solo 2-3 hojas
   - 10-20 filas por hoja
   - Si funciona, el problema es el tamaño

## Solución Temporal (Mientras se Investiga)

### Importar Hoja por Hoja
Modificar el frontend para permitir importar una hoja a la vez:

```typescript
// En machines.ts
async onFileSelected(event: any) {
  const file = event.target.files[0];
  
  // Leer el Excel en el frontend
  const workbook = XLSX.read(await file.arrayBuffer());
  
  // Procesar cada hoja por separado
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    // Enviar cada hoja individualmente
    await this.importSingleSheet(sheetName, data);
    
    // Esperar 2 segundos entre hojas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

## Próximos Pasos

1. **Revisar logs de Render** para ver el error exacto
2. **Verificar que EPPlus esté instalado** en producción
3. **Probar con archivo pequeño** para descartar problema de tamaño
4. **Considerar upgrade de plan** si es problema de recursos
5. **Implementar procesamiento asíncrono** para archivos grandes

## Contacto con Soporte

Si el problema persiste:
- Render Support: https://render.com/docs/support
- Incluir: logs completos, tamaño del archivo, plan actual

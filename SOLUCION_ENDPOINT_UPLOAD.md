# SOLUCION: Endpoint de Carga de Excel

## PROBLEMA IDENTIFICADO

El frontend estaba intentando llamar al endpoint obsoleto:
```
POST /api/machine-programs/upload-programming
```

Este endpoint ya no existe porque eliminamos el controlador `MachineProgramsController`.

## SOLUCION IMPLEMENTADA

### 1. Backend - Nuevos Endpoints Creados

Se agregaron dos nuevos endpoints en `MaquinasController`:

#### Endpoint de Carga de Excel
```
POST /api/maquinas/upload
```

**Funcionalidad:**
- Acepta archivos Excel (.xlsx, .xls)
- Valida tipo y tamaño del archivo (máximo 10MB)
- Procesa el archivo usando `IMaquinaService.ProcessExcelFileAsync()`
- Retorna los programas cargados con estadísticas

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [...],
  "message": "Archivo procesado exitosamente. X programas cargados.",
  "summary": {
    "totalPrograms": 10,
    "readyPrograms": 8,
    "machinesWithPrograms": 5,
    "fileName": "programacion.xlsx",
    "processedAt": "2025-11-14T..."
  },
  "timestamp": "2025-11-14T..."
}
```

#### Endpoint de Limpieza
```
DELETE /api/maquinas/clear-all
```

**Funcionalidad:**
- Elimina todos los programas de la tabla maquinas
- Retorna la cantidad de registros eliminados

### 2. Frontend - Endpoints Actualizados

Se actualizaron las referencias en `Frontend/src/app/shared/components/machines/machines.ts`:

**Antes:**
```typescript
this.http.post<any>(`${environment.apiUrl}/machine-programs/upload-programming`, formData)
```

**Después:**
```typescript
this.http.post<any>(`${environment.apiUrl}/maquinas/upload`, formData)
```

## PASOS PARA PROBAR

### 1. Detener el Backend Actual

El backend está ejecutándose (proceso 26520). Debes detenerlo:
- Presiona `Ctrl+C` en la terminal donde está corriendo
- O cierra la terminal

### 2. Ejecutar el Script SQL

Abre MySQL Workbench y ejecuta:
```sql
-- Archivo: backend/Database/01_create_maquinas_table.sql
```

### 3. Recompilar y Ejecutar el Backend

```bash
cd backend
dotnet clean
dotnet build
dotnet run
```

### 4. Verificar que el Backend Esté Corriendo

Abre en el navegador:
```
http://localhost:7003/swagger
```

Deberías ver los nuevos endpoints:
- `POST /api/maquinas/upload`
- `DELETE /api/maquinas/clear-all`
- `GET /api/maquinas`
- `PATCH /api/maquinas/{articulo}/status`
- `POST /api/maquinas/test`
- `GET /api/maquinas/machine/{numeroMaquina}`

### 5. Probar la Carga de Excel

1. Abre el frontend en el navegador
2. Ve al módulo de máquinas
3. Haz clic en "Cargar Programación"
4. Selecciona tu archivo Excel
5. El archivo debería cargarse correctamente

## FORMATO DEL ARCHIVO EXCEL

El archivo debe tener estas columnas en este orden:

| Col | Nombre | Ejemplo |
|-----|--------|---------|
| A | MQ | 15 |
| B | ARTICULO F | F204567 |
| C | OT SAP | OT123456 |
| D | CLIENTE | ABSORBENTES DE COLOMBIA S.A |
| E | REFERENCIA | REF-001 |
| F | TD | TD1 |
| G | N° COLORES | 4 |
| H | KILOS | 1500.50 |
| I | FECHA TINTAS EN MAQUINA | 14/11/2024 10:30 |
| J | SUSTRATOS | BOPP |

## VERIFICACION

Para verificar que todo funciona:

1. **Backend compilado:** ✅
2. **Frontend actualizado:** ✅
3. **Endpoints creados:** ✅
4. **Script SQL listo:** ✅

## NOTAS IMPORTANTES

- El endpoint ahora usa `/api/maquinas/upload` en lugar de `/api/machine-programs/upload-programming`
- El backend valida automáticamente el tipo y tamaño del archivo
- Los programas se guardan en la tabla `maquinas` con `articulo` como PRIMARY KEY
- El estado inicial de los programas cargados es "PREPARANDO"

## PROXIMOS PASOS

1. Detener el backend actual
2. Ejecutar el script SQL
3. Reiniciar el backend
4. Probar la carga de Excel desde el frontend

---

**Fecha:** 2025-11-14  
**Estado:** COMPLETADO  
**Archivos modificados:**
- `backend/Controllers/MaquinasController.cs` (agregados endpoints)
- `Frontend/src/app/shared/components/machines/machines.ts` (actualizado endpoint)

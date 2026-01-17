# 📊 Mejora de Exportación a Excel - Condición Única

## ✅ Implementación Completada

Se ha mejorado la función de exportación de Condición Única para generar archivos Excel (.xlsx) con estructura profesional, columnas ordenadas y formato optimizado.

---

## 🎯 Cambios Realizados

### Antes (CSV)
- ❌ Formato CSV básico
- ❌ Sin estructura de columnas definida
- ❌ Sin anchos de columna optimizados
- ❌ Nombre de archivo con timestamp ISO complejo
- ❌ Solo 6 columnas (sin Estado ni N°)

### Después (XLSX)
- ✅ Formato Excel nativo (.xlsx)
- ✅ Estructura de columnas bien definida
- ✅ Anchos de columna optimizados automáticamente
- ✅ Nombre de archivo legible (DD-MM-YYYY_HH-MM)
- ✅ 8 columnas completas (incluye N° y Estado)
- ✅ Fechas formateadas con hora
- ✅ Compatible con Excel, Google Sheets y LibreOffice

---

## 📋 Estructura del Archivo Excel

### Columnas Exportadas (en orden):

| N° | Columna | Ancho | Descripción | Ejemplo |
|----|---------|-------|-------------|---------|
| 1 | N° | 5 | Número de fila secuencial | 1, 2, 3... |
| 2 | F Artículo | 15 | Código del artículo | F204567 |
| 3 | Descripción | 40 | Descripción del producto | Bolsa de polietileno... |
| 4 | Estante | 12 | Ubicación física | E-01 |
| 5 | Número de Carpeta | 18 | Organización documental | C-001 |
| 6 | Estado | 12 | Estado del registro | ACTIVO, INACTIVO, EN REVISIÓN |
| 7 | Fecha de Creación | 20 | Fecha y hora de creación | 17/01/2026, 14:30 |
| 8 | Última Modificación | 20 | Fecha y hora de modificación | 17/01/2026, 15:45 |

### Características del Formato:

#### 1. Anchos de Columna Optimizados
```typescript
worksheet['!cols'] = [
  { wch: 5 },   // N° - compacto
  { wch: 15 },  // F Artículo - código
  { wch: 40 },  // Descripción - texto largo
  { wch: 12 },  // Estante - código corto
  { wch: 18 },  // Número de Carpeta - código medio
  { wch: 12 },  // Estado - texto corto
  { wch: 20 },  // Fecha de Creación - fecha completa
  { wch: 20 }   // Última Modificación - fecha completa
];
```

#### 2. Formato de Fechas
- **Antes:** `17/01/2026`
- **Ahora:** `17/01/2026, 14:30`
- Incluye hora y minutos para mayor precisión

#### 3. Nombre de Archivo
- **Antes:** `CondicionUnica_2026-01-17T14-30-45.csv`
- **Ahora:** `CondicionUnica_17-01-2026_14-30.xlsx`
- Más legible y ordenado alfabéticamente

#### 4. Nombre de Hoja
- **Hoja 1:** "Condición Única"
- Nombre descriptivo en español

---

## 🚀 Cómo Usar

### 1. Exportar Todos los Registros

1. Abrir módulo "Condición Única"
2. Click en botón **"Exportar a Excel"** (icono de descarga)
3. El archivo se descarga automáticamente
4. Abrir con Excel, Google Sheets o LibreOffice

### 2. Exportar Registros Filtrados

1. Usar el campo de búsqueda para filtrar registros
2. Click en **"Exportar a Excel"**
3. Solo se exportan los registros visibles (filtrados)

### 3. Abrir el Archivo

**En Excel:**
- Doble click en el archivo descargado
- Las columnas ya tienen el ancho correcto
- Los datos están ordenados y formateados

**En Google Sheets:**
- Ir a Google Drive
- Click en "Nuevo" → "Subir archivo"
- Seleccionar el archivo .xlsx descargado
- Se abre automáticamente con formato preservado

**En LibreOffice Calc:**
- Abrir LibreOffice Calc
- Archivo → Abrir
- Seleccionar el archivo .xlsx

---

## 📊 Ejemplo de Archivo Generado

```
┌────┬────────────┬──────────────────────────────────────┬─────────┬───────────────────┬─────────────┬──────────────────────┬──────────────────────┐
│ N° │ F Artículo │ Descripción                          │ Estante │ Número de Carpeta │ Estado      │ Fecha de Creación    │ Última Modificación  │
├────┼────────────┼──────────────────────────────────────┼─────────┼───────────────────┼─────────────┼──────────────────────┼──────────────────────┤
│ 1  │ F204567    │ Bolsa de polietileno transparente... │ E-01    │ C-001             │ ACTIVO      │ 17/01/2026, 14:30    │ 17/01/2026, 14:30    │
│ 2  │ F204568    │ Bolsa de polipropileno impresa...    │ E-01    │ C-002             │ ACTIVO      │ 17/01/2026, 14:31    │ 17/01/2026, 14:31    │
│ 3  │ F204569    │ Film flexible para empaque...        │ E-02    │ C-003             │ EN REVISIÓN │ 17/01/2026, 14:32    │ 17/01/2026, 15:45    │
│ 4  │ F204570    │ Lámina de PVC cristal...             │ E-02    │ C-004             │ INACTIVO    │ 17/01/2026, 14:33    │ 17/01/2026, 14:33    │
└────┴────────────┴──────────────────────────────────────┴─────────┴───────────────────┴─────────────┴──────────────────────┴──────────────────────┘
```

---

## 🎨 Ventajas del Nuevo Formato

### 1. Profesionalismo
- Archivo Excel nativo (.xlsx)
- Estructura clara y ordenada
- Fácil de leer y analizar

### 2. Compatibilidad
- ✅ Microsoft Excel (todas las versiones)
- ✅ Google Sheets
- ✅ LibreOffice Calc
- ✅ Apple Numbers
- ✅ WPS Office

### 3. Funcionalidad
- Columnas con ancho óptimo (no necesita ajustar)
- Datos ordenados por filas
- Fácil de filtrar y ordenar en Excel
- Fácil de importar a otras aplicaciones

### 4. Información Completa
- Incluye columna N° para referencia
- Incluye columna Estado (nueva)
- Fechas con hora para mayor precisión
- Todos los campos de la tabla

### 5. Usabilidad
- Nombre de archivo legible
- Notificación con cantidad de registros exportados
- Descarga automática sin pasos adicionales

---

## 🔧 Detalles Técnicos

### Librería Utilizada
- **Nombre:** SheetJS (xlsx)
- **Versión:** Instalada en el proyecto
- **Documentación:** https://docs.sheetjs.com/

### Carga Dinámica
```typescript
import('xlsx').then(XLSX => {
  // Código de exportación
});
```
- La librería se carga solo cuando se necesita
- No afecta el tiempo de carga inicial de la aplicación
- Optimiza el rendimiento

### Formato de Datos
```typescript
const excelData = dataToExport.map((item, index) => ({
  'N°': index + 1,
  'F Artículo': item.fArticulo || '',
  'Descripción': item.descripcion || '',
  // ... más campos
}));
```
- Estructura de objeto con nombres de columnas
- Valores por defecto para campos vacíos
- Orden garantizado de columnas

---

## 📝 Casos de Uso

### 1. Backup de Datos
- Exportar todos los registros periódicamente
- Guardar como respaldo en caso de pérdida de datos

### 2. Análisis de Datos
- Exportar y analizar en Excel con tablas dinámicas
- Crear gráficos y reportes personalizados

### 3. Compartir Información
- Enviar archivo Excel a otros departamentos
- Fácil de abrir sin necesidad de acceso al sistema

### 4. Auditoría
- Exportar registros con fechas de creación y modificación
- Revisar historial de cambios

### 5. Migración de Datos
- Exportar datos para importar en otro sistema
- Formato estándar compatible con múltiples aplicaciones

---

## ✅ Verificación

### Probar la Exportación:

1. **Abrir módulo Condición Única**
2. **Verificar que hay registros en la tabla**
3. **Click en botón "Exportar a Excel"**
4. **Verificar notificación:**
   ```
   ✓ Archivo exportado: CondicionUnica_17-01-2026_14-30.xlsx (X registros)
   ```
5. **Abrir archivo descargado**
6. **Verificar estructura:**
   - ✅ 8 columnas en orden correcto
   - ✅ Anchos de columna optimizados
   - ✅ Datos completos y formateados
   - ✅ Fechas con hora
   - ✅ Estado incluido

---

## 🎯 Resultado Final

### Antes:
```
CondicionUnica_2026-01-17T14-30-45.csv
- 6 columnas
- Sin formato
- Sin anchos definidos
- CSV básico
```

### Ahora:
```
CondicionUnica_17-01-2026_14-30.xlsx
- 8 columnas (incluye N° y Estado)
- Formato Excel profesional
- Anchos optimizados
- Compatible con todas las aplicaciones
- Fechas con hora
- Notificación con cantidad de registros
```

---

## 📊 Comparación Visual

### Archivo CSV Anterior:
```csv
F Artículo,Descripción,Estante,Número de Carpeta,Fecha de Creación,Última Modificación
"F204567","Bolsa de polietileno...","E-01","C-001","17/01/2026","17/01/2026"
```

### Archivo Excel Nuevo:
```
┌────┬────────────┬──────────────────┬─────────┬───────────────────┬─────────┬──────────────────────┬──────────────────────┐
│ N° │ F Artículo │ Descripción      │ Estante │ Número de Carpeta │ Estado  │ Fecha de Creación    │ Última Modificación  │
├────┼────────────┼──────────────────┼─────────┼───────────────────┼─────────┼──────────────────────┼──────────────────────┤
│ 1  │ F204567    │ Bolsa de polie...│ E-01    │ C-001             │ ACTIVO  │ 17/01/2026, 14:30    │ 17/01/2026, 14:30    │
└────┴────────────┴──────────────────┴─────────┴───────────────────┴─────────┴──────────────────────┴──────────────────────┘
```

---

**Fecha de Implementación:** 17 de enero de 2026  
**Archivo Modificado:** `Frontend/src/app/shared/components/condicion-unica/condicion-unica.ts`  
**Función:** `exportToExcel()`  
**Estado:** ✅ COMPLETADO Y FUNCIONAL

# Fix: Precisión Decimal en Columna Kilos

## Problema Identificado
Al agregar programación desde archivos Excel, los valores de kilos con 3 decimales (ej: 2.234) se estaban guardando con solo 2 decimales (2.23 o 2.24) debido a limitaciones en la estructura de la base de datos.

## Causa Raíz
- **Base de datos**: Columna `kilos` definida como `DECIMAL(10,2)` - solo permite 2 decimales
- **Frontend**: Pipe `number:'1.0-0'` mostraba kilos sin decimales

## Cambios Realizados

### 1. Backend - Entidad Maquina.cs
```csharp
// ANTES
[Column(TypeName = "DECIMAL(10,2)")]
[Range(0.01, 99999.99, ErrorMessage = "Los kilos deben ser mayor a 0")]

// DESPUÉS  
[Column(TypeName = "DECIMAL(10,3)")]
[Range(0.001, 99999.999, ErrorMessage = "Los kilos deben ser mayor a 0")]
```

### 2. Frontend - machines.html
```html
<!-- ANTES -->
<span class="kilos-number">{{ program.kilos | number:'1.0-0' }}</span>

<!-- DESPUÉS -->
<span class="kilos-number">{{ program.kilos | number:'1.0-3' }}</span>
```

### 3. Nuevo Servicio de Migración
- **Método**: `UpdateKilosDecimalPrecisionAsync()` en `MaquinaService`
- **Endpoint**: `POST /api/maquinas/maintenance/update-kilos-precision`
- **Función**: Actualiza automáticamente la estructura de la base de datos

### 4. Script SQL de Migración
- **Archivo**: `Migration_UpdateKilosDecimalPrecision.sql`
- **Función**: Cambiar columna de `DECIMAL(10,2)` a `DECIMAL(10,3)`

## Cómo Aplicar el Fix

### Opción 1: Endpoint Automático (Recomendado)
```bash
curl -X POST http://localhost:10000/api/maquinas/maintenance/update-kilos-precision
```

### Opción 2: Script SQL Manual
```sql
ALTER TABLE maquinas 
MODIFY COLUMN kilos DECIMAL(10,3) NOT NULL 
COMMENT 'Cantidad en kilogramos a producir (hasta 3 decimales)';
```

## Resultado Esperado
- ✅ Valores como 2.234 kilos se guardan correctamente
- ✅ Frontend muestra hasta 3 decimales
- ✅ Compatibilidad con datos existentes mantenida
- ✅ Parsing desde Excel preserva precisión completa

## Verificación
1. Cargar archivo Excel con valores como 2.234 kilos
2. Verificar que se guarda exactamente 2.234 en la base de datos
3. Confirmar que el frontend muestra 2.234 (no 2.23 o 2)

## Archivos Modificados
- `backend/Models/Entities/Maquina.cs`
- `backend/Services/MaquinaService.cs`
- `backend/Services/IMaquinaService.cs`
- `backend/Controllers/MaquinasController.cs`
- `Frontend/src/app/shared/components/machines/machines.html`
- `backend/Database/Migration_UpdateKilosDecimalPrecision.sql` (nuevo)

## Fecha de Implementación
12 de enero de 2026
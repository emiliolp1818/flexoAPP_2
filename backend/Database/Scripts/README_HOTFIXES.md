# 🔧 HOTFIXES - Guía Rápida

## 📋 RESUMEN DE PROBLEMAS Y SOLUCIONES

### 1️⃣ Error: Metros = 0 rechazado
**Archivo**: `SOLUCION_ERROR_METROS.md`  
**Hotfix**: `HOTFIX_FIX_METROS_CONSTRAINT.sql`

**Problema**: 
```
Check constraint 'chk_maquinas_metros_positivos' is violated
```

**Solución rápida**:
```sql
ALTER TABLE `maquinas` DROP CHECK `chk_maquinas_metros_positivos`;
ALTER TABLE `maquinas` ADD CONSTRAINT `chk_maquinas_metros_positivos` 
CHECK (`metros` IS NULL OR `metros` >= 0);
```

---

### 2️⃣ Error: Importación de Anilox falla (500)
**Archivo**: `SOLUCION_ERROR_ANILOX.md`  
**Hotfix**: `HOTFIX_FIX_ANILOX_CONSTRAINTS.sql`

**Problema**: 
```
Error 500 al importar anilox desde Excel
```

**Causas posibles**:
- Tabla `anilox` no existe
- Faltan columnas `factor_eficiencia` y `densidad`
- Constraints muy restrictivos

**Solución rápida**:

1. Verificar si tabla existe:
```sql
SHOW TABLES LIKE 'anilox';
```

2. Si no existe, crear tabla completa (ver `SOLUCION_ERROR_ANILOX.md` PASO 2)

3. Si existe, agregar columnas faltantes:
```sql
ALTER TABLE anilox ADD COLUMN factor_eficiencia DECIMAL(5, 2) NULL DEFAULT 35.00;
ALTER TABLE anilox ADD COLUMN densidad DECIMAL(5, 3) NULL DEFAULT 0.885;
```

4. Corregir constraints:
```sql
ALTER TABLE `anilox` DROP CHECK `chk_anilox_bcm_positivo`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_lineatura_positiva`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_volumen_positivo`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_marca_valida`;

ALTER TABLE `anilox` ADD CONSTRAINT `chk_anilox_bcm_positivo` CHECK (`bcm` >= 0);
ALTER TABLE `anilox` ADD CONSTRAINT `chk_anilox_lineatura_positiva` CHECK (`lineatura` >= 0);
ALTER TABLE `anilox` ADD CONSTRAINT `chk_anilox_volumen_positivo` CHECK (`volumen_real` >= 0);
```

---

## 🎯 ORDEN DE EJECUCIÓN RECOMENDADO

### Para base de datos nueva (Render):

1. Ejecutar `00_MASTER_CREATE_ALL_TABLES.sql` (crea todas las tablas con estructura correcta)
2. Verificar que todo se creó correctamente con `VERIFY_DATABASE.sql`

### Para base de datos existente con problemas:

1. Ejecutar `HOTFIX_FIX_METROS_CONSTRAINT.sql` (si hay error de metros)
2. Ejecutar `HOTFIX_ADD_ANILOX_COLUMNS.sql` (si faltan columnas en anilox)
3. Ejecutar `HOTFIX_FIX_ANILOX_CONSTRAINTS.sql` (si hay error al importar anilox)

---

## ⚠️ NOTAS IMPORTANTES

### Sintaxis MySQL
- **NO usar**: `DROP CONSTRAINT IF EXISTS` (no soportado en MySQL)
- **SÍ usar**: `DROP CHECK nombre_constraint` (sin IF EXISTS)
- Si el constraint no existe, el comando dará error (ignorar y continuar)

### Constraints corregidos
- **Antes**: `CHECK (campo > 0)` - rechaza valor 0
- **Ahora**: `CHECK (campo >= 0)` - permite valor 0
- **Metros**: `CHECK (metros IS NULL OR metros >= 0)` - permite NULL y 0

### Columnas opcionales en anilox
- `factor_eficiencia`: DECIMAL(5,2) NULL DEFAULT 35.00
- `densidad`: DECIMAL(5,3) NULL DEFAULT 0.885

---

## 📚 DOCUMENTACIÓN COMPLETA

- `README.md` - Documentación general de scripts
- `INSTRUCCIONES_INSTALACION.md` - Guía de instalación paso a paso
- `RESUMEN_CAMBIOS.md` - Historial de cambios en la base de datos
- `SOLUCION_ERROR_METROS.md` - Solución detallada error metros
- `SOLUCION_ERROR_ANILOX.md` - Solución detallada error anilox

---

## 🆘 SOPORTE

Si después de aplicar los hotfixes aún hay errores:

1. Revisar logs del backend en Render
2. Verificar permisos del usuario MySQL:
   ```sql
   SHOW GRANTS FOR CURRENT_USER();
   ```
3. Verificar estructura de tablas:
   ```sql
   SHOW CREATE TABLE maquinas;
   SHOW CREATE TABLE anilox;
   ```
4. Consultar documentación completa en archivos `SOLUCION_ERROR_*.md`

---

**Última actualización**: 2026-02-15  
**Sistema**: FlexoAPP  
**Base de datos**: MySQL 8.0+

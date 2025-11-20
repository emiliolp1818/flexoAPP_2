# MIGRACIÓN DE LLAVE PRIMARIA - TABLA DISEÑOS

## Descripción
Cambiar la llave primaria de la tabla `flexographic_designs` de `ID` a `ArticleF`.

## ADVERTENCIAS
- Esta operación es IRREVERSIBLE
- Hacer BACKUP antes de ejecutar
- Verificar que NO haya duplicados en ArticleF
- Verificar que NO haya valores NULL en ArticleF

## Ejecución Automatizada (Recomendado)

```powershell
cd backend/Database
.\fix-primary-key-designs.ps1
```

## Ejecución Manual

```sql
-- 1. Crear backup
mysqldump -u root -p flexoapp_bd flexographic_designs > backup_designs.sql

-- 2. Ejecutar migración
mysql -u root -p flexoapp_bd < 02_fix_primary_key_designs.sql
```

## Verificación

```sql
USE flexoapp_bd;
DESCRIBE flexographic_designs;
SHOW INDEX FROM flexographic_designs WHERE Key_name = 'PRIMARY';
```

## Base de Datos
- Nombre: **flexoapp_bd**
- Tabla: **flexographic_designs**
- Nueva Llave Primaria: **ArticleF**

# 🔧 Solución: Error "Check constraint 'chk_maquinas_metros_positivos' is violated"

## 🐛 Problema

Al intentar subir una programación en Render, aparece el error:

```
Formato de archivo inválido. Check constraint 'chk_maquinas_metros_positivos' is violated.
```

## 🔍 Causa del Error

El constraint `chk_maquinas_metros_positivos` en la tabla `maquinas` está configurado para rechazar valores de metros que sean 0:

```sql
CHECK (`metros` IS NULL OR `metros` > 0)
```

Esto significa que:
- ✅ `metros` = NULL → Permitido
- ✅ `metros` = 1.5 → Permitido
- ❌ `metros` = 0 → RECHAZADO ← Este es el problema

Sin embargo, en la práctica, algunos programas pueden tener metros = 0, especialmente cuando:
- El valor no está disponible en el Excel
- El programa no requiere especificar metros
- Es un valor por defecto temporal

## ✅ Solución

Cambiar el constraint para permitir valores de 0 o mayores:

```sql
CHECK (`metros` IS NULL OR `metros` >= 0)
```

Ahora:
- ✅ `metros` = NULL → Permitido
- ✅ `metros` = 0 → Permitido
- ✅ `metros` = 1.5 → Permitido
- ❌ `metros` = -1 → Rechazado (valores negativos no tienen sentido)

## 🚀 Aplicar la Solución

### Opción 1: Hotfix en Base de Datos Existente (Recomendado para Producción)

Si ya tienes la base de datos en producción en Render, ejecuta el hotfix:

```bash
mysql -u usuario -p base_datos < HOTFIX_FIX_METROS_CONSTRAINT.sql
```

O desde MySQL:

```sql
-- Eliminar constraint antiguo
ALTER TABLE `maquinas` 
DROP CONSTRAINT IF EXISTS `chk_maquinas_metros_positivos`;

-- Agregar constraint corregido
ALTER TABLE `maquinas` 
ADD CONSTRAINT `chk_maquinas_metros_positivos` 
CHECK (`metros` IS NULL OR `metros` >= 0);
```

### Opción 2: Recrear Base de Datos (Solo para Desarrollo)

Si estás en desarrollo y puedes recrear la base de datos:

```bash
mysql -u usuario -p base_datos < 00_MASTER_CREATE_ALL_TABLES.sql
```

El script maestro ya está corregido con el constraint actualizado.

## 🔍 Verificar la Corrección

Después de aplicar el hotfix, verifica que el constraint se actualizó:

```sql
SELECT 
    CONSTRAINT_NAME as 'Constraint',
    CHECK_CLAUSE as 'Condición'
FROM 
    INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'chk_maquinas_metros_positivos';
```

Deberías ver:

```
Constraint: chk_maquinas_metros_positivos
Condición: (`metros` IS NULL OR `metros` >= 0)
```

## 🧪 Probar la Solución

Después de aplicar el hotfix, intenta insertar un registro con metros = 0:

```sql
INSERT INTO `maquinas` (
    `ot_sap`, `articulo`, `numero_maquina`, `cliente`, 
    `referencia`, `td`, `numero_colores`, `colores`, 
    `kilos`, `metros`, `fecha_tinta_en_maquina`, `sustrato`
) VALUES (
    'TEST001', 'F123456', 15, 'Cliente Test',
    'REF001', 'TD01', 4, '["CYAN","MAGENTA","AMARILLO","NEGRO"]',
    100.500, 0, NOW(), 'BOPP'
);
```

Si funciona sin error, el hotfix se aplicó correctamente. Luego elimina el registro de prueba:

```sql
DELETE FROM `maquinas` WHERE `ot_sap` = 'TEST001';
```

## 📋 Checklist de Aplicación

- [ ] Hacer backup de la base de datos antes de aplicar cambios
- [ ] Conectarse a la base de datos de Render
- [ ] Ejecutar el script HOTFIX_FIX_METROS_CONSTRAINT.sql
- [ ] Verificar que el constraint se actualizó correctamente
- [ ] Probar subir una programación con metros = 0
- [ ] Confirmar que no hay errores

## 🎯 Para Render (Producción)

### Paso 1: Conectarse a la Base de Datos

Desde el dashboard de Render:
1. Ve a tu servicio de base de datos MySQL
2. Copia la cadena de conexión externa
3. Conéctate usando MySQL Workbench o línea de comandos

### Paso 2: Ejecutar el Hotfix

```bash
mysql -h <host> -u <usuario> -p<password> <base_datos> < HOTFIX_FIX_METROS_CONSTRAINT.sql
```

O copia y pega el contenido del script directamente en MySQL Workbench.

### Paso 3: Verificar

Intenta subir tu archivo Excel nuevamente desde la aplicación.

## 🔄 Alternativa: Modificar Validación en el Backend

Si no puedes modificar la base de datos inmediatamente, puedes agregar validación en el backend para convertir metros = 0 a NULL:

```csharp
// En MaquinaService.cs, antes de insertar/actualizar
if (createDto.Metros.HasValue && createDto.Metros.Value == 0)
{
    createDto.Metros = null; // Convertir 0 a NULL
}
```

Sin embargo, la solución correcta es arreglar el constraint en la base de datos.

## 📞 Soporte

Si después de aplicar el hotfix sigues teniendo problemas:

1. Verifica que el constraint se actualizó correctamente
2. Revisa los logs del backend para ver qué valor de metros se está intentando insertar
3. Verifica que no haya otros constraints que estén causando el error

## 📝 Notas Adicionales

- Este hotfix es seguro y no afecta datos existentes
- Solo cambia la validación para permitir metros = 0
- Los valores negativos siguen siendo rechazados (lo cual es correcto)
- El campo metros sigue siendo opcional (puede ser NULL)

## ✅ Resumen

**Problema**: Constraint rechaza metros = 0  
**Solución**: Cambiar `metros > 0` a `metros >= 0`  
**Archivo**: HOTFIX_FIX_METROS_CONSTRAINT.sql  
**Tiempo estimado**: 1 minuto  
**Riesgo**: Bajo (solo cambia validación)

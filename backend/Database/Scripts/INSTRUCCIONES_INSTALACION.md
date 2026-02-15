# 📘 Instrucciones de Instalación - Base de Datos FlexoAPP

## 🎯 Objetivo
Crear todas las tablas del sistema FlexoAPP correctamente, incluyendo la tabla `users` que está presentando problemas.

## ⚠️ Problema Identificado
La tabla `users` no se está creando correctamente. Este documento proporciona la solución paso a paso.

## 🔧 Solución

### Paso 1: Verificar Conexión a la Base de Datos

Primero, asegúrate de poder conectarte a tu base de datos MySQL:

```bash
mysql -u tu_usuario -p
```

Luego selecciona tu base de datos:

```sql
USE flexoapp_bd;
```

### Paso 2: Verificar Estado Actual

Ejecuta el script de verificación para ver qué tablas existen:

```bash
mysql -u tu_usuario -p flexoapp_bd < VERIFY_DATABASE.sql
```

O desde MySQL:

```sql
SHOW TABLES;
```

### Paso 3: Limpiar Base de Datos (Opcional)

⚠️ **ADVERTENCIA**: Esto eliminará TODAS las tablas existentes. Solo hazlo si estás seguro.

```sql
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `maquinas_backup`;
DROP TABLE IF EXISTS `maquinas`;
DROP TABLE IF EXISTS `Activities`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `Documento`;
DROP TABLE IF EXISTS `designs`;
DROP TABLE IF EXISTS `condicionunica`;
DROP TABLE IF EXISTS `anilox`;
DROP TABLE IF EXISTS `machine_config`;
DROP TABLE IF EXISTS `system_configs`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;
```

### Paso 4: Ejecutar Script Maestro

Ejecuta el script maestro actualizado que crea todas las tablas:

#### Opción A: Desde línea de comandos

```bash
mysql -u tu_usuario -p flexoapp_bd < 00_MASTER_CREATE_ALL_TABLES.sql
```

#### Opción B: Desde MySQL Workbench

1. Abre MySQL Workbench
2. Conecta a tu base de datos
3. Abre el archivo `00_MASTER_CREATE_ALL_TABLES.sql`
4. Ejecuta el script completo (⚡ botón de rayo)

#### Opción C: Desde línea de comandos de MySQL

```bash
mysql -u tu_usuario -p
```

Luego:

```sql
USE flexoapp_bd;
SOURCE /ruta/completa/al/archivo/00_MASTER_CREATE_ALL_TABLES.sql;
```

### Paso 5: Verificar Creación de Tablas

Verifica que todas las tablas se crearon correctamente:

```sql
SHOW TABLES;
```

Deberías ver estas 11 tablas:
- Activities
- Documento
- anilox
- condicionunica
- designs
- machine_config
- maquinas
- maquinas_backup
- refresh_tokens
- system_configs
- users

### Paso 6: Verificar Tabla Users

Verifica la estructura de la tabla users:

```sql
DESCRIBE users;
```

Deberías ver estas columnas:
- Id (INT, PRIMARY KEY, AUTO_INCREMENT)
- UserCode (VARCHAR(50), UNIQUE)
- Password (VARCHAR(255))
- FirstName (VARCHAR(50))
- LastName (VARCHAR(50))
- Role (VARCHAR(50))
- Permissions (JSON)
- ProfileImage (LONGTEXT)
- Email (VARCHAR(100))
- Phone (VARCHAR(20))
- IsActive (TINYINT(1))
- CreatedAt (DATETIME(6))
- UpdatedAt (DATETIME(6))

### Paso 7: Verificar Usuario Administrador

Verifica que el usuario administrador se creó:

```sql
SELECT Id, UserCode, FirstName, LastName, Role, IsActive 
FROM users 
WHERE UserCode = 'admin';
```

Deberías ver:
- UserCode: admin
- FirstName: Administrador
- LastName: Sistema
- Role: Admin
- IsActive: 1

### Paso 8: Probar Login

Intenta hacer login con las credenciales:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 🔍 Diagnóstico de Problemas

### Problema: "Table 'users' doesn't exist"

**Solución**: La tabla no se creó. Ejecuta el script maestro nuevamente.

### Problema: "Duplicate entry for key 'PRIMARY'"

**Solución**: La tabla ya existe. Verifica con `SHOW TABLES;`

### Problema: "Access denied"

**Solución**: Verifica los permisos del usuario:

```sql
SHOW GRANTS FOR 'tu_usuario'@'localhost';
```

Si no tienes permisos, pide al administrador que ejecute:

```sql
GRANT ALL PRIVILEGES ON flexoapp_bd.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Problema: "Foreign key constraint fails"

**Solución**: Las tablas se están creando en el orden incorrecto. Usa el script maestro que respeta las dependencias.

### Problema: "Unknown database"

**Solución**: Crea la base de datos primero:

```sql
CREATE DATABASE IF NOT EXISTS flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

## 📊 Scripts Disponibles

### Script Maestro (Recomendado)
- **00_MASTER_CREATE_ALL_TABLES.sql** - Crea todas las tablas en el orden correcto

### Scripts Individuales
- **01_CREATE_USERS_TABLE.sql** - Solo tabla users
- **VERIFY_DATABASE.sql** - Verificación completa de la base de datos

## 🎓 Mejores Prácticas

1. **Siempre haz backup** antes de ejecutar scripts en producción
2. **Verifica la conexión** antes de ejecutar scripts
3. **Lee los mensajes de error** completos para diagnosticar problemas
4. **Usa transacciones** cuando hagas cambios importantes
5. **Documenta los cambios** que hagas a la base de datos

## 📞 Soporte

Si después de seguir estos pasos sigues teniendo problemas:

1. Ejecuta el script de verificación: `VERIFY_DATABASE.sql`
2. Guarda el output completo
3. Revisa los logs de MySQL
4. Contacta al equipo de desarrollo con la información recopilada

## ✅ Checklist de Instalación

- [ ] Conexión a MySQL establecida
- [ ] Base de datos `flexoapp_bd` existe
- [ ] Permisos de usuario verificados
- [ ] Script maestro ejecutado sin errores
- [ ] 11 tablas creadas correctamente
- [ ] Tabla `users` existe y tiene la estructura correcta
- [ ] Usuario `admin` creado
- [ ] Login con `admin/admin123` funciona
- [ ] Procedimientos almacenados creados
- [ ] Evento de limpieza programado

## 🎉 ¡Listo!

Si completaste todos los pasos del checklist, tu base de datos está lista para usar.

**Siguiente paso**: Cambia la contraseña del usuario administrador por seguridad.

```sql
UPDATE users 
SET Password = '$2a$11$TU_NUEVO_HASH_BCRYPT' 
WHERE UserCode = 'admin';
```

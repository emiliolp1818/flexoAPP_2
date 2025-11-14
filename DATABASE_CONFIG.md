# 🗄️ Configuración de Base de Datos - FlexoAPP

## 📋 Información General

- **Base de Datos:** flexoapp_bd
- **Motor:** MySQL 8.0+
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **Puerto:** 3306 (por defecto)
- **Host:** localhost

## 🔧 Configuración Inicial

### 1. Crear Base de Datos

```sql
-- Conectar a MySQL
mysql -u root -p

-- Crear base de datos con soporte Unicode completo
CREATE DATABASE flexoapp_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Verificar que se creó correctamente
SHOW DATABASES LIKE 'flexoapp_bd';
```

### 2. Configurar Usuario (Opcional)

```sql
-- Crear usuario específico para FlexoAPP
CREATE USER 'flexoapp_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';

-- Otorgar permisos completos sobre la base de datos
GRANT ALL PRIVILEGES ON flexoapp_bd.* TO 'flexoapp_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

### 3. Ejecutar Scripts de Configuración

```bash
# Opción 1: Script completo (recomendado para instalación nueva)
mysql -u root -p flexoapp_bd < backend/Database/Scripts/SETUP_COMPLETE_DATABASE.sql

# Opción 2: Script básico (solo estructura mínima)
mysql -u root -p flexoapp_bd < backend/Database/Scripts/00_SetupDatabase.sql
```

## 📁 Estructura de Tablas

### Tabla: Users
- **Propósito:** Almacenar usuarios del sistema
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** UserCode
- **Campos Importantes:**
  - UserCode: código único de usuario
  - Password: contraseña hasheada con bcrypt
  - Role: rol del usuario (Admin, Supervisor, Operador, etc.)
  - IsActive: estado del usuario (activo/inactivo)

### Tabla: Designs
- **Propósito:** Almacenar diseños flexográficos
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** ArticleF
- **Campos Importantes:**
  - ArticleF: código único del artículo
  - Client: nombre del cliente
  - ColorCount: cantidad de colores (1-10)
  - Color1-Color10: colores individuales
  - Status: estado del diseño (ACTIVO/INACTIVO)

### Tabla: MachinePrograms
- **Propósito:** Programación de máquinas flexográficas
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** OtSap
- **Campos Importantes:**
  - MachineNumber: número de máquina (11-21)
  - OtSap: orden de trabajo SAP
  - Estado: estado del programa (LISTO, EN_PROCESO, etc.)
  - Colores: array JSON de colores

### Tabla: Maquinas
- **Propósito:** Información de máquinas y artículos
- **Clave Primaria:** Articulo (VARCHAR)
- **Campos Importantes:**
  - NumeroMaquina: número de máquina
  - FechaTintaEnMaquina: fecha de aplicación de tinta
  - Colores: array JSON de colores

### Tabla: Pedidos
- **Propósito:** Gestión de pedidos
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Únicos:** NumeroPedido
- **Campos Importantes:**
  - MachineNumber: número de máquina asignada
  - Estado: estado del pedido (PENDIENTE, EN_PROCESO, etc.)
  - Prioridad: prioridad del pedido (ALTA, NORMAL, BAJA)

### Tabla: CondicionUnica
- **Propósito:** Ubicación de artículos en estantes
- **Clave Primaria:** id (INT AUTO_INCREMENT)
- **Campos Importantes:**
  - farticulo: código del artículo
  - estante: código del estante
  - numerocarpeta: número de carpeta

### Tabla: Activities
- **Propósito:** Auditoría de acciones de usuarios
- **Clave Primaria:** Id (INT AUTO_INCREMENT)
- **Campos Importantes:**
  - UserId: ID del usuario que realizó la acción
  - Action: acción realizada
  - Module: módulo donde se realizó la acción
  - Timestamp: fecha y hora de la acción

## 🔗 Cadena de Conexión

### Formato General
```
Server=localhost;Port=3306;Database=flexoapp_bd;User=root;Password=12345;AllowUserVariables=True;UseAffectedRows=False;
```

### Componentes de la Cadena
- **Server:** dirección del servidor MySQL (localhost para local)
- **Port:** puerto de MySQL (3306 por defecto)
- **Database:** nombre de la base de datos (flexoapp_bd)
- **User:** usuario de MySQL (root o usuario específico)
- **Password:** contraseña del usuario
- **AllowUserVariables:** permite usar variables de usuario en consultas
- **UseAffectedRows:** retorna filas afectadas en lugar de filas encontradas

### Configuración en appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=flexoapp_bd;User=root;Password=12345;AllowUserVariables=True;UseAffectedRows=False;"
  }
}
```

## 🔐 Seguridad

### Recomendaciones
1. **Nunca** subir contraseñas a GitHub
2. Usar variables de entorno para producción
3. Cambiar la contraseña por defecto del usuario root
4. Crear usuarios específicos con permisos limitados
5. Usar contraseñas fuertes (mínimo 12 caracteres)
6. Habilitar SSL/TLS para conexiones remotas

### Usuario Administrador por Defecto
- **UserCode:** admin
- **Password:** admin123
- **Rol:** Admin
- **IMPORTANTE:** Cambiar esta contraseña en producción

## 📊 Migraciones

### Aplicar Migraciones con Entity Framework
```bash
# Navegar a la carpeta del backend
cd backend

# Crear una nueva migración
dotnet ef migrations add NombreDeLaMigracion

# Aplicar migraciones pendientes
dotnet ef database update

# Revertir última migración
dotnet ef database update NombreMigracionAnterior

# Eliminar última migración (si no se aplicó)
dotnet ef migrations remove
```

### Verificar Estado de Migraciones
```bash
# Ver migraciones aplicadas
dotnet ef migrations list

# Ver script SQL de una migración
dotnet ef migrations script
```

## 🔍 Verificación y Mantenimiento

### Verificar Conexión
```sql
-- Verificar que la base de datos existe
SHOW DATABASES LIKE 'flexoapp_bd';

-- Verificar tablas creadas
USE flexoapp_bd;
SHOW TABLES;

-- Verificar estructura de una tabla
DESCRIBE Users;
DESCRIBE Designs;
```

### Verificar Datos
```sql
-- Contar registros en cada tabla
SELECT 'Users' as Tabla, COUNT(*) as Total FROM Users
UNION ALL
SELECT 'Designs', COUNT(*) FROM Designs
UNION ALL
SELECT 'MachinePrograms', COUNT(*) FROM MachinePrograms
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM Pedidos;
```

### Backup de Base de Datos
```bash
# Crear backup completo
mysqldump -u root -p flexoapp_bd > backup_flexoapp_bd_$(date +%Y%m%d).sql

# Crear backup solo de estructura (sin datos)
mysqldump -u root -p --no-data flexoapp_bd > estructura_flexoapp_bd.sql

# Crear backup solo de datos
mysqldump -u root -p --no-create-info flexoapp_bd > datos_flexoapp_bd.sql
```

### Restaurar Base de Datos
```bash
# Restaurar desde backup
mysql -u root -p flexoapp_bd < backup_flexoapp_bd_20241114.sql
```

## 🐛 Solución de Problemas

### Error: "Access denied for user"
```bash
# Verificar usuario y contraseña
mysql -u root -p

# Resetear contraseña de root (si es necesario)
# 1. Detener MySQL
# 2. Iniciar en modo seguro
# 3. Cambiar contraseña
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nueva_contraseña';
```

### Error: "Unknown database 'flexoapp_bd'"
```sql
-- Crear la base de datos
CREATE DATABASE flexoapp_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Table doesn't exist"
```bash
# Ejecutar script de configuración
mysql -u root -p flexoapp_bd < backend/Database/Scripts/SETUP_COMPLETE_DATABASE.sql
```

### Error: "Connection timeout"
```bash
# Verificar que MySQL está corriendo
# Windows:
net start MySQL80

# Linux/Mac:
sudo systemctl start mysql
```

## 📚 Recursos Adicionales

- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Pomelo.EntityFrameworkCore.MySql](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql)

## 📞 Soporte

Si tienes problemas con la configuración de la base de datos:
1. Verifica que MySQL esté instalado y corriendo
2. Verifica la cadena de conexión en appsettings.json
3. Ejecuta los scripts de configuración en orden
4. Revisa los logs de la aplicación en la carpeta `logs/`

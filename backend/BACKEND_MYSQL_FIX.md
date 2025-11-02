# 🔧 FlexoAPP Backend - Corrección MySQL

## 🚨 Problema Identificado

**Error**: `System.ArgumentException: Option 'commandtimeout' not supported.`

**Causa**: La opción `CommandTimeout` en la cadena de conexión no es compatible con MySqlConnector.

## ✅ Correcciones Aplicadas

### 1. Cadenas de Conexión Corregidas

#### Antes (❌ Incorrecto)
```json
"DefaultConnection": "Server=192.168.1.6;Database=flexoapp_db;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=60;CommandTimeout=300;Pooling=true;MinPoolSize=5;MaxPoolSize=100;ConnectionLifeTime=300;"
```

#### Después (✅ Correcto)
```json
"DefaultConnection": "Server=192.168.1.6;Database=flexoapp_db;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=60;DefaultCommandTimeout=300;Pooling=true;MinimumPoolSize=5;MaximumPoolSize=100;ConnectionLifeTime=300;"
```

### 2. Cambios Realizados

| Parámetro Anterior | Parámetro Correcto | Descripción |
|-------------------|-------------------|-------------|
| `CommandTimeout=300` | `DefaultCommandTimeout=300` | Timeout para comandos SQL |
| `MinPoolSize=5` | `MinimumPoolSize=5` | Tamaño mínimo del pool |
| `MaxPoolSize=100` | `MaximumPoolSize=100` | Tamaño máximo del pool |

### 3. Configuración Entity Framework

#### Antes (❌ Problemático)
```csharp
mySqlOptions.CommandTimeout(300); // 5 minutos
```

#### Después (✅ Correcto)
```csharp
// CommandTimeout se maneja a través de la cadena de conexión
// con DefaultCommandTimeout=300
```

## 📁 Archivos Modificados

### Archivos Principales
- ✅ `appsettings.json` - Configuración principal corregida
- ✅ `Program.cs` - Configuración EF simplificada
- ✅ `appsettings.Development.json` - Configuración de desarrollo
- ✅ `appsettings.Production.json` - Configuración de producción

### Archivos Nuevos
- ✅ `Scripts/test-database-connection.sql` - Script de verificación
- ✅ `BACKEND_MYSQL_FIX.md` - Esta documentación

## 🔧 Configuraciones por Ambiente

### Development
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_db;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=30;DefaultCommandTimeout=120;Pooling=true;MinimumPoolSize=2;MaximumPoolSize=50;ConnectionLifeTime=300;"
  }
}
```

### Production
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=192.168.1.6;Database=flexoapp_db;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=60;DefaultCommandTimeout=300;Pooling=true;MinimumPoolSize=5;MaximumPoolSize=100;ConnectionLifeTime=300;SslMode=Preferred;"
  }
}
```

## 🚀 Parámetros MySqlConnector Válidos

### Conexión
- `Server` - Servidor MySQL
- `Database` - Base de datos
- `Uid` / `User Id` - Usuario
- `Pwd` / `Password` - Contraseña
- `Port` - Puerto (default: 3306)

### Configuración
- `ConnectionTimeout` - Timeout de conexión
- `DefaultCommandTimeout` - Timeout de comandos
- `CharSet` - Conjunto de caracteres
- `SslMode` - Modo SSL

### Pool de Conexiones
- `Pooling` - Habilitar pooling
- `MinimumPoolSize` - Tamaño mínimo
- `MaximumPoolSize` - Tamaño máximo
- `ConnectionLifeTime` - Vida útil de conexión

### Opciones Avanzadas
- `AllowUserVariables` - Permitir variables de usuario
- `UseAffectedRows` - Usar filas afectadas
- `TreatTinyAsBoolean` - Tratar TINYINT como boolean

## 🧪 Verificación de Conexión

### 1. Ejecutar Script SQL
```bash
mysql -u root -p flexoapp_db < Scripts/test-database-connection.sql
```

### 2. Verificar en Aplicación
```bash
dotnet run --environment Development
```

### 3. Endpoint de Health Check
```
GET http://localhost:7003/health
```

## 🔍 Troubleshooting

### Error: "Access denied for user"
```bash
# Verificar permisos
mysql -u root -p
GRANT ALL PRIVILEGES ON flexoapp_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Unknown database"
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE flexoapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Connection timeout"
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql
# o en Windows
net start mysql
```

## ✅ Checklist de Verificación

- [x] Cadenas de conexión corregidas
- [x] Parámetros MySqlConnector válidos
- [x] Configuración EF simplificada
- [x] Archivos por ambiente creados
- [x] Script de verificación incluido
- [x] Documentación actualizada

## 🎯 Próximos Pasos

1. **Reiniciar la aplicación** con las nuevas configuraciones
2. **Verificar conexión** usando el script SQL
3. **Probar endpoints** de la API
4. **Monitorear logs** para confirmar funcionamiento
5. **Ejecutar migraciones** si es necesario

---

*Corrección aplicada: Octubre 2025*
*MySqlConnector compatible: ✅*
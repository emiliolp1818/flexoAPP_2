# 📁 Scripts de Base de Datos - FlexoAPP

Esta carpeta contiene todos los scripts SQL necesarios para crear y configurar la base de datos MySQL de FlexoAPP.

## 🗂️ Estructura de Scripts

### Script Principal
- **`00_MASTER_SETUP.sql`** - Script maestro que ejecuta todos los demás scripts automáticamente

### Scripts Individuales (Orden de ejecución)
1. **`01_CREATE_USERS_TABLE.sql`** - Tabla de usuarios del sistema
2. **`02_CREATE_ACTIVITIES_TABLE.sql`** - Tabla de actividades/logs
3. **`03_CREATE_DESIGNS_TABLE.sql`** - Tabla de diseños flexográficos
4. **`04_CREATE_MAQUINAS_TABLE.sql`** - Tabla de máquinas y programas
5. **`05_CREATE_PEDIDOS_TABLE.sql`** - Tabla de pedidos de producción
6. **`06_CREATE_CONDICIONUNICA_TABLE.sql`** - Tabla de condiciones únicas
7. **`07_CREATE_DOCUMENTO_TABLE.sql`** - Tabla de documentos del sistema
8. **`08_CREATE_REFRESH_TOKENS_TABLE.sql`** - Tabla de tokens JWT

## 🚀 Uso Rápido

### Opción 1: Script Maestro (Recomendado)
```sql
-- Ejecutar en MySQL/Railway
SOURCE 00_MASTER_SETUP.sql;
```

### Opción 2: Scripts Individuales
```sql
-- Ejecutar en orden numérico
SOURCE 01_CREATE_USERS_TABLE.sql;
SOURCE 02_CREATE_ACTIVITIES_TABLE.sql;
-- ... continuar con el resto
```

## 📋 Características de los Scripts

### ✅ Seguridad
- **IF NOT EXISTS** - No sobrescribe tablas existentes
- **Validaciones** - Constraints para integridad de datos
- **Claves foráneas** - Relaciones entre tablas

### ✅ Optimización
- **Índices** - Para consultas rápidas
- **Tipos de datos** - Optimizados para MySQL
- **Charset UTF8MB4** - Soporte completo Unicode

### ✅ Auditoría
- **CreatedAt/UpdatedAt** - Timestamps automáticos
- **Usuarios de creación** - Tracking de cambios
- **Logs de actividad** - Registro de acciones

## 🗄️ Tablas Creadas

| Tabla | Propósito | Registros Iniciales |
|-------|-----------|-------------------|
| `users` | Usuarios del sistema | 1 (admin) |
| `Activities` | Log de actividades | 0 |
| `designs` | Diseños flexográficos | 0 |
| `maquinas` | Máquinas y programas | 0 |
| `Pedidos` | Pedidos de producción | 0 |
| `condicionunica` | Condiciones únicas | 0 |
| `Documento` | Documentos del sistema | 0 |
| `refresh_tokens` | Tokens JWT | 0 |

## 🔐 Usuario por Defecto

Después de ejecutar los scripts, se crea automáticamente:

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: `Admin`

## 🌐 Compatibilidad

- **MySQL 8.0+** ✅
- **MySQL 5.7+** ✅
- **Railway MySQL** ✅
- **Render MySQL** ✅

## 📝 Notas Importantes

1. **Orden de ejecución**: Los scripts deben ejecutarse en orden numérico debido a las dependencias de claves foráneas
2. **Idempotencia**: Todos los scripts pueden ejecutarse múltiples veces sin problemas
3. **Charset**: Configurado para UTF8MB4 (soporte completo Unicode)
4. **Zona horaria**: Configurado para UTC (+00:00)

## 🔧 Troubleshooting

### Error de permisos
```sql
-- Verificar permisos del usuario
SHOW GRANTS FOR CURRENT_USER();
```

### Error de charset
```sql
-- Verificar configuración
SHOW VARIABLES LIKE 'character_set%';
```

### Verificar tablas creadas
```sql
-- Listar todas las tablas
SHOW TABLES;

-- Ver estructura de una tabla
DESCRIBE users;
```
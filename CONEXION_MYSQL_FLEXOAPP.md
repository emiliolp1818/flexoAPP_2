# 🔗 CONEXIÓN A BASE DE DATOS MYSQL - FLEXOAPP

## 📋 CONFIGURACIÓN DE CONEXIÓN

### 🗄️ Datos de Conexión
- **Servidor**: `localhost`
- **Puerto**: `3306` (puerto por defecto de MySQL)
- **Base de Datos**: `flexoapp_bd`
- **Tabla de Usuarios**: `users`
- **Usuario MySQL**: `root`
- **Contraseña**: `12345`

### 🔧 Configuración del Backend (.NET)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_bd;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=30;DefaultCommandTimeout=120;Pooling=true;MinimumPoolSize=2;MaximumPoolSize=50;ConnectionLifeTime=300;"
  }
}
```

### 🌐 Configuración del Frontend (Angular)
```typescript
export const environment = {
  apiUrl: 'http://localhost:7003/api',
  // El backend se conecta automáticamente a MySQL
};
```

## 📊 ESTRUCTURA DE LA TABLA USERS

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    UserCode VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Role ENUM('Admin', 'Supervisor', 'Prealistador', 'Matizadores', 'Operario', 'Retornos'),
    Permissions TEXT,
    ProfileImage LONGTEXT,
    ProfileImageUrl VARCHAR(500),
    Email VARCHAR(100),
    Phone VARCHAR(20),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🚀 ENDPOINTS ACTUALIZADOS

### 👥 Gestión de Usuarios
- **GET** `/api/auth/users` - Obtener todos los usuarios
- **POST** `/api/auth/users` - Crear nuevo usuario
- **PUT** `/api/auth/users/{id}` - Actualizar usuario
- **PATCH** `/api/auth/users/{id}/status` - Cambiar estado activo/inactivo
- **DELETE** `/api/auth/users/{id}` - Eliminar usuario
- **POST** `/api/auth/users/{id}/reset-password` - Restablecer contraseña

### 🖼️ Gestión de Imágenes de Perfil
- **POST** `/api/auth/users/{id}/profile-image` - Subir imagen de perfil
- **GET** `/api/auth/profile-photo` - Obtener imagen de perfil actual

## 🔑 ROLES DISPONIBLES EN MYSQL

| Enum Value | Nombre Mostrado | Descripción |
|------------|-----------------|-------------|
| `Admin` | Administrador | Acceso completo al sistema |
| `Supervisor` | Supervisor | Supervisión de operaciones |
| `Prealistador` | Pre-alistador | Preparación de pedidos |
| `Matizadores` | Matizador | Gestión de colores y tintas |
| `Operario` | Operario | Operación básica de máquinas |
| `Retornos` | Retornos | Gestión de retornos |

## ✅ CAMBIOS IMPLEMENTADOS

### 🔓 Sin Restricciones de Permisos
- **TODOS los usuarios** pueden gestionar otros usuarios
- **TODOS los usuarios** pueden crear, editar y eliminar usuarios
- **TODOS los usuarios** pueden cambiar estados y restablecer contraseñas
- **NO hay restricciones** por rol

### 🗑️ Datos de Prueba Eliminados
- Se eliminaron los 8 usuarios de ejemplo
- La aplicación ahora carga **solo usuarios reales** de MySQL
- Base de datos limpia para producción

### 🔄 Actualización en Tiempo Real
- Actualización automática cada 30 segundos
- Detección inteligente de cambios en MySQL
- Notificaciones discretas cuando hay cambios

### 🎨 Mejoras Visuales
- Iconos de acciones más grandes (22px)
- Botones de acciones más grandes (36px)
- Avatares mejorados (40px)
- Efectos hover y animaciones

### 🖼️ Fotos de Perfil Corregidas
- Manejo correcto de URLs de imágenes
- Sistema de fallback para imágenes no disponibles
- Lazy loading optimizado
- Avatares por defecto mejorados

## 🔍 VERIFICAR USUARIOS EN MYSQL

### Ejecutar Script SQL
```bash
mysql -u root -p12345 -h localhost -P 3306 flexoapp_bd < VERIFICAR_USUARIOS_MYSQL.sql
```

### Comandos Manuales
```sql
USE flexoapp_bd;

-- Ver todos los usuarios
SELECT id, UserCode, FirstName, LastName, Role, IsActive FROM users;

-- Contar usuarios por rol
SELECT Role, COUNT(*) as Total FROM users GROUP BY Role;

-- Ver usuarios activos
SELECT * FROM users WHERE IsActive = 1;
```

## 🚀 INICIAR LA APLICACIÓN

### 1. Backend (.NET)
```bash
cd backend
dotnet run
# Servidor en: http://localhost:7003
```

### 2. Frontend (Angular)
```bash
cd Frontend
npm start
# Aplicación en: http://localhost:4200
```

### 3. Verificar Conexión
1. Abrir navegador en `http://localhost:4200`
2. Ir a **Configuraciones > Usuarios**
3. Verificar que se cargan usuarios reales de MySQL
4. Probar crear, editar y eliminar usuarios

## 📝 LOGS DE VERIFICACIÓN

El sistema mostrará logs como:
```
🔍 Cargando usuarios reales desde flexoapp_bd...
🌐 URL del API: http://localhost:7003/api
✅ Respuesta de usuarios recibida: [array de usuarios]
📊 X usuarios cargados desde MySQL flexoapp_bd
```

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error de Conexión MySQL
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales (root/12345)
3. Verificar que existe la base de datos `flexoapp_bd`
4. Verificar que existe la tabla `users`

### Error 404 en Endpoints
1. Verificar que el backend esté ejecutándose en puerto 7003
2. Verificar que los controladores estén registrados
3. Revisar logs del backend

### No se Muestran Usuarios
1. Verificar que hay usuarios en la tabla MySQL
2. Verificar que los usuarios tienen `IsActive = 1`
3. Revisar logs del navegador (F12)

---

## 🎯 RESULTADO ESPERADO

✅ **Conexión directa** a MySQL `flexoapp_bd`  
✅ **Usuarios reales** mostrados en la interfaz  
✅ **Sin restricciones** de permisos por rol  
✅ **Actualización automática** cada 30 segundos  
✅ **Fotos de perfil** funcionando correctamente  
✅ **Iconos grandes** y botones mejorados  
✅ **Base de datos limpia** sin datos de prueba  

La aplicación ahora está completamente conectada a la base de datos MySQL real y lista para uso en producción.
# 🔧 Setup - Scripts de Configuración Inicial

Scripts para configurar la base de datos MySQL de FlexoAPP por primera vez.

---

## 📋 Scripts Disponibles

### 1. `CREATE_USERS_TABLE.sql`
Crea la tabla `Users` con todos sus campos y relaciones.

**Campos principales:**
- Id, UserCode, Password (BCrypt)
- FirstName, LastName, Role
- Permissions (JSON), ProfileImage
- IsActive, CreatedAt, UpdatedAt

### 2. `CREATE_USER_ACTIVITIES_TABLE.sql`
Crea la tabla `Activities` para auditoría del sistema.

**Campos principales:**
- Id, UserId, UserCode
- Action, Description, Module
- Details (JSON), IpAddress
- Timestamp

### 3. `CREATE_SYSTEM_CONFIGS_TABLE.sql`
Crea la tabla `SystemConfigs` para configuraciones del sistema.

**Campos principales:**
- Id, Name, Description
- Value, Type, Category
- Options, CreatedAt, UpdatedAt

### 4. `INSERT_DEFAULT_USERS.sql`
Inserta el usuario administrador por defecto.

**Usuario creado:**
- UserCode: `admin`
- Password: `admin123` (BCrypt)
- Role: `ADMIN`

---

## 🚀 Orden de Ejecución

```bash
1. CREATE_USERS_TABLE.sql
2. CREATE_USER_ACTIVITIES_TABLE.sql
3. CREATE_SYSTEM_CONFIGS_TABLE.sql
4. INSERT_DEFAULT_USERS.sql
```

---

## ⚠️ Importante

- **Ejecutar solo una vez** al configurar nueva base de datos
- **Hacer backup** antes de ejecutar
- **Verificar conexión** a MySQL antes de ejecutar
- **Cambiar contraseña** del admin después de la instalación

---

## ✅ Verificación

Después de ejecutar los scripts, verificar:

```sql
-- Verificar tablas creadas
SHOW TABLES;

-- Verificar usuario admin
SELECT * FROM Users WHERE UserCode = 'admin';

-- Verificar estructura de Activities
DESCRIBE Activities;

-- Verificar configuraciones
SELECT * FROM SystemConfigs;
```

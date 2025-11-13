# 🚂 Guía Completa de Despliegue en Railway

## 📋 Índice
1. [Preparación](#preparación)
2. [Configurar Base de Datos MySQL](#configurar-base-de-datos-mysql)
3. [Desplegar Backend (.NET)](#desplegar-backend-net)
4. [Desplegar Frontend (Angular)](#desplegar-frontend-angular)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Verificación y Pruebas](#verificación-y-pruebas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Preparación

### Requisitos Previos
- ✅ Cuenta en Railway (https://railway.app)
- ✅ Repositorio Git (GitHub, GitLab, o Bitbucket)
- ✅ Código subido al repositorio

### Estructura del Proyecto
```
flexoAPP_2/
├── backend/              # Backend .NET 8.0
├── Frontend/             # Frontend Angular 20
├── Dockerfile.backend    # ✅ Creado
├── Dockerfile.frontend   # ✅ Creado
├── nginx.conf           # ✅ Creado
└── railway.json         # ✅ Creado
```

---

## 📊 Paso 1: Configurar Base de Datos MySQL

### 1.1 Crear Servicio MySQL en Railway

1. **Ir a Railway Dashboard**
   - Visita: https://railway.app/dashboard
   - Click en "New Project"

2. **Agregar MySQL**
   - Click en "+ New"
   - Selecciona "Database"
   - Elige "MySQL"
   - Railway creará automáticamente la base de datos

3. **Obtener Credenciales**
   - Click en el servicio MySQL
   - Ve a la pestaña "Variables"
   - Copia estas variables (las necesitarás después):
     ```
     MYSQL_HOST
     MYSQL_PORT
     MYSQL_USER
     MYSQL_PASSWORD
     MYSQL_DATABASE
     ```

### 1.2 Conectar y Crear Tablas

**Opción A: Usando Railway CLI**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar a MySQL
railway connect mysql
```

**Opción B: Usando MySQL Workbench**
- Host: `[MYSQL_HOST de Railway]`
- Port: `[MYSQL_PORT de Railway]`
- User: `[MYSQL_USER de Railway]`
- Password: `[MYSQL_PASSWORD de Railway]`

### 1.3 Ejecutar Scripts de Base de Datos

Ejecuta estos scripts en orden:

```sql
-- 1. Crear tabla Users
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserCode VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Role VARCHAR(50) NOT NULL,
    Permissions JSON,
    ProfileImage LONGTEXT,
    ProfileImageUrl VARCHAR(500),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (Role),
    INDEX idx_active (IsActive)
);

-- 2. Crear tabla designs
CREATE TABLE designs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    `color 1` VARCHAR(100),
    `color 2` VARCHAR(100),
    `color 3` VARCHAR(100),
    `color 4` VARCHAR(100),
    `color 5` VARCHAR(100),
    `color 6` VARCHAR(100),
    `color 7` VARCHAR(100),
    `color 8` VARCHAR(100),
    `color 9` VARCHAR(100),
    `color 10` VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla maquinas
CREATE TABLE maquinas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NumeroMaquina INT NOT NULL,
    Articulo VARCHAR(50) NOT NULL,
    OtSap VARCHAR(50) NOT NULL,
    Cliente VARCHAR(200) NOT NULL,
    Referencia VARCHAR(100),
    Td VARCHAR(10),
    NumeroColores INT NOT NULL,
    Colores JSON NOT NULL,
    Kilos DECIMAL(10,2) NOT NULL,
    FechaTintaEnMaquina DATETIME NOT NULL,
    Sustrato VARCHAR(100) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'LISTO',
    Observaciones VARCHAR(1000),
    LastActionBy VARCHAR(100),
    CreatedBy INT,
    UpdatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (NumeroMaquina),
    INDEX idx_estado (Estado),
    INDEX idx_fecha (FechaTintaEnMaquina),
    INDEX idx_otsap (OtSap),
    INDEX idx_cliente (Cliente),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
);

-- 4. Crear tabla pedidos
CREATE TABLE pedidos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MachineNumber INT NOT NULL,
    NumeroPedido VARCHAR(50) NOT NULL UNIQUE,
    Articulo VARCHAR(50) NOT NULL,
    Cliente VARCHAR(200) NOT NULL,
    Descripcion VARCHAR(500),
    Cantidad DECIMAL(10,2) NOT NULL,
    Unidad VARCHAR(50) DEFAULT 'kg',
    Estado VARCHAR(20) DEFAULT 'PENDIENTE',
    FechaPedido DATETIME NOT NULL,
    Prioridad VARCHAR(20) DEFAULT 'NORMAL',
    Observaciones VARCHAR(1000),
    AsignadoA VARCHAR(100),
    CreatedBy INT,
    UpdatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero_pedido (NumeroPedido),
    INDEX idx_machine (MachineNumber),
    INDEX idx_estado (Estado),
    INDEX idx_fecha (FechaPedido),
    INDEX idx_prioridad (Prioridad),
    INDEX idx_machine_estado (MachineNumber, Estado),
    INDEX idx_cliente_estado (Cliente, Estado),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
);

-- 5. Crear tabla machine_programs
CREATE TABLE machine_programs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MachineNumber INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Articulo VARCHAR(50) NOT NULL,
    OtSap VARCHAR(50) NOT NULL UNIQUE,
    Cliente VARCHAR(200) NOT NULL,
    Referencia VARCHAR(500),
    Td VARCHAR(3),
    Colores JSON NOT NULL,
    Sustrato VARCHAR(200),
    Kilos DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'LISTO',
    FechaInicio DATETIME NOT NULL,
    Progreso INT DEFAULT 0,
    Observaciones VARCHAR(1000),
    LastActionBy VARCHAR(100),
    LastAction VARCHAR(200),
    OperatorName VARCHAR(100),
    CreatedBy INT,
    UpdatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_machine (MachineNumber),
    INDEX idx_estado (Estado),
    INDEX idx_fecha (FechaInicio),
    INDEX idx_otsap (OtSap),
    INDEX idx_machine_estado (MachineNumber, Estado),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
);

-- 6. Crear tabla Activities
CREATE TABLE Activities (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    UserCode VARCHAR(50),
    Action VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Module VARCHAR(100) NOT NULL,
    Details VARCHAR(1000),
    IpAddress VARCHAR(45),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (UserId),
    INDEX idx_module (Module),
    INDEX idx_timestamp (Timestamp),
    INDEX idx_user_timestamp (UserId, Timestamp),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 7. Crear tabla condicionunica
CREATE TABLE condicionunica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farticulo VARCHAR(50) NOT NULL,
    referencia VARCHAR(200) NOT NULL,
    estante VARCHAR(50) NOT NULL,
    numerocarpeta VARCHAR(50) NOT NULL,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_farticulo (farticulo),
    INDEX idx_estante (estante),
    INDEX idx_lastmodified (lastmodified DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Insertar usuario admin por defecto
INSERT INTO Users (UserCode, Password, FirstName, LastName, Role, IsActive)
VALUES ('admin', '$2a$11$YourHashedPasswordHere', 'Admin', 'System', 'Admin', TRUE);
```

---

## 🔧 Paso 2: Desplegar Backend (.NET)

### 2.1 Crear Servicio Backend

1. **En Railway Dashboard**
   - Click en "+ New"
   - Selecciona "GitHub Repo"
   - Conecta tu repositorio
   - Railway detectará automáticamente el proyecto

2. **Configurar Build**
   - Railway detectará el `Dockerfile.backend`
   - Si no, configura manualmente:
     - Build Command: `docker build -f Dockerfile.backend -t backend .`
     - Start Command: (automático con Dockerfile)

### 2.2 Configurar Variables de Entorno del Backend

En la pestaña "Variables" del servicio backend, agrega:

```bash
# Entorno
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# Base de Datos (usa las variables de tu MySQL de Railway)
ConnectionStrings__DefaultConnection=Server=${MYSQL_HOST};Port=${MYSQL_PORT};Database=${MYSQL_DATABASE};Uid=${MYSQL_USER};Pwd=${MYSQL_PASSWORD};

# JWT (genera una clave segura)
JWT_SECRET_KEY=tu-clave-super-secreta-minimo-32-caracteres-aqui
JWT_ISSUER=FlexoAPP
JWT_AUDIENCE=FlexoAPP-Users
JWT_EXPIRATION_MINUTES=60

# CORS (actualiza con tu dominio de frontend)
CORS_ORIGINS=https://tu-frontend.up.railway.app

# Logging
Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft.AspNetCore=Warning
```

**💡 Tip:** Railway permite usar variables de referencia con `${VARIABLE_NAME}`

### 2.3 Configurar Puerto

Railway asigna automáticamente el puerto, pero asegúrate de que tu backend escuche en el puerto correcto:

- En `Dockerfile.backend` ya está configurado: `EXPOSE 8080`
- Railway mapeará automáticamente este puerto

---

## 🎨 Paso 3: Desplegar Frontend (Angular)

### 3.1 Actualizar Configuración de Producción

Primero, actualiza el archivo de entorno de producción:

**Frontend/src/environments/environment.prod.ts**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.up.railway.app/api',
  hubUrl: 'https://tu-backend.up.railway.app/hubs'
};
```

### 3.2 Crear Servicio Frontend

1. **En Railway Dashboard**
   - Click en "+ New"
   - Selecciona "GitHub Repo" (mismo repositorio)
   - Railway creará otro servicio

2. **Configurar Build**
   - Railway detectará el `Dockerfile.frontend`
   - Si no, configura manualmente:
     - Build Command: `docker build -f Dockerfile.frontend -t frontend .`
     - Start Command: (automático con Dockerfile)

### 3.3 Configurar Variables de Entorno del Frontend

```bash
# API Backend (actualiza con tu URL de backend)
API_URL=https://tu-backend.up.railway.app/api
HUB_URL=https://tu-backend.up.railway.app/hubs
```

---

## 🔗 Paso 4: Conectar Backend y Frontend

### 4.1 Obtener URLs de Railway

Después del despliegue, Railway te dará URLs públicas:
- Backend: `https://tu-backend.up.railway.app`
- Frontend: `https://tu-frontend.up.railway.app`

### 4.2 Actualizar CORS en Backend

Vuelve a las variables del backend y actualiza:
```bash
CORS_ORIGINS=https://tu-frontend.up.railway.app
```

### 4.3 Actualizar API URL en Frontend

Si no lo hiciste antes, actualiza:
```bash
API_URL=https://tu-backend.up.railway.app/api
```

---

## ✅ Paso 5: Verificación y Pruebas

### 5.1 Verificar Backend

1. **Health Check**
   ```bash
   curl https://tu-backend.up.railway.app/health
   ```

2. **Swagger (si está habilitado)**
   ```
   https://tu-backend.up.railway.app/swagger
   ```

3. **Test Login**
   ```bash
   curl -X POST https://tu-backend.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"userCode":"admin","password":"admin123"}'
   ```

### 5.2 Verificar Frontend

1. **Abrir en navegador**
   ```
   https://tu-frontend.up.railway.app
   ```

2. **Verificar consola del navegador**
   - No debe haber errores de CORS
   - Las llamadas a la API deben funcionar

### 5.3 Verificar Base de Datos

```sql
-- Conectar a MySQL de Railway y verificar
SHOW TABLES;
SELECT COUNT(*) FROM Users;
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que las variables de MySQL estén correctas
2. Asegúrate de que el servicio MySQL esté corriendo
3. Revisa los logs del backend: `railway logs`

### Error: "CORS policy blocked"

**Solución:**
1. Verifica que `CORS_ORIGINS` incluya tu URL de frontend
2. Asegúrate de usar HTTPS (no HTTP)
3. Reinicia el servicio backend después de cambiar variables

### Error: "502 Bad Gateway"

**Solución:**
1. El backend puede estar iniciando, espera 1-2 minutos
2. Revisa los logs: `railway logs`
3. Verifica que el puerto 8080 esté expuesto en el Dockerfile

### Frontend muestra página en blanco

**Solución:**
1. Verifica que `API_URL` esté correcta
2. Abre la consola del navegador para ver errores
3. Verifica que el build de Angular se completó correctamente

### Error: "JWT token invalid"

**Solución:**
1. Verifica que `JWT_SECRET_KEY` sea la misma en todas las instancias
2. Asegúrate de que el token no haya expirado
3. Limpia el localStorage del navegador

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Backend
railway logs --service backend

# Frontend
railway logs --service frontend

# MySQL
railway logs --service mysql
```

### Métricas

Railway proporciona métricas automáticas:
- CPU usage
- Memory usage
- Network traffic
- Request count

Accede desde el dashboard de cada servicio.

---

## 💰 Costos Estimados

Railway ofrece:
- **Plan Hobby**: $5/mes + uso
- **Plan Pro**: $20/mes + uso

**Estimación para FlexoAPP:**
- MySQL: ~$5-10/mes
- Backend: ~$5-10/mes
- Frontend: ~$5/mes
- **Total**: ~$15-25/mes

---

## 🔄 Actualizaciones Futuras

### Desplegar Cambios

Railway se actualiza automáticamente cuando haces push a tu repositorio:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway detectará el cambio y redesplegar automáticamente.

### Rollback

Si algo sale mal:
1. Ve al dashboard de Railway
2. Click en "Deployments"
3. Selecciona un despliegue anterior
4. Click en "Redeploy"

---

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)

---

## ✅ Checklist Final

- [ ] Base de datos MySQL creada en Railway
- [ ] Todas las tablas creadas
- [ ] Usuario admin insertado
- [ ] Backend desplegado
- [ ] Variables de entorno del backend configuradas
- [ ] Frontend desplegado
- [ ] Variables de entorno del frontend configuradas
- [ ] CORS configurado correctamente
- [ ] URLs actualizadas en ambos servicios
- [ ] Login funciona correctamente
- [ ] API responde correctamente
- [ ] SignalR conecta correctamente

---

**¡Listo!** Tu aplicación FlexoAPP está desplegada en Railway 🎉

**URLs de tu aplicación:**
- Frontend: `https://tu-frontend.up.railway.app`
- Backend: `https://tu-backend.up.railway.app`
- Swagger: `https://tu-backend.up.railway.app/swagger`


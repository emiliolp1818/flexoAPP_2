# 🏗️ ARQUITECTURA COMPLETA - FlexoAPP

## 📊 Tablas y sus Componentes

### 1️⃣ USERS (Usuarios)

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/User.cs`

**Repository:**
- `backend/Repositories/IUserRepository.cs` (Interfaz)
- `backend/Repositories/UserRepository.cs` (Implementación)

**Services:**
- `backend/Services/IAuthService.cs` (Interfaz)
- `backend/Services/AuthService.cs` (Implementación)
- `backend/Services/IJwtService.cs` (Interfaz)
- `backend/Services/JwtService.cs` (Implementación)
- `backend/Services/IRefreshTokenService.cs` (Interfaz)
- `backend/Services/RefreshTokenService.cs` (Implementación)

**Controller:**
- `backend/Controllers/AuthController.cs`
- `backend/Controllers/UsersController.cs`

**Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/user.model.ts`

**Services:**
- `Frontend/src/app/core/services/auth.service.ts`
- `Frontend/src/app/core/services/user.service.ts`

**Components:**
- `Frontend/src/app/auth/login/` (Login)
- `Frontend/src/app/auth/register/` (Registro)

**Guards:**
- `Frontend/src/app/core/guards/auth.guard.ts`
- `Frontend/src/app/core/guards/role.guard.ts`

**Interceptors:**
- `Frontend/src/app/core/interceptors/auth.interceptor.ts`
- `Frontend/src/app/core/interceptors/jwt.interceptor.ts`

---

### 2️⃣ DESIGNS (Diseños)

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/Design.cs`

**Repository:**
- `backend/Repositories/IDesignRepository.cs` (Interfaz)
- `backend/Repositories/DesignRepository.cs` (Implementación)

**Services:**
- `backend/Services/IDesignService.cs` (Interfaz)
- `backend/Services/DesignService.cs` (Implementación)

**Controller:**
- `backend/Controllers/DesignsController.cs`

**Endpoints:**
```
GET    /api/designs
GET    /api/designs/{id}
POST   /api/designs
PUT    /api/designs/{id}
DELETE /api/designs/{id}
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/design.model.ts`

**Services:**
- `Frontend/src/app/shared/services/design.service.ts`

**Components:**
- `Frontend/src/app/shared/components/designs/` (Gestión de diseños)

---

### 3️⃣ MAQUINAS (Máquinas)

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/Maquina.cs`

**Repository:**
- `backend/Repositories/IMaquinaRepository.cs` (Interfaz)
- `backend/Repositories/MaquinaRepository.cs` (Implementación)

**Services:**
- `backend/Services/IMaquinaService.cs` (Interfaz)
- `backend/Services/MaquinaService.cs` (Implementación)

**Controller:**
- `backend/Controllers/MaquinasController.cs`

**Endpoints:**
```
GET    /api/maquinas
GET    /api/maquinas/{id}
GET    /api/maquinas/numero/{numero}
POST   /api/maquinas
PUT    /api/maquinas/{id}
DELETE /api/maquinas/{id}
PATCH  /api/maquinas/{id}/estado
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/maquina.model.ts`

**Services:**
- `Frontend/src/app/shared/services/maquina.service.ts`

**Components:**
- `Frontend/src/app/shared/components/machines/` (Gestión de máquinas)
  - `machines.component.ts`
  - `machines.component.html`
  - `machines.component.scss`

---

### 4️⃣ PEDIDOS (Pedidos)

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/Pedido.cs`

**Repository:**
- `backend/Repositories/IPedidoRepository.cs` (Interfaz)
- `backend/Repositories/PedidoRepository.cs` (Implementación)

**Services:**
- `backend/Services/IPedidoService.cs` (Interfaz)
- `backend/Services/PedidoService.cs` (Implementación)

**Controller:**
- `backend/Controllers/PedidosController.cs`

**Endpoints:**
```
GET    /api/pedidos
GET    /api/pedidos/{id}
GET    /api/pedidos/numero/{numeroPedido}
GET    /api/pedidos/maquina/{machineNumber}
POST   /api/pedidos
PUT    /api/pedidos/{id}
DELETE /api/pedidos/{id}
PATCH  /api/pedidos/{id}/estado
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/pedido.model.ts`

**Services:**
- `Frontend/src/app/shared/services/pedido.service.ts`

**Components:**
- `Frontend/src/app/shared/components/pedidos/` (Gestión de pedidos)

---

### 5️⃣ MACHINE_PROGRAMS (Programas de Máquina)

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/MachineProgram.cs`

**Repository:**
- `backend/Repositories/IMachineProgramRepository.cs` (Interfaz)
- `backend/Repositories/MachineProgramRepository.cs` (Implementación)

**Services:**
- `backend/Services/IMachineProgramService.cs` (Interfaz)
- `backend/Services/MachineProgramService.cs` (Implementación)

**Controller:**
- `backend/Controllers/MachineProgramsController.cs`

**Hubs (SignalR):**
- `backend/Hubs/MachineProgramHub.cs` (Tiempo real)

**Endpoints:**
```
GET    /api/machine-programs
GET    /api/machine-programs/{id}
GET    /api/machine-programs/maquina/{machineNumber}
POST   /api/machine-programs
PUT    /api/machine-programs/{id}
DELETE /api/machine-programs/{id}
PATCH  /api/machine-programs/{id}/estado
PATCH  /api/machine-programs/{id}/progreso
```

**SignalR:**
```
Hub: /hubs/machine-program
Events:
- ProgramCreated
- ProgramUpdated
- ProgramDeleted
- ProgressUpdated
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/machine-program.model.ts`

**Services:**
- `Frontend/src/app/shared/services/machine-program.service.ts`
- `Frontend/src/app/shared/services/signalr.service.ts` (Tiempo real)

**Components:**
- `Frontend/src/app/shared/components/machine-programs/` (Gestión de programas)

---

### 6️⃣ ACTIVITIES (Actividades/Auditoría)

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/Activity.cs`

**Repository:**
- `backend/Repositories/IActivityRepository.cs` (Interfaz)
- `backend/Repositories/ActivityRepository.cs` (Implementación)

**Services:**
- `backend/Services/IActivityService.cs` (Interfaz)
- `backend/Services/ActivityService.cs` (Implementación)
- `backend/Services/IAuditService.cs` (Interfaz)
- `backend/Services/AuditService.cs` (Implementación)
- `backend/Services/ActivityCleanupService.cs` (Limpieza automática)

**Controller:**
- `backend/Controllers/ActivitiesController.cs`

**Endpoints:**
```
GET    /api/activities
GET    /api/activities/{id}
GET    /api/activities/user/{userId}
GET    /api/activities/module/{module}
DELETE /api/activities/cleanup
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/activity.model.ts`

**Services:**
- `Frontend/src/app/shared/services/activity.service.ts`

**Components:**
- `Frontend/src/app/shared/components/activities/` (Registro de actividades)

---

### 7️⃣ CONDICIONUNICA (Condición Única) ⭐ NUEVO

#### 📋 Tabla MySQL
```sql
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
```

#### 🔧 Backend
**Entidad:**
- `backend/Models/Entities/CondicionUnica.cs`

**Repository:**
- `backend/Repositories/ICondicionUnicaRepository.cs` (Interfaz)
- `backend/Repositories/CondicionUnicaRepository.cs` (Implementación)

**Controller:**
- `backend/Controllers/CondicionUnicaController.cs`

**Endpoints:**
```
GET    /api/condicion-unica/test
GET    /api/condicion-unica
GET    /api/condicion-unica/{id}
GET    /api/condicion-unica/search?fArticulo={fArticulo}
POST   /api/condicion-unica
PUT    /api/condicion-unica/{id}
DELETE /api/condicion-unica/{id}
```

#### 🎨 Frontend
**Models:**
- `Frontend/src/app/shared/models/condicion-unica.model.ts`

**Services:**
- `Frontend/src/app/shared/services/condicion-unica.service.ts`

**Components:**
- `Frontend/src/app/shared/components/condicion-unica/`
  - `condicion-unica.component.ts`
  - `condicion-unica.component.html`
  - `condicion-unica.component.scss`

---

## 🔗 Relaciones entre Tablas

```
Users (1) ──────┬─────> (N) Maquinas (CreatedBy, UpdatedBy)
                │
                ├─────> (N) Pedidos (CreatedBy, UpdatedBy)
                │
                ├─────> (N) MachinePrograms (CreatedBy, UpdatedBy)
                │
                └─────> (N) Activities (UserId)

Designs (Independiente)

CondicionUnica (Independiente)
```

## 📦 Servicios Compartidos

### Backend
- `backend/Services/ICacheService.cs` - Cache en memoria
- `backend/Services/MemoryCacheService.cs` - Implementación de cache
- `backend/Services/IReportsService.cs` - Generación de reportes
- `backend/Services/ReportsService.cs` - Implementación de reportes
- `backend/Services/IMachineBackupService.cs` - Backups
- `backend/Services/MachineBackupService.cs` - Implementación de backups
- `backend/Services/RealTimeSyncService.cs` - Sincronización en tiempo real

### Frontend
- `Frontend/src/app/core/services/http.service.ts` - Cliente HTTP
- `Frontend/src/app/core/services/error-handler.service.ts` - Manejo de errores
- `Frontend/src/app/core/services/loading.service.ts` - Indicador de carga
- `Frontend/src/app/core/services/notification.service.ts` - Notificaciones
- `Frontend/src/app/core/services/network-stability.service.ts` - Estabilidad de red

## 🗂️ Estructura de Archivos

```
flexoAPP3/
├── backend/
│   ├── Controllers/          # 8 controladores
│   ├── Models/
│   │   ├── Entities/        # 7 entidades
│   │   └── DTOs/            # Data Transfer Objects
│   ├── Repositories/        # 7 repositorios (14 archivos)
│   ├── Services/            # 15+ servicios
│   ├── Hubs/                # SignalR hubs
│   ├── Data/
│   │   └── Context/         # DbContext
│   └── Database/Scripts/    # Scripts SQL
│
└── Frontend/
    └── src/app/
        ├── auth/            # Autenticación
        ├── core/
        │   ├── guards/      # Guards de ruta
        │   ├── interceptors/# HTTP interceptors
        │   └── services/    # Servicios core
        └── shared/
            ├── models/      # 7 modelos
            ├── services/    # 7 servicios
            └── components/  # 7 componentes
```

## 📊 Resumen

| Tabla | Backend Files | Frontend Files | Endpoints | Relaciones |
|-------|--------------|----------------|-----------|------------|
| Users | 8 | 6 | 7 | 4 FK |
| Designs | 5 | 3 | 5 | 0 |
| Maquinas | 5 | 3 | 7 | 2 FK |
| Pedidos | 5 | 3 | 7 | 2 FK |
| MachinePrograms | 6 | 4 | 8 | 2 FK |
| Activities | 6 | 3 | 5 | 1 FK |
| CondicionUnica | 4 | 3 | 7 | 0 |
| **TOTAL** | **39** | **25** | **46** | **11** |

---

**Última actualización:** 2025-11-10
**Base de datos:** flexoBD (MySQL)
**Versión:** 2.0.0

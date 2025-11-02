# 🚀 FlexoAPP Backend - Documentación Completa

## 📋 **INFORMACIÓN GENERAL**

**FlexoAPP Backend** es un sistema de gestión flexográfica desarrollado en **ASP.NET Core 8.0** con arquitectura moderna y escalable.

### **Características Principales**
- **Framework:** ASP.NET Core 8.0
- **Base de Datos:** MySQL con Entity Framework Core
- **Autenticación:** JWT Bearer Token
- **ORM:** Entity Framework Core + Pomelo MySQL
- **Documentación:** Swagger/OpenAPI
- **Tiempo Real:** SignalR
- **Importación/Exportación:** EPPlus (Excel)
- **Arquitectura:** Clean Architecture con Repository Pattern

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Estructura de Carpetas**
```
flexoAPP-backent/
├── Controllers/          # Controladores API REST
├── Services/            # Lógica de negocio
├── Repositories/        # Acceso a datos
├── Models/              # Modelos y DTOs
│   ├── Entities/        # Entidades de base de datos
│   ├── DTOs/           # Data Transfer Objects
│   └── Enums/          # Enumeraciones
├── Data/               # Contexto y configuración DB
├── Hubs/               # SignalR Hubs
├── Extensions/         # Extensiones y helpers
├── Migrations/         # Migraciones EF Core
└── Scripts/            # Scripts de base de datos
```

### **Patrón de Arquitectura**
- **Controllers:** Manejo de HTTP requests/responses
- **Services:** Lógica de negocio y validaciones
- **Repositories:** Acceso a datos y consultas
- **Models:** Definición de estructuras de datos
- **DTOs:** Transferencia de datos entre capas

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Dependencias Principales**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="AutoMapper" Version="12.0.1" />
<PackageReference Include="EPPlus" Version="7.0.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
```

### **Configuración de Base de Datos**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_db;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;"
  }
}
```

### **Configuración JWT**
```json
{
  "JwtSettings": {
    "SecretKey": "FlexoAPP-Super-Secret-Key-2024-Production-Ready",
    "Issuer": "FlexoAPP",
    "Audience": "FlexoAPP-Users",
    "ExpirationMinutes": 120,
    "RefreshTokenExpirationDays": 30
  }
}
```

---

## 🌐 **ENDPOINTS API**

### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### **Diseños**
- `GET /api/designs` - Obtener todos los diseños
- `GET /api/designs/{id}` - Obtener diseño por ID
- `POST /api/designs` - Crear nuevo diseño
- `PUT /api/designs/{id}` - Actualizar diseño
- `DELETE /api/designs/{id}` - Eliminar diseño
- `POST /api/designs/import/excel` - Importación masiva desde Excel
- `GET /api/designs/export/excel` - Exportar a Excel

### **Programación de Máquinas**
- `GET /api/machine-programs` - Obtener programaciones
- `POST /api/machine-programs` - Crear programación
- `PUT /api/machine-programs/{id}` - Actualizar programación
- `DELETE /api/machine-programs/{id}` - Eliminar programación

### **Pedidos**
- `GET /api/pedidos` - Obtener pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/{id}` - Actualizar pedido
- `DELETE /api/pedidos/{id}` - Eliminar pedido

### **Usuarios**
- `GET /api/users` - Obtener usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### **Actividades/Auditoría**
- `GET /api/activities` - Obtener log de actividades
- `GET /api/activities/user/{userId}` - Actividades por usuario

### **Reportes**
- `GET /api/reports/designs` - Reporte de diseños
- `GET /api/reports/production` - Reporte de producción
- `GET /api/reports/users` - Reporte de usuarios

### **Sistema**
- `GET /` - Información del sistema
- `GET /health` - Health check
- `GET /api/test` - Test de conectividad

---

## 🗄️ **MODELO DE DATOS**

### **Entidades Principales**

#### **Design (Diseño)**
```csharp
public class Design
{
    public int Id { get; set; }
    public string ArticleF { get; set; }
    public string Description { get; set; }
    public string Client { get; set; }
    public string Designer { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Status { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public int Colors { get; set; }
    public string Notes { get; set; }
}
```

#### **User (Usuario)**
```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastLogin { get; set; }
    public bool IsActive { get; set; }
}
```

#### **MachineProgram (Programación de Máquina)**
```csharp
public class MachineProgram
{
    public int Id { get; set; }
    public string MachineName { get; set; }
    public int DesignId { get; set; }
    public Design Design { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string Status { get; set; }
    public string Operator { get; set; }
    public string Notes { get; set; }
}
```

#### **Activity (Auditoría)**
```csharp
public class Activity
{
    public int Id { get; set; }
    public string Action { get; set; }
    public string EntityType { get; set; }
    public int EntityId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public DateTime Timestamp { get; set; }
    public string Details { get; set; }
}
```

---

## 🔐 **SEGURIDAD**

### **Autenticación JWT**
- **Algoritmo:** HS256
- **Duración:** 120 minutos
- **Refresh Token:** 30 días
- **Claims:** UserId, Username, Role

### **Autorización**
- **Roles:** Admin, User, Operator
- **Políticas:** Basadas en roles y recursos
- **Middleware:** JWT Bearer Authentication

### **Encriptación**
- **Contraseñas:** BCrypt con salt
- **Tokens:** HMAC SHA256
- **Comunicación:** HTTPS (recomendado en producción)

---

## 🚀 **INSTALACIÓN Y CONFIGURACIÓN**

### **Requisitos Previos**
- .NET 8.0 SDK
- MySQL Server 8.0+
- Visual Studio 2022 o VS Code

### **Pasos de Instalación**

1. **Clonar el repositorio**
```bash
git clone [repository-url]
cd flexoAPP-backent
```

2. **Restaurar dependencias**
```bash
dotnet restore
```

3. **Configurar base de datos**
```bash
# Crear base de datos en MySQL
CREATE DATABASE flexoapp_db;
```

4. **Configurar appsettings.json**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_db;Uid=root;Pwd=TU_PASSWORD;"
  }
}
```

5. **Ejecutar migraciones**
```bash
dotnet ef database update
```

6. **Compilar y ejecutar**
```bash
dotnet build
dotnet run
```

### **Scripts de Inicio Rápido**
- `start-backend.bat` - Iniciar backend
- `setup.bat` - Configuración inicial
- `test-dotnet-backend.bat` - Pruebas

---

## 🔄 **FUNCIONALIDADES AVANZADAS**

### **SignalR (Tiempo Real)**
- **Hub:** `/hubs/machine-programs`
- **Eventos:** Actualizaciones de programación en tiempo real
- **Clientes:** Frontend Angular conectado automáticamente

### **Importación/Exportación Excel**
- **Librería:** EPPlus 7.0
- **Formatos:** .xlsx, .xls
- **Validaciones:** Automáticas con mensajes de error
- **Plantillas:** Predefinidas para importación

### **Auditoría Completa**
- **Tracking:** Todas las operaciones CRUD
- **Información:** Usuario, timestamp, acción, detalles
- **Consultas:** Por usuario, fecha, entidad

### **AutoMapper**
- **Mapeo:** Entidades ↔ DTOs automático
- **Configuración:** Profiles personalizados
- **Validación:** Automática en tiempo de compilación

---

## 📊 **MONITOREO Y LOGS**

### **Health Checks**
- `GET /health` - Estado del sistema
- **Verificaciones:** Base de datos, servicios, memoria

### **Logging**
- **Framework:** Microsoft.Extensions.Logging
- **Niveles:** Information, Warning, Error
- **Destinos:** Console, File (configurable)

### **Métricas**
- **Performance:** Tiempo de respuesta
- **Uso:** Memoria, CPU
- **Errores:** Rate de errores por endpoint

---

## 🌐 **CORS Y NETWORKING**

### **Configuración CORS**
```csharp
// Orígenes permitidos
"http://localhost:4200",      // Angular Dev
"http://192.168.1.28:4200",  // Red local
"http://127.0.0.1:4200"      // Loopback
```

### **Configuración Kestrel**
- **Puerto:** 7003
- **Límites:** Headers 1MB, Body 250MB
- **Timeouts:** Keep-alive 5min, Headers 2min

---

## 🧪 **TESTING**

### **Endpoints de Prueba**
- `GET /api/test` - Test básico de conectividad
- `GET /health` - Health check completo
- `GET /` - Información del sistema

### **Datos de Prueba**
- **Usuario Admin:** admin / admin123
- **Base de datos:** Se inicializa automáticamente
- **Datos semilla:** Usuarios y roles básicos

---

## 🔧 **COMANDOS ÚTILES**

### **Desarrollo**
```bash
# Compilar
dotnet build

# Ejecutar
dotnet run

# Watch mode (desarrollo)
dotnet watch run

# Limpiar
dotnet clean
```

### **Base de Datos**
```bash
# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir migración
dotnet ef database update MigracionAnterior
```

### **Producción**
```bash
# Publicar
dotnet publish -c Release

# Ejecutar en producción
dotnet FlexoAPP.API.dll
```

---

## 📈 **RENDIMIENTO**

### **Optimizaciones Implementadas**
- **Entity Framework:** Lazy loading deshabilitado
- **Consultas:** Optimizadas con Include y Select
- **Caché:** En memoria para datos frecuentes
- **Compresión:** Response compression habilitada

### **Límites Configurados**
- **Request Body:** 250MB (para archivos Excel grandes)
- **Headers:** 1MB total
- **Timeout:** 5 minutos keep-alive
- **Conexiones:** Pool de conexiones DB optimizado

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Errores Comunes**

#### **Error de Conexión a Base de Datos**
```
Solution: Verificar MySQL está ejecutándose y credenciales en appsettings.json
```

#### **Error 431 (Headers too large)**
```
Solution: Ya configurado en Kestrel con límites aumentados
```

#### **Error JWT Invalid**
```
Solution: Verificar SecretKey en appsettings.json y sincronización de tiempo
```

#### **Error CORS**
```
Solution: Verificar origen en configuración CORS del Program.cs
```

### **Logs de Diagnóstico**
- **Ubicación:** Console output
- **Nivel:** Information por defecto
- **Configuración:** appsettings.json → Logging

---

## 📞 **INFORMACIÓN DE CONTACTO**

### **URLs del Sistema**
- **API Base:** http://localhost:7003
- **Swagger:** http://localhost:7003/swagger
- **Health Check:** http://localhost:7003/health

### **Credenciales por Defecto**
- **Usuario:** admin
- **Contraseña:** admin123
- **Rol:** Administrator

---

## 🔄 **CHANGELOG**

### **Versión 2.0.0 - Actual**
- ✅ Eliminado backend Node.js
- ✅ Optimizado ASP.NET Core 8.0
- ✅ Mejorada configuración JWT
- ✅ Actualizada documentación Swagger
- ✅ Limpieza de archivos obsoletos
- ✅ Configuración de producción lista

### **Características Eliminadas**
- ❌ Backend Node.js (puerto 3001)
- ❌ Archivos MD obsoletos
- ❌ Configuraciones duplicadas

### **Mejoras Implementadas**
- 🚀 Compilación más rápida
- 🔐 Seguridad mejorada
- 📚 Documentación completa
- 🧹 Código limpio y optimizado

---

## 📋 **CHECKLIST DE PRODUCCIÓN**

### **Antes de Desplegar**
- [ ] Cambiar SecretKey en appsettings.json
- [ ] Configurar conexión de base de datos de producción
- [ ] Habilitar HTTPS
- [ ] Configurar logging a archivos
- [ ] Verificar CORS para dominio de producción
- [ ] Ejecutar todas las migraciones
- [ ] Probar todos los endpoints críticos

### **Monitoreo Post-Despliegue**
- [ ] Verificar health checks
- [ ] Monitorear logs de errores
- [ ] Verificar performance de base de datos
- [ ] Confirmar autenticación JWT
- [ ] Probar importación/exportación Excel

---

**🎉 FlexoAPP Backend está listo para producción con ASP.NET Core 8.0**

*Documentación actualizada: $(Get-Date)*
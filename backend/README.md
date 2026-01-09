# 🚀 FlexoAPP Backend

API REST desarrollada en .NET 8 para el sistema de gestión flexográfica FlexoAPP.

## 📋 Descripción

Backend completo que proporciona servicios para la gestión de máquinas flexográficas, diseños, usuarios, pedidos y documentos. Incluye autenticación JWT, logging estructurado, y optimizaciones para producción.

## 🏗️ Arquitectura

```
backend/
├── Controllers/        # Controladores de API REST
├── Models/            # Entidades y DTOs
├── Services/          # Lógica de negocio
├── Repositories/      # Acceso a datos
├── Data/             # Contexto de Entity Framework
├── Database/         # Scripts SQL y migraciones
├── Attributes/       # Atributos personalizados
└── uploads/          # Archivos subidos
```

## 🛠️ Tecnologías

- **.NET 8.0** - Framework principal
- **Entity Framework Core** - ORM
- **MySQL** - Base de datos (Railway)
- **JWT Bearer** - Autenticación
- **Serilog** - Logging estructurado
- **AutoMapper** - Mapeo de objetos
- **Swagger/OpenAPI** - Documentación de API
- **SignalR** - Comunicación en tiempo real
- **MiniProfiler** - Profiling de rendimiento

## 🚀 Configuración de Desarrollo

### Prerrequisitos
- .NET 8.0 SDK
- MySQL Server (local o Railway)
- Visual Studio 2022 / VS Code

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd backend

# Restaurar paquetes
dotnet restore

# Configurar base de datos
# Editar appsettings.json con tu connection string

# Ejecutar migraciones (opcional)
dotnet ef database update

# Ejecutar aplicación
dotnet run
```

### Variables de Entorno (Desarrollo)
```bash
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection="Server=localhost;Database=flexoapp_bd;User=root;Password=12345;"
```

## 🌐 Configuración de Producción (Render/Railway)

### Variables de Entorno Requeridas
```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=***;SslMode=Required;"
DATABASE_URL="mysql://root:***@hopper.proxy.rlwy.net:43791/railway"
JWT_SECRET_KEY="FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable"
FRONTEND_URL="https://frontend-f54v.onrender.com"
PORT=8080
```

### Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY . .
EXPOSE 8080
ENTRYPOINT ["dotnet", "flexoAPP.dll"]
```

## 📡 API Endpoints

### 🔐 Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### 👥 Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### 🎨 Diseños
- `GET /api/designs` - Listar diseños
- `POST /api/designs` - Crear diseño
- `PUT /api/designs/{id}` - Actualizar diseño
- `DELETE /api/designs/{id}` - Eliminar diseño

### 🏭 Máquinas
- `GET /api/maquinas` - Listar programas de máquinas
- `POST /api/maquinas` - Crear programa
- `PUT /api/maquinas/{otSap}` - Actualizar programa
- `DELETE /api/maquinas/{otSap}` - Eliminar programa

### 📦 Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/{id}` - Actualizar pedido
- `DELETE /api/pedidos/{id}` - Eliminar pedido

### 📄 Documentos
- `GET /api/documentos` - Listar documentos
- `POST /api/documentos` - Subir documento
- `GET /api/documentos/{id}/download` - Descargar documento
- `DELETE /api/documentos/{id}` - Eliminar documento

### 📊 Reportes
- `GET /api/reports/dashboard` - Datos del dashboard
- `GET /api/reports/activities` - Reporte de actividades
- `GET /api/reports/machines` - Reporte de máquinas

### 🏥 Health Checks
- `GET /health` - Estado general del sistema
- `GET /health/ready` - Listo para recibir tráfico
- `GET /health/live` - Aplicación está viva

## 🔧 Configuración

### appsettings.json (Desarrollo)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_bd;User=root;Password=12345;"
  },
  "JwtSettings": {
    "SecretKey": "FlexoAPP-Super-Secret-Key-2024",
    "Issuer": "FlexoAPP",
    "Audience": "FlexoAPP-Users",
    "ExpirationMinutes": 1440
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### appsettings.Production.json (Producción)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=***;SslMode=Required;"
  },
  "Urls": "http://0.0.0.0:8080"
}
```

## 🔐 Seguridad

### Autenticación JWT
- **Algoritmo**: HS256
- **Expiración**: 24 horas (configurable)
- **Refresh Tokens**: 90 días
- **Auto-refresh**: 60 minutos antes de expirar

### CORS
```csharp
// Configurado para dominios específicos
.WithOrigins(
    "https://flexoapp-backend.onrender.com",
    "https://frontend-f54v.onrender.com"
)
```

### Validaciones
- **Input Validation**: Data Annotations
- **Authorization**: Role-based y Permission-based
- **SQL Injection**: Entity Framework protege automáticamente
- **XSS**: Sanitización de inputs

## 📊 Logging y Monitoreo

### Serilog
```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/flexoapp-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
```

### Métricas Disponibles
- Tiempo de respuesta de endpoints
- Número de requests por minuto
- Errores y excepciones
- Uso de memoria y CPU
- Conexiones activas a BD

### MiniProfiler
- Disponible en `/profiler`
- Solo habilitado en desarrollo
- Análisis de consultas SQL
- Tiempo de ejecución de métodos

## 🗄️ Base de Datos

### Entidades Principales
- **User** - Usuarios del sistema
- **Activity** - Log de actividades
- **Design** - Diseños flexográficos
- **Maquina** - Programas de máquinas
- **Pedido** - Pedidos de producción
- **CondicionUnica** - Condiciones únicas
- **Documento** - Documentos del sistema

### Migraciones
```bash
# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir migración
dotnet ef database update MigracionAnterior
```

## 🚀 Despliegue

### Render
1. Conectar repositorio GitHub
2. Seleccionar rama `render`
3. Configurar variables de entorno
4. Usar Dockerfile para build

### Railway
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático desde Git

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
dotnet test

# Tests específicos
dotnet test --filter "Category=Unit"
dotnet test --filter "Category=Integration"
```

### Coverage
```bash
# Generar reporte de cobertura
dotnet test --collect:"XPlat Code Coverage"
```

## 📈 Performance

### Optimizaciones Implementadas
- **Connection Pooling** - Reutilización de conexiones
- **Response Compression** - Gzip + Brotli
- **Memory Caching** - Cache en memoria para datos frecuentes
- **Async/Await** - Operaciones asíncronas
- **Lazy Loading** - Carga diferida de entidades relacionadas

### Benchmarks
- **Startup Time**: ~3-5 segundos
- **Memory Usage**: ~50-100 MB
- **Response Time**: <200ms (promedio)
- **Throughput**: 1000+ requests/segundo

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de conexión a BD
```bash
# Verificar connection string
# Verificar que MySQL esté ejecutándose
# Verificar permisos de usuario
```

#### Error de CORS
```bash
# Verificar configuración de CORS en Program.cs
# Verificar que el frontend esté en la lista de orígenes permitidos
```

#### Error de JWT
```bash
# Verificar que JWT_SECRET_KEY esté configurado
# Verificar que el token no haya expirado
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en `logs/flexoapp-*.log`
2. Verificar health checks en `/health`
3. Revisar documentación de API en `/swagger`

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2026  
**Entorno**: Render + Railway MySQL
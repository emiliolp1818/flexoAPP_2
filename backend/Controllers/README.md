# 🎮 Controllers - FlexoAPP Backend

Esta carpeta contiene todos los controladores de la API REST que manejan las peticiones HTTP y coordinan las respuestas.

## 📁 Estructura de Controladores

### 🔐 Autenticación y Usuarios
- **`AuthController.cs`** - Login, logout, refresh tokens
- **`UsersController.cs`** - CRUD de usuarios
- **`PermissionsController.cs`** - Gestión de permisos

### 🏭 Gestión de Producción
- **`MaquinasController.cs`** - Máquinas flexográficas y programas
- **`DesignsController.cs`** - Diseños flexográficos
- **`CondicionUnicaController.cs`** - Condiciones únicas de artículos

### 📊 Reportes y Dashboard
- **`DashboardController.cs`** - Métricas y datos del dashboard
- **`ReportsController.cs`** - Generación de reportes
- **`ActivitiesController.cs`** - Log de actividades del sistema

### 📄 Gestión Documental
- **`DocumentosController.cs`** - Subida, descarga y gestión de documentos

### 🔧 Sistema
- **`SystemConfigController.cs`** - Configuración del sistema
- **`MachineBackupController.cs`** - Backup de configuraciones de máquinas

## 🎯 Características Comunes

### Autenticación
Todos los controladores (excepto AuthController) requieren autenticación JWT:
```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MaquinasController : ControllerBase
```

### Validación de Modelos
Validación automática usando Data Annotations:
```csharp
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMaquinaDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
    // ...
}
```

### Manejo de Errores
Respuestas consistentes para errores:
```csharp
try
{
    // Lógica del controlador
}
catch (NotFoundException ex)
{
    return NotFound(ex.Message);
}
catch (ValidationException ex)
{
    return BadRequest(ex.Message);
}
```

### Logging
Logging estructurado en todos los controladores:
```csharp
private readonly ILogger<MaquinasController> _logger;

[HttpGet]
public async Task<IActionResult> GetAll()
{
    _logger.LogInformation("Obteniendo lista de máquinas");
    // ...
}
```

## 📋 Endpoints por Controlador

### AuthController
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### MaquinasController
- `GET /api/maquinas` - Listar máquinas
- `GET /api/maquinas/{otSap}` - Obtener máquina específica
- `POST /api/maquinas` - Crear programa de máquina
- `PUT /api/maquinas/{otSap}` - Actualizar programa
- `DELETE /api/maquinas/{otSap}` - Eliminar programa
- `PATCH /api/maquinas/{otSap}/estado` - Cambiar estado

### DesignsController
- `GET /api/designs` - Listar diseños
- `GET /api/designs/{id}` - Obtener diseño específico
- `POST /api/designs` - Crear diseño
- `PUT /api/designs/{id}` - Actualizar diseño
- `DELETE /api/designs/{id}` - Eliminar diseño
- `POST /api/designs/{id}/duplicate` - Duplicar diseño

### DocumentosController
- `GET /api/documentos` - Listar documentos
- `POST /api/documentos/upload` - Subir documento
- `GET /api/documentos/{id}/download` - Descargar documento
- `GET /api/documentos/{id}/view` - Visualizar documento
- `DELETE /api/documentos/{id}` - Eliminar documento

## 🔧 Patrones Implementados

### Repository Pattern
Los controladores no acceden directamente a la base de datos:
```csharp
public class MaquinasController : ControllerBase
{
    private readonly IMaquinaService _maquinaService;
    
    public MaquinasController(IMaquinaService maquinaService)
    {
        _maquinaService = maquinaService;
    }
}
```

### DTO Pattern
Uso de DTOs para transferencia de datos:
```csharp
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMaquinaDto dto)
{
    var maquina = await _maquinaService.CreateAsync(dto);
    return CreatedAtAction(nameof(GetById), new { otSap = maquina.OtSap }, maquina);
}
```

### Action Filters
Filtros personalizados para funcionalidades transversales:
```csharp
[RequirePermission("MACHINES_WRITE")]
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMaquinaDto dto)
```

## 📊 Códigos de Respuesta HTTP

### Éxito
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado
- `204 No Content` - Operación exitosa sin contenido

### Errores del Cliente
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto de datos

### Errores del Servidor
- `500 Internal Server Error` - Error interno
- `503 Service Unavailable` - Servicio no disponible

## 🔐 Autorización

### Roles
```csharp
[Authorize(Roles = "Admin,Supervisor")]
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
```

### Permisos Personalizados
```csharp
[RequirePermission("DESIGNS_DELETE")]
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
```

### Validación de Propietario
```csharp
// Solo el creador o admin puede modificar
var maquina = await _maquinaService.GetByIdAsync(otSap);
if (maquina.CreatedBy != currentUserId && !User.IsInRole("Admin"))
    return Forbid();
```

## 📝 Documentación API

### Swagger Annotations
```csharp
/// <summary>
/// Obtiene la lista de todas las máquinas flexográficas
/// </summary>
/// <returns>Lista de máquinas con sus programas activos</returns>
/// <response code="200">Lista obtenida exitosamente</response>
/// <response code="401">Usuario no autenticado</response>
[HttpGet]
[ProducesResponseType(typeof(IEnumerable<MaquinaDto>), 200)]
[ProducesResponseType(401)]
public async Task<IActionResult> GetAll()
```

### Ejemplos de Respuesta
```csharp
/// <example>
/// {
///   "otSap": "OT001",
///   "articulo": "F204567",
///   "numeroMaquina": 11,
///   "cliente": "CLIENTE EJEMPLO S.A.",
///   "estado": "CORRIENDO"
/// }
/// </example>
```

## 🧪 Testing

### Unit Tests
Cada controlador debe tener tests unitarios:
```csharp
[Test]
public async Task GetAll_ReturnsOkResult_WithListOfMaquinas()
{
    // Arrange
    var mockService = new Mock<IMaquinaService>();
    var controller = new MaquinasController(mockService.Object);
    
    // Act
    var result = await controller.GetAll();
    
    // Assert
    Assert.IsInstanceOf<OkObjectResult>(result);
}
```

### Integration Tests
Tests de integración para flujos completos:
```csharp
[Test]
public async Task CreateMaquina_WithValidData_ReturnsCreated()
{
    // Test completo con base de datos en memoria
}
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error 401 Unauthorized
- Verificar que el token JWT esté presente
- Verificar que el token no haya expirado
- Verificar configuración de JWT en Program.cs

#### Error 400 Bad Request
- Verificar validaciones del modelo
- Verificar que los datos JSON sean válidos
- Revisar ModelState.Errors

#### Error 500 Internal Server Error
- Revisar logs de Serilog
- Verificar conexión a base de datos
- Verificar configuración de servicios

### Debugging
```csharp
// Agregar breakpoints en:
// 1. Inicio del método del controlador
// 2. Llamadas a servicios
// 3. Manejo de excepciones
// 4. Return statements
```
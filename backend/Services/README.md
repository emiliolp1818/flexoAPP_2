# ⚙️ Services - FlexoAPP Backend

Esta carpeta contiene todos los servicios que implementan la lógica de negocio de la aplicación.

## 📁 Estructura de Servicios

### 🔐 Autenticación y Seguridad
- **`AuthService.cs`** - Lógica de autenticación y autorización
- **`JwtService.cs`** - Generación y validación de tokens JWT
- **`RefreshTokenService.cs`** - Gestión de refresh tokens

### 🏭 Lógica de Negocio
- **`MaquinaService.cs`** - Gestión de máquinas flexográficas
- **`PedidoService.cs`** - Gestión de pedidos de producción
- **`DesignService.cs`** - Gestión de diseños flexográficos
- **`ActivityService.cs`** - Gestión de actividades del sistema

### 📊 Reportes y Analytics
- **`ReportsService.cs`** - Generación de reportes
- **`ActivityLoggerService.cs`** - Logging de actividades de usuario

### 🔧 Servicios de Infraestructura
- **`AuditService.cs`** - Auditoría de cambios
- **`MemoryCacheService.cs`** - Cache en memoria
- **`PdfConversionService.cs`** - Conversión de documentos a PDF
- **`ActivityCleanupService.cs`** - Limpieza automática de logs

### 🛠️ Servicios de Soporte
- **`IMachineBackupService.cs`** - Backup de configuraciones (interfaz)

## 🎯 Patrón de Arquitectura

### Inyección de Dependencias
Todos los servicios se registran en el contenedor DI:
```csharp
// Program.cs
builder.Services.AddScoped<IMaquinaService, MaquinaService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
```

### Interfaces
Cada servicio implementa una interfaz para facilitar testing:
```csharp
public interface IMaquinaService
{
    Task<IEnumerable<MaquinaDto>> GetAllAsync();
    Task<MaquinaDto> GetByIdAsync(string otSap);
    Task<MaquinaDto> CreateAsync(CreateMaquinaDto dto);
    Task<MaquinaDto> UpdateAsync(string otSap, UpdateMaquinaDto dto);
    Task DeleteAsync(string otSap);
}
```

### Separación de Responsabilidades
- **Controllers**: Manejo de HTTP y validación
- **Services**: Lógica de negocio
- **Repositories**: Acceso a datos
- **Models**: Entidades y DTOs

## 🔐 AuthService

### Funcionalidades
```csharp
public class AuthService : IAuthService
{
    // Autenticación de usuarios
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    
    // Validación de credenciales
    Task<User> ValidateUserAsync(string userCode, string password);
    
    // Gestión de refresh tokens
    Task<string> RefreshTokenAsync(string refreshToken);
    
    // Logout y revocación de tokens
    Task LogoutAsync(string refreshToken);
}
```

### Características
- Hash de contraseñas con BCrypt
- Validación de credenciales
- Generación de tokens JWT
- Gestión de refresh tokens
- Logging de intentos de login

## 🏭 MaquinaService

### Funcionalidades
```csharp
public class MaquinaService : IMaquinaService
{
    // CRUD básico
    Task<IEnumerable<MaquinaDto>> GetAllAsync();
    Task<MaquinaDto> GetByIdAsync(string otSap);
    Task<MaquinaDto> CreateAsync(CreateMaquinaDto dto);
    Task<MaquinaDto> UpdateAsync(string otSap, UpdateMaquinaDto dto);
    Task DeleteAsync(string otSap);
    
    // Operaciones específicas
    Task<MaquinaDto> UpdateEstadoAsync(string otSap, string nuevoEstado);
    Task<IEnumerable<MaquinaDto>> GetByMachineNumberAsync(int numeroMaquina);
    Task<IEnumerable<MaquinaDto>> GetByEstadoAsync(string estado);
}
```

### Validaciones de Negocio
- Validación de números de máquina (11-21)
- Validación de estados válidos
- Validación de OT SAP únicos
- Validación de colores (máximo 10)
- Validación de kilos positivos

## 🎨 DesignService

### Funcionalidades
```csharp
public class DesignService : IDesignService
{
    // Gestión de diseños
    Task<IEnumerable<DesignDto>> GetAllAsync();
    Task<DesignDto> CreateAsync(CreateDesignDto dto);
    Task<DesignDto> UpdateAsync(int id, UpdateDesignDto dto);
    Task DeleteAsync(int id);
    
    // Operaciones especiales
    Task<DesignDto> DuplicateAsync(int id, string newArticleF);
    Task<IEnumerable<DesignDto>> SearchAsync(string searchTerm);
    Task<IEnumerable<DesignDto>> GetByClientAsync(string client);
}
```

### Características
- Gestión de hasta 10 colores por diseño
- Duplicación de diseños existentes
- Búsqueda por múltiples criterios
- Validación de datos de diseño

## 📊 ReportsService

### Funcionalidades
```csharp
public class ReportsService : IReportsService
{
    // Reportes de dashboard
    Task<DashboardDataDto> GetDashboardDataAsync();
    
    // Reportes de actividades
    Task<ActivityReportDto> GetActivityReportAsync(ActivityFilterDto filter);
    
    // Reportes de máquinas
    Task<MachineReportDto> GetMachineReportAsync(MachineFilterDto filter);
    
    // Exportación
    Task<byte[]> ExportToPdfAsync(ReportType type, object parameters);
    Task<byte[]> ExportToExcelAsync(ReportType type, object parameters);
}
```

### Tipos de Reportes
- Dashboard con métricas en tiempo real
- Actividades de usuarios por período
- Estado de máquinas por rango de fechas
- Producción por cliente/artículo
- Exportación a PDF y Excel

## 🔧 Servicios de Infraestructura

### MemoryCacheService
```csharp
public class MemoryCacheService : ICacheService
{
    Task<T> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key);
    Task RemoveByPatternAsync(string pattern);
}
```

### AuditService
```csharp
public class AuditService : IAuditService
{
    Task LogActivityAsync(string action, string description, string module, object details = null);
    Task LogUserActivityAsync(int userId, string action, string description);
    Task LogSystemActivityAsync(string action, string description);
}
```

### ActivityLoggerService
```csharp
public class ActivityLoggerService : IActivityLoggerService
{
    Task LogAsync(ActivityLogDto activityLog);
    Task LogUserActionAsync(int userId, string action, string module, string description);
    Task LogSystemActionAsync(string action, string module, string description);
}
```

## 🔄 Manejo de Transacciones

### Transacciones Automáticas
```csharp
[Transaction]
public async Task<MaquinaDto> CreateAsync(CreateMaquinaDto dto)
{
    // Operaciones que requieren transacción
    var maquina = await _repository.CreateAsync(entity);
    await _auditService.LogActivityAsync("CREATE_MAQUINA", $"Creada máquina {dto.OtSap}");
    return _mapper.Map<MaquinaDto>(maquina);
}
```

### Transacciones Manuales
```csharp
public async Task<bool> ProcessBatchAsync(IEnumerable<CreateMaquinaDto> dtos)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        foreach (var dto in dtos)
        {
            await CreateAsync(dto);
        }
        await transaction.CommitAsync();
        return true;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## 🔍 Validaciones

### Validaciones de Negocio
```csharp
public async Task<MaquinaDto> CreateAsync(CreateMaquinaDto dto)
{
    // Validar que OT SAP no exista
    if (await _repository.ExistsAsync(dto.OtSap))
        throw new ValidationException($"OT SAP {dto.OtSap} ya existe");
    
    // Validar número de máquina
    if (dto.NumeroMaquina < 11 || dto.NumeroMaquina > 21)
        throw new ValidationException("Número de máquina debe estar entre 11 y 21");
    
    // Continuar con la creación...
}
```

### Validaciones de Autorización
```csharp
public async Task DeleteAsync(string otSap)
{
    var maquina = await _repository.GetByIdAsync(otSap);
    if (maquina == null)
        throw new NotFoundException($"Máquina {otSap} no encontrada");
    
    // Solo el creador o admin puede eliminar
    if (maquina.CreatedBy != _currentUser.Id && !_currentUser.IsAdmin)
        throw new UnauthorizedException("No tiene permisos para eliminar esta máquina");
    
    await _repository.DeleteAsync(otSap);
}
```

## 📊 Logging y Monitoreo

### Logging Estructurado
```csharp
public class MaquinaService : IMaquinaService
{
    private readonly ILogger<MaquinaService> _logger;
    
    public async Task<MaquinaDto> CreateAsync(CreateMaquinaDto dto)
    {
        _logger.LogInformation("Creando máquina {OtSap} para máquina {NumeroMaquina}", 
            dto.OtSap, dto.NumeroMaquina);
        
        try
        {
            var result = await _repository.CreateAsync(entity);
            _logger.LogInformation("Máquina {OtSap} creada exitosamente", dto.OtSap);
            return _mapper.Map<MaquinaDto>(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creando máquina {OtSap}", dto.OtSap);
            throw;
        }
    }
}
```

### Métricas de Performance
```csharp
public async Task<IEnumerable<MaquinaDto>> GetAllAsync()
{
    using var activity = _activitySource.StartActivity("MaquinaService.GetAll");
    var stopwatch = Stopwatch.StartNew();
    
    try
    {
        var result = await _repository.GetAllAsync();
        activity?.SetTag("count", result.Count());
        return _mapper.Map<IEnumerable<MaquinaDto>>(result);
    }
    finally
    {
        _logger.LogInformation("GetAllAsync completado en {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
    }
}
```

## 🧪 Testing

### Unit Tests
```csharp
[Test]
public async Task CreateAsync_WithValidDto_ReturnsCreatedMaquina()
{
    // Arrange
    var dto = new CreateMaquinaDto { OtSap = "OT001", NumeroMaquina = 11 };
    var mockRepo = new Mock<IMaquinaRepository>();
    var service = new MaquinaService(mockRepo.Object, _mapper, _logger);
    
    // Act
    var result = await service.CreateAsync(dto);
    
    // Assert
    Assert.NotNull(result);
    Assert.AreEqual("OT001", result.OtSap);
}
```

### Integration Tests
```csharp
[Test]
public async Task CreateAsync_WithDatabase_PersistsCorrectly()
{
    // Test con base de datos en memoria
    using var context = CreateInMemoryContext();
    var service = new MaquinaService(new MaquinaRepository(context), _mapper, _logger);
    
    var dto = new CreateMaquinaDto { OtSap = "OT001", NumeroMaquina = 11 };
    var result = await service.CreateAsync(dto);
    
    var persisted = await context.Maquinas.FindAsync("OT001");
    Assert.NotNull(persisted);
}
```

## 🔧 Configuración

### Registro en DI Container
```csharp
// Program.cs
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IMaquinaService, MaquinaService>();
builder.Services.AddScoped<IDesignService, DesignService>();
builder.Services.AddScoped<IReportsService, ReportsService>();
builder.Services.AddScoped<ICacheService, MemoryCacheService>();
builder.Services.AddScoped<IAuditService, AuditService>();
```

### Configuración de AutoMapper
```csharp
// Profiles/MappingProfile.cs
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Maquina, MaquinaDto>();
        CreateMap<CreateMaquinaDto, Maquina>();
        CreateMap<UpdateMaquinaDto, Maquina>();
    }
}
```
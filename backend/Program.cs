using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FlexoAPP.API.Services;
using FlexoAPP.API.Repositories;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Data;
using flexoAPP.Services;
using flexoAPP.Repositories;

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine("🚀 Iniciando FlexoAPP Backend - ASP.NET Core 8.0");

// ===== KESTREL CONFIGURATION =====
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestHeadersTotalSize = 1048576; // 1MB
    options.Limits.MaxRequestHeaderCount = 1000;
    options.Limits.MaxRequestLineSize = 131072; // 128KB
    options.Limits.MaxRequestBufferSize = 20971520; // 20MB
    options.Limits.MaxRequestBodySize = 262144000; // 250MB
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(5);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(2);
});

// Las URLs se configuran mediante ASPNETCORE_URLS

// ===== CORS CONFIGURATION =====
builder.Services.AddCors(options => 
{ 
    options.AddDefaultPolicy(policy => 
    { 
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            
            // Allow localhost
            if (origin.StartsWith("http://localhost") || origin.StartsWith("http://127.0.0.1"))
                return true;
            
            // Allow local network (192.168.x.x)
            if (origin.StartsWith("http://192.168."))
                return true;
            
            // Allow specific development origins
            var allowedOrigins = new[]
            {
                "http://localhost:4200",
                "http://localhost:7003",
                "http://127.0.0.1:4200",
                "http://127.0.0.1:7003"
            };
            
            return allowedOrigins.Contains(origin);
        })
        .AllowAnyMethod() 
        .AllowAnyHeader()
        .AllowCredentials()
        .SetPreflightMaxAge(TimeSpan.FromSeconds(86400))
        .WithExposedHeaders("*");
    }); 
});

// ===== API CONFIGURATION =====
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer(); 

// ===== SWAGGER CONFIGURATION =====
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "FlexoAPP API", 
        Version = "v1",
        Description = "Sistema de Gestión Flexográfica - API REST"
    });
    
    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// ===== SIGNALR CONFIGURATION =====
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromMinutes(1);
    options.ClientTimeoutInterval = TimeSpan.FromMinutes(5);
    options.HandshakeTimeout = TimeSpan.FromMinutes(1);
    options.MaximumReceiveMessageSize = 1024 * 1024; // 1MB
});

// ===== JWT AUTHENTICATION =====
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "FlexoAPP-Super-Secret-Key-2024-Production-Ready";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "FlexoAPP",
            ValidAudience = jwtSettings["Audience"] ?? "FlexoAPP-Users",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.FromMinutes(5), // Tolerancia de 5 minutos
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };
        
        // Configuración para SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ===== DATABASE CONFIGURATION =====
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FlexoAPPDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    });
    options.EnableSensitiveDataLogging(false);
    options.EnableServiceProviderCaching();
    options.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.RowLimitingOperationWithoutOrderByWarning));
    options.EnableDetailedErrors(false);
});

// ===== HEALTH CHECKS =====
builder.Services.AddHealthChecks()
    .AddDbContextCheck<FlexoAPPDbContext>("database")
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

// ===== MEMORY CACHE =====
builder.Services.AddMemoryCache(options =>
{
    options.SizeLimit = 1024 * 1024 * 100; // 100MB
    options.CompactionPercentage = 0.25;
    options.ExpirationScanFrequency = TimeSpan.FromMinutes(5);
});

// ===== AUTOMAPPER CONFIGURATION =====
builder.Services.AddAutoMapper(typeof(Program));

// ===== DEPENDENCY INJECTION =====
// Authentication & Authorization
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();

// Business Services
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<flexoAPP.Repositories.IMachineProgramRepository, flexoAPP.Repositories.MachineProgramRepository>();
builder.Services.AddScoped<flexoAPP.Services.IMachineProgramService, flexoAPP.Services.MachineProgramService>();
builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<IDesignRepository, DesignRepository>();
builder.Services.AddScoped<IDesignService, DesignService>();

// Reports & Backup Services
builder.Services.AddScoped<IReportsService, ReportsService>();
builder.Services.AddScoped<IMachineBackupService, MachineBackupService>();

// Automatic Backup Service (Background Service)
builder.Services.AddAutomaticBackupService();

// Audit & Logging
builder.Services.AddScoped<FlexoAPP.API.Services.IAuditService, FlexoAPP.API.Services.AuditService>();

// HTTP Context
builder.Services.AddHttpContextAccessor();

Console.WriteLine("✅ Servicios configurados correctamente");

var app = builder.Build();

Console.WriteLine("🔧 Configurando middleware...");

// Initialize database with seed data
try 
{
    await FlexoAPP.API.Data.SeedData.InitializeAsync(app.Services);
    await FlexoAPP.API.Data.MachineProgramTableInitializer.InitializeAsync(app.Services);
    Console.WriteLine("✅ Base de datos inicializada");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Warning: Could not initialize seed data: {ex.Message}");
}

// CORS middleware
app.Use(async (context, next) =>
{
    context.Response.Headers["Access-Control-Allow-Origin"] = "*";
    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    context.Response.Headers["Access-Control-Allow-Headers"] = "*";
    context.Response.Headers["Access-Control-Max-Age"] = "86400";
    
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        return;
    }
    
    await next();
});

app.UseCors();

if (app.Environment.IsDevelopment()) 
{ 
    app.UseSwagger(); 
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlexoAPP API v1");
        c.RoutePrefix = "swagger";
    }); 
} 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR Hub
app.MapHub<flexoAPP.Hubs.MachineProgramHub>("/hubs/machine-programs"); 

// Health Check Endpoints
app.MapGet("/", () => new { 
    message = "FlexoAPP API - Sistema de Gestión Flexográfica", 
    status = "running", 
    timestamp = DateTime.UtcNow,
    version = "2.0.0",
    framework = ".NET 8.0",
    login = "admin / admin123", 
    endpoints = new[] { 
        "/api/auth/login", 
        "/api/auth/me", 
        "/api/designs",
        "/api/machine-programs",
        "/api/pedidos",
        "/health", 
        "/swagger" 
    } 
}); 

// Health Checks endpoint
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString().ToLower(),
            timestamp = DateTime.UtcNow,
            message = "FlexoAPP API Health Check",
            database = report.Entries.ContainsKey("database") ? 
                      (report.Entries["database"].Status == Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy ? "Connected" : "Disconnected") : 
                      "Unknown",
            authentication = "JWT Enabled",
            uptime = DateTime.UtcNow.Subtract(System.Diagnostics.Process.GetCurrentProcess().StartTime).ToString(@"dd\.hh\:mm\:ss"),
            checks = report.Entries.ToDictionary(
                kvp => kvp.Key,
                kvp => new { 
                    status = kvp.Value.Status.ToString().ToLower(),
                    description = kvp.Value.Description,
                    duration = kvp.Value.Duration.TotalMilliseconds
                }
            )
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
});

// Endpoint de health simple para compatibilidad
app.MapGet("/health-simple", () => new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow, 
    message = "FlexoAPP API is running",
    database = "Connected",
    authentication = "JWT Enabled"
});

app.MapGet("/api/test", () => new { 
    status = "API working", 
    timestamp = DateTime.UtcNow, 
    message = "API endpoint accessible",
    cors = "enabled",
    version = "2.0.0"
});

Console.WriteLine("========================================="); 
Console.WriteLine("    🚀 FLEXOAPP API - SISTEMA LISTO"); 
Console.WriteLine("========================================="); 
Console.WriteLine("🌐 URL Local: http://localhost:7003"); 
Console.WriteLine("🌐 URL Red: http://192.168.1.6:7003"); 
Console.WriteLine("🔐 API: http://192.168.1.6:7003/api/auth/login"); 
Console.WriteLine("📚 Swagger: http://192.168.1.6:7003/swagger"); 
Console.WriteLine("👤 Login: admin / admin123"); 
Console.WriteLine("🔄 CORS: Enabled for all origins"); 
Console.WriteLine("📊 Framework: ASP.NET Core 8.0"); 
Console.WriteLine("🗄️ Database: MySQL with Entity Framework"); 
Console.WriteLine("🔑 Auth: JWT Bearer Token"); 
Console.WriteLine("🌍 Disponible en toda la red local"); 
Console.WriteLine("========================================="); 

Console.WriteLine("🚀 Iniciando servidor en puerto 7003...");

try 
{
    // El servidor se configurará automáticamente desde appsettings.json
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error al iniciar el servidor: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    throw;
}
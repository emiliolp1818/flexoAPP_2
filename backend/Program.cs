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
using Serilog;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

// ===== CONFIGURACIÓN DE SERILOG =====
// Configurar sistema de logging estructurado para toda la aplicación FlexoAPP
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")  // Salida a consola para desarrollo
    .WriteTo.File("logs/flexoapp-.log",                                                                        // Archivos de log para producción
        rollingInterval: RollingInterval.Day,                                                                  // Rotar archivos diariamente
        retainedFileCountLimit: 30,                                                                            // Mantener 30 días de logs
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    // ===== LOG DE INICIO DE LA APLICACIÓN =====
    // Registrar en el log que la aplicación FlexoAPP está iniciando con MySQL local
    Log.Information("🚀 Iniciando FlexoAPP Backend - MySQL Local (flexoapp_bd)");

    // ===== CREAR BUILDER DE LA APLICACIÓN WEB =====
    // WebApplicationBuilder: configura servicios y middleware de ASP.NET Core
    var builder = WebApplication.CreateBuilder(args); // args: argumentos de línea de comandos

    // ===== INTEGRACIÓN DE SERILOG =====
    // Integrar Serilog como proveedor de logging principal
    builder.Host.UseSerilog();

    // ===== CONFIGURACIÓN DE KESTREL (LOCAL) =====
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.Limits.MaxRequestBodySize = 52428800; // 50MB
        options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
    });

    // ===== RESPONSE COMPRESSION =====
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
        options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
        {
            "application/json",
            "text/json",
            "application/javascript",
            "text/css",
            "text/html"
        });
    });

    builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
    {
        options.Level = CompressionLevel.Optimal;
    });

    builder.Services.Configure<GzipCompressionProviderOptions>(options =>
    {
        options.Level = CompressionLevel.Optimal;
    });

    // ===== CORS CONFIGURATION (LOCAL) =====
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:7003",
                "http://127.0.0.1:4200",
                "http://127.0.0.1:7003",
                "http://192.168.1.20:4200", // IP estática - Frontend
                "http://192.168.1.20:7003"  // IP estática - Backend
            )
            .SetIsOriginAllowedToAllowWildcardSubdomains()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
        
        // Política adicional para permitir toda la red local
        options.AddPolicy("LocalNetwork", policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                // Permitir localhost y 127.0.0.1
                if (origin.Contains("localhost") || origin.Contains("127.0.0.1"))
                    return true;
                
                // Permitir cualquier IP de la red local 192.168.x.x
                if (origin.Contains("192.168."))
                    return true;
                
                // Permitir redes privadas 10.x.x.x y 172.16-31.x.x
                if (origin.Contains("10.") || origin.Contains("172."))
                    return true;
                
                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
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
            Title = "FlexoAPP API - Local",
            Version = "v2.0.0",
            Description = "Sistema de Gestión Flexográfica - PostgreSQL Local",
            Contact = new OpenApiContact
            {
                Name = "FlexoAPP Team",
                Email = "support@flexoapp.com"
            }
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

    // ===== MINIPROFILER CONFIGURATION =====
    builder.Services.AddMiniProfiler(options =>
    {
        options.RouteBasePath = "/profiler";
        options.PopupRenderPosition = StackExchange.Profiling.RenderPosition.BottomLeft;
        options.PopupShowTimeWithChildren = true;
        options.PopupShowTrivial = true;
    }).AddEntityFramework();

    // ===== MEMORY CACHE (Simplified for now) =====
    builder.Services.AddMemoryCache(options =>
    {
        options.SizeLimit = 1024 * 1024 * 100; // 100MB
        options.CompactionPercentage = 0.25;
        options.ExpirationScanFrequency = TimeSpan.FromMinutes(5);
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
    // Try to get JWT secret from environment variable first (Render), then from config
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                   ?? jwtSettings["SecretKey"] 
                   ?? throw new InvalidOperationException("JWT SecretKey is required");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.FromMinutes(5),
                RequireExpirationTime = true,
                RequireSignedTokens = true
            };

            // SignalR configuration
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

    // ===== CONFIGURACIÓN DE BASE DE DATOS MYSQL LOCAL =====
    // Obtener la cadena de conexión desde appsettings.json o appsettings.Development.json
    // DefaultConnection: nombre de la cadena de conexión en el archivo de configuración
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                          ?? throw new InvalidOperationException("MySQL connection string is required"); // Lanzar excepción si no existe
    
    // ===== LOG DE TIPO DE CONEXIÓN =====
    // Registrar que se está usando MySQL local (no PostgreSQL)
    Log.Information("🔌 Using LOCAL MySQL connection to flexoapp_bd database");
    
    // ===== ENMASCARAR CONTRASEÑA PARA EL LOG =====
    // Ocultar la contraseña en los logs por seguridad
    // Regex: reemplaza "Password=valor" con "Password=***"
    var maskedConnectionString = System.Text.RegularExpressions.Regex.Replace(
        connectionString, @"Password=[^;]+", "Password=***"); // Buscar Password= y reemplazar el valor
    Log.Information("🔌 Connection: {ConnectionString}", maskedConnectionString); // Mostrar conexión sin contraseña

    // ===== CONFIGURAR ENTITY FRAMEWORK CON MYSQL =====
    // AddDbContext: registrar el contexto de base de datos en el contenedor de dependencias
    builder.Services.AddDbContext<FlexoAPPDbContext>(options =>
    {
        // ===== DETECTAR VERSIÓN DE MYSQL =====
        // ServerVersion.AutoDetect: detecta automáticamente la versión de MySQL del servidor
        // Esto es importante para usar las características correctas de MySQL (5.7, 8.0, etc.)
        var serverVersion = ServerVersion.AutoDetect(connectionString); // Conecta y detecta versión
        
        // ===== CONFIGURAR PROVEEDOR MYSQL =====
        // UseMySql: configura Entity Framework para usar MySQL en lugar de SQL Server o PostgreSQL
        options.UseMySql(connectionString, serverVersion, mySqlOptions =>
        {
            // ===== TIMEOUT DE COMANDOS =====
            // CommandTimeout: tiempo máximo de espera para comandos SQL (30 segundos)
            mySqlOptions.CommandTimeout(30); // Timeout de 30 segundos para consultas
            
            // ===== REINTENTOS AUTOMÁTICOS =====
            // EnableRetryOnFailure: reintentar automáticamente en caso de errores transitorios
            // Útil para problemas de red temporales o bloqueos de base de datos
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3, // Máximo 3 reintentos
                maxRetryDelay: TimeSpan.FromSeconds(5), // Esperar máximo 5 segundos entre reintentos
                errorNumbersToAdd: null); // null = usar errores por defecto de MySQL
        });

        // ===== OPCIONES DE DESARROLLO =====
        // EnableSensitiveDataLogging: mostrar valores de parámetros en logs (solo en desarrollo)
        // ADVERTENCIA: no usar en producción por seguridad
        options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment()); // Solo en Development
        
        // ===== CACHÉ DEL PROVEEDOR DE SERVICIOS =====
        // EnableServiceProviderCaching: cachear el proveedor de servicios para mejor rendimiento
        options.EnableServiceProviderCaching(); // Mejora el rendimiento
        
        // ===== ERRORES DETALLADOS =====
        // EnableDetailedErrors: mostrar errores detallados de Entity Framework (solo en desarrollo)
        options.EnableDetailedErrors(builder.Environment.IsDevelopment()); // Solo en Development
    });

    // ===== LOG DE CONFIRMACIÓN =====
    // Registrar que MySQL se configuró correctamente
    Log.Information("✅ MySQL Local Database configured successfully for flexoapp_bd");

    // ===== HEALTH CHECKS =====
    builder.Services.AddHealthChecks()
        .AddDbContextCheck<FlexoAPPDbContext>("database")
        .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

    Log.Information("✅ Health checks configured");

    // ===== AUTOMAPPER CONFIGURATION =====
    builder.Services.AddAutoMapper(typeof(Program));

    // ===== DEPENDENCY INJECTION =====
    // Authentication & Authorization
    builder.Services.AddScoped<IAuthService, AuthService>();
    
    // PDF Conversion Service - Conversión sin marca de agua
    builder.Services.AddScoped<IPdfConversionService, PdfConversionService>();
    Log.Information("✅ PdfConversionService registered (Free, No Watermark)");
    
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();

    // Business Services
    builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
    builder.Services.AddScoped<IActivityService, ActivityService>();
    builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();
    builder.Services.AddScoped<IPedidoService, PedidoService>();
    builder.Services.AddScoped<IDesignRepository, DesignRepository>();
    builder.Services.AddScoped<IDesignService, DesignService>();
    builder.Services.AddScoped<ICondicionUnicaRepository, CondicionUnicaRepository>();
    
    // Módulo de Máquinas (tabla: maquinas)
    builder.Services.AddScoped<IMaquinaRepository, MaquinaRepository>();
    builder.Services.AddScoped<IMaquinaService, MaquinaService>();

    // Reports & Backup Services
    builder.Services.AddScoped<IReportsService, ReportsService>();
    // builder.Services.AddScoped<IMachineBackupService, MachineBackupService>(); // Deshabilitado temporalmente

    // Automatic Backup Service deshabilitado para estabilidad

    // Audit & Logging
    builder.Services.AddScoped<FlexoAPP.API.Services.IAuditService, FlexoAPP.API.Services.AuditService>();
    
    // Activity Logger - Registro automático de actividades para reportes
    builder.Services.AddScoped<IActivityLoggerService, ActivityLoggerService>();

    // HTTP Context
    builder.Services.AddHttpContextAccessor();

    // Cache Service (Memory Cache for now)
    builder.Services.AddScoped<ICacheService, MemoryCacheService>();

    Log.Information("✅ All services configured successfully");

    var app = builder.Build();

    Log.Information("🔧 Configuring middleware pipeline...");

    // ===== MIDDLEWARE PIPELINE =====

    // Response compression
    app.UseResponseCompression();

    // MiniProfiler (development only)
    if (app.Environment.IsDevelopment())
    {
        app.UseMiniProfiler();
    }

    // CORS - Usar política LocalNetwork para permitir toda la red local
    app.UseCors("LocalNetwork");

    // Static Files - Para servir imágenes de perfil y otros archivos
    app.UseStaticFiles();
    
    // Static Files - Para servir archivos subidos (documentos)
    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
        Log.Information("📁 Created uploads directory: {Path}", uploadsPath);
    }
    
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads",
        OnPrepareResponse = ctx =>
        {
            // Configurar headers para que los archivos se visualicen en el navegador
            // en lugar de descargarse automáticamente
            var path = ctx.File.Name.ToLower();
            
            // Para PDFs: visualizar en el navegador (inline)
            if (path.EndsWith(".pdf"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "inline";
                ctx.Context.Response.Headers["Content-Type"] = "application/pdf";
            }
            // Para imágenes: visualizar en el navegador (inline)
            else if (path.EndsWith(".png") || path.EndsWith(".jpg") || path.EndsWith(".jpeg") || path.EndsWith(".gif"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "inline";
            }
            // Para Excel y Word: forzar descarga (attachment)
            else if (path.EndsWith(".xlsx") || path.EndsWith(".xls") || path.EndsWith(".docx") || path.EndsWith(".doc"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "attachment";
            }
            
            // Agregar headers de caché para mejorar rendimiento
            ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=3600";
        }
    });

    // Swagger (development and staging)
    if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlexoAPP Enhanced API v2.1.0");
            c.RoutePrefix = "swagger";
            c.DisplayRequestDuration();
            c.EnableDeepLinking();
            c.EnableFilter();
            c.ShowExtensions();
        });
    }

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Controllers
    app.MapControllers();

    // SignalR Hubs (deshabilitado temporalmente)
    // app.MapHub<flexoAPP.Hubs.MachineProgramHub>("/hubs/machine-programs");

    // Health Check Endpoints
    app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
        {
            context.Response.ContentType = "application/json";
            var response = new
            {
                status = report.Status.ToString().ToLower(),
                timestamp = DateTime.UtcNow,
                message = "FlexoAPP Enhanced API Health Check - PostgreSQL Edition",
                version = "v2.2.0",
                database = report.Entries.ContainsKey("database") ? 
                          (report.Entries["database"].Status == Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy ? "PostgreSQL Connected (Supabase)" : "PostgreSQL Disconnected") : 
                          "Unknown",
                authentication = "JWT Enabled",
                caching = "Memory Cache",
                profiling = "MiniProfiler Enabled",
                compression = "Brotli + Gzip Enabled",
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
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        }
    });

    app.MapHealthChecks("/health/ready");
    app.MapHealthChecks("/health/live");

    // Simple health check endpoint for network stability checks
    app.MapGet("/health-simple", () => new { 
        status = "ok", 
        timestamp = DateTime.UtcNow 
    });

    // ===== ENDPOINT RAÍZ (ROOT) =====
    // Endpoint GET / que muestra información general de la API
    // Útil para verificar que el servidor está funcionando correctamente
    app.MapGet("/", () => new { 
        // ===== INFORMACIÓN GENERAL =====
        message = "FlexoAPP Enhanced API - MySQL Local Edition", // Mensaje de bienvenida
        status = "running", // Estado del servidor
        timestamp = DateTime.UtcNow, // Fecha y hora actual en UTC
        version = "v2.2.0", // Versión de la API
        framework = ".NET 8.0", // Versión del framework
        
        // ===== CARACTERÍSTICAS TÉCNICAS =====
        features = new {
            database = "MySQL Local (flexoapp_bd) with Connection Pooling", // Base de datos MySQL local
            caching = "Memory Cache", // Sistema de caché
            logging = "Serilog Structured Logging", // Sistema de logging
            profiling = "MiniProfiler Enabled", // Profiling habilitado
            compression = "Brotli + Gzip Enabled", // Compresión HTTP
            authentication = "JWT Bearer Token" // Autenticación JWT
        },
        
        // ===== CREDENCIALES POR DEFECTO =====
        login = "admin / admin123", // Usuario y contraseña por defecto
        
        // ===== ENDPOINTS DISPONIBLES =====
        endpoints = new[] { 
            "/api/auth/login",        // Endpoint de login
            "/api/auth/me",           // Endpoint de información del usuario actual
            "/api/designs",           // Endpoint de diseños
            "/api/maquinas",          // Endpoint de máquinas (TABLA: maquinas)
            "/api/machine-programs",  // Endpoint de programas de máquinas (TABLA: machine_programs)
            "/api/pedidos",           // Endpoint de pedidos
            "/api/performance",       // Endpoint de rendimiento
            "/health",                // Endpoint de salud
            "/swagger",               // Documentación Swagger
            "/profiler"               // MiniProfiler
        } 
    });

    // Inicializar base de datos con datos esenciales del sistema
    try 
    {
        // Crear usuario administrador si no existe
        await FlexoAPP.API.Data.SeedData.InitializeAsync(app.Services);
        Log.Information("✅ Base de datos inicializada con datos esenciales");
    }
    catch (Exception ex)
    {
        Log.Warning("⚠️ No se pudieron inicializar los datos esenciales: {Error}", ex.Message);
    }

    // ===== BANNER DE INICIO DE LA APLICACIÓN =====
    // Mostrar información detallada de la configuración de la aplicación en los logs
    Log.Information("========================================="); 
    Log.Information("🚀 FLEXOAPP ENHANCED API - MYSQL LOCAL READY"); // Título principal
    Log.Information("========================================="); 
    Log.Information("🌐 Framework: ASP.NET Core 8.0"); // Versión del framework
    Log.Information("🗄️ Database: MySQL Local (flexoapp_bd) with connection pooling"); // Base de datos MySQL local
    Log.Information("💾 Caching: Memory Cache with 100MB limit"); // Sistema de caché en memoria
    Log.Information("📝 Logging: Serilog with structured logging"); // Sistema de logging estructurado
    Log.Information("⚡ Profiling: MiniProfiler enabled (/profiler)"); // Herramienta de profiling
    Log.Information("🔐 Authentication: JWT Bearer Token"); // Sistema de autenticación JWT
    Log.Information("🌍 CORS: Enabled for local network"); // CORS habilitado para desarrollo local
    Log.Information("📊 Health Checks: /health, /health/ready, /health/live"); // Endpoints de salud
    Log.Information("🗜️ Compression: Brotli + Gzip enabled"); // Compresión de respuestas HTTP
    Log.Information("👤 Default Login: admin / admin123"); // Credenciales por defecto
    Log.Information("🔌 MySQL Server: localhost:3306"); // Servidor MySQL
    Log.Information("📁 Database: flexoapp_bd"); // Nombre de la base de datos
    Log.Information("========================================="); 

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal("❌ Application terminated unexpectedly: {Error}", ex);
}
finally
{
    Log.CloseAndFlush();
}
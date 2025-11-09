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
    Log.Information("🚀 Iniciando FlexoAPP Backend - Edición MySQL");

    var builder = WebApplication.CreateBuilder(args);

    // ===== INTEGRACIÓN DE SERILOG =====
    // Integrar Serilog como proveedor de logging principal
    builder.Host.UseSerilog();

    // ===== CONFIGURACIÓN DE RENDIMIENTO =====
    // Configurar servidor Kestrel para optimizar rendimiento
    builder.WebHost.ConfigureKestrel(options =>
    {
        // Escuchar en todas las interfaces de red en puerto 7003
        options.ListenAnyIP(7003);
        
        // Límites de tamaño para headers y requests
        options.Limits.MaxRequestHeadersTotalSize = 1048576; // 1MB para headers
        options.Limits.MaxRequestHeaderCount = 1000;         // Máximo 1000 headers
        options.Limits.MaxRequestLineSize = 131072;          // 128KB por línea de request
        options.Limits.MaxRequestBufferSize = 20971520;      // 20MB buffer de request
        options.Limits.MaxRequestBodySize = 52428800;        // 50MB tamaño máximo de body
        options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(5);  // Timeout de keep-alive
        options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(2); // Timeout de headers
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

    // ===== CORS CONFIGURATION =====
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;

                // Allow localhost and local network
                if (origin.StartsWith("http://localhost") || 
                    origin.StartsWith("http://127.0.0.1") ||
                    origin.StartsWith("http://192.168.") ||
                    origin.StartsWith("http://10.") ||
                    origin.StartsWith("http://172."))
                    return true;

                return false;
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
            Title = "FlexoAPP Enhanced API - MySQL Edition",
            Version = "v2.1.0",
            Description = "Enterprise Flexographic Management System - Enhanced with MySQL optimizations, Serilog, and Performance improvements",
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
    var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is required");

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

    // ===== MYSQL DATABASE CONFIGURATION =====
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                          ?? builder.Configuration.GetConnectionString("LocalConnection")
                          ?? throw new InvalidOperationException("MySQL connection string is required");

    builder.Services.AddDbContext<FlexoAPPDbContext>(options =>
    {
        // MySQL optimized configuration
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mySqlOptions =>
        {
            mySqlOptions.CommandTimeout(30);
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null);
        });

        options.EnableSensitiveDataLogging(false);
        options.EnableServiceProviderCaching();
        options.ConfigureWarnings(warnings => 
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.RowLimitingOperationWithoutOrderByWarning));
        options.EnableDetailedErrors(builder.Environment.IsDevelopment());
    });

    Log.Information("✅ MySQL Database configured with optimized connection pooling");

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

    // Automatic Backup Service deshabilitado para estabilidad

    // Audit & Logging
    builder.Services.AddScoped<FlexoAPP.API.Services.IAuditService, FlexoAPP.API.Services.AuditService>();

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

    // CORS
    app.UseCors();

    // Static Files - Para servir imágenes de perfil y otros archivos
    app.UseStaticFiles();

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

    // SignalR Hubs
    app.MapHub<flexoAPP.Hubs.MachineProgramHub>("/hubs/machine-programs");

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
                message = "FlexoAPP Enhanced API Health Check - MySQL Edition",
                version = "2.1.0",
                database = report.Entries.ContainsKey("database") ? 
                          (report.Entries["database"].Status == Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy ? "MySQL Connected" : "MySQL Disconnected") : 
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

    // Root endpoint
    app.MapGet("/", () => new { 
        message = "FlexoAPP Enhanced API - MySQL Edition", 
        status = "running", 
        timestamp = DateTime.UtcNow,
        version = "2.1.0",
        framework = ".NET 8.0",
        features = new {
            database = "MySQL with Optimized Connection Pooling",
            caching = "Memory Cache",
            logging = "Serilog Structured Logging",
            profiling = "MiniProfiler Enabled",
            compression = "Brotli + Gzip Enabled",
            authentication = "JWT Bearer Token"
        },
        login = "admin / admin123", 
        endpoints = new[] { 
            "/api/auth/login", 
            "/api/auth/me", 
            "/api/designs",
            "/api/machine-programs",
            "/api/pedidos",
            "/api/performance",
            "/health", 
            "/swagger",
            "/profiler"
        } 
    });

    // Inicializar base de datos con datos esenciales del sistema
    try 
    {
        // Crear usuario administrador si no existe
        await FlexoAPP.API.Data.SeedData.InitializeAsync(app.Services);
        // Crear tabla de programas de máquinas si no existe
        await FlexoAPP.API.Data.MachineProgramTableInitializer.InitializeAsync(app.Services);
        Log.Information("✅ Base de datos inicializada con datos esenciales");
    }
    catch (Exception ex)
    {
        Log.Warning("⚠️ No se pudieron inicializar los datos esenciales: {Error}", ex.Message);
    }

    Log.Information("========================================="); 
    Log.Information("🚀 FLEXOAPP ENHANCED API - MYSQL READY"); 
    Log.Information("========================================="); 
    Log.Information("🌐 Framework: ASP.NET Core 8.0"); 
    Log.Information("🗄️ Database: MySQL with optimized connection pooling");
    Log.Information("💾 Caching: Memory Cache with 100MB limit");
    Log.Information("📝 Logging: Serilog with structured logging");
    Log.Information("⚡ Profiling: MiniProfiler enabled (/profiler)");
    Log.Information("🔐 Authentication: JWT Bearer Token"); 
    Log.Information("🌍 CORS: Enabled for local network"); 
    Log.Information("📊 Health Checks: /health, /health/ready, /health/live");
    Log.Information("🗜️ Compression: Brotli + Gzip enabled");
    Log.Information("👤 Default Login: admin / admin123"); 
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
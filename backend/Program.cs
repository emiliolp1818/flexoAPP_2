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
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/flexoapp-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7, // Reducir a 7 días para Render
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("🚀 Iniciando FlexoAPP Backend - Render/Railway Production");

    var builder = WebApplication.CreateBuilder(args);

    // ===== INTEGRACIÓN DE SERILOG =====
    builder.Host.UseSerilog();

    // ===== CONFIGURACIÓN DE KESTREL PARA RENDER =====
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.Limits.MaxRequestBodySize = 52428800; // 50MB
        options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
        
        // Configurar para escuchar en el puerto de Render
        var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        options.ListenAnyIP(int.Parse(port));
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

    // ===== CORS CONFIGURATION (RENDER/RAILWAY) =====
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(
                "https://flexoapp-backend.onrender.com",
                "https://frontend-f54v.onrender.com",
                "http://localhost:4200",
                "http://localhost:8080",
                "http://127.0.0.1:4200",
                "http://127.0.0.1:8080"
            )
            .SetIsOriginAllowedToAllowWildcardSubdomains()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
        
        // Política para producción en Render
        options.AddPolicy("RenderProduction", policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                // Permitir dominios de Render
                if (origin.Contains("onrender.com"))
                    return true;
                
                // Permitir localhost para desarrollo
                if (origin.Contains("localhost") || origin.Contains("127.0.0.1"))
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
            Title = "FlexoAPP API - Render/Railway",
            Version = "v2.0.0",
            Description = "Sistema de Gestión Flexográfica - MySQL Railway",
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

    // ===== CONFIGURACIÓN DE BASE DE DATOS MYSQL RAILWAY =====
    string connectionString;
    
    try 
    {
        // Prioridad: 1. Variable de entorno específica, 2. DATABASE_URL, 3. appsettings
        connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                          ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                          ?? builder.Configuration.GetConnectionString("DefaultConnection");
        
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("No se encontró cadena de conexión a la base de datos");
        }
        
        // Si viene de DATABASE_URL (Railway), convertir formato
        if (connectionString.StartsWith("mysql://"))
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo.Split(':');
            connectionString = $"Server={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};User={userInfo[0]};Password={userInfo[1]};AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;ConnectionTimeout=30;CommandTimeout=30;";
        }
        
        Log.Information("🔌 Configurando conexión a MySQL Railway");
        
        // Enmascarar contraseña para logs
        var maskedConnectionString = System.Text.RegularExpressions.Regex.Replace(
            connectionString, @"Password=[^;]+", "Password=***");
        Log.Information("🔌 Connection: {ConnectionString}", maskedConnectionString);
    }
    catch (Exception ex)
    {
        Log.Fatal("❌ Error configurando cadena de conexión: {Error}", ex.Message);
        throw;
    }

    // ===== CONFIGURAR ENTITY FRAMEWORK CON MYSQL =====
    try 
    {
        builder.Services.AddDbContext<FlexoAPPDbContext>(options =>
        {
            // Usar versión fija para evitar problemas de conexión en Render
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));
            
            options.UseMySql(connectionString, serverVersion, mySqlOptions =>
            {
                mySqlOptions.CommandTimeout(60); // Aumentar timeout para Render
                mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5, // Más reintentos para conexiones de red
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);
            });

            // Solo habilitar logging sensible en desarrollo
            if (builder.Environment.IsDevelopment())
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
            
            options.EnableServiceProviderCaching();
        });
        
        Log.Information("✅ Entity Framework configurado correctamente");
    }
    catch (Exception ex)
    {
        Log.Fatal("❌ Error configurando Entity Framework: {Error}", ex.Message);
        throw;
    }

    // ===== LOG DE CONFIRMACIÓN =====
    Log.Information("✅ MySQL Railway Database configured successfully");

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

    // ===== VERIFICAR CONEXIÓN A BASE DE DATOS =====
    try 
    {
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();
            Log.Information("🔍 Verificando conexión a base de datos...");
            
            // Verificar que podemos conectar
            await context.Database.CanConnectAsync();
            Log.Information("✅ Conexión a base de datos exitosa");
            
            // Ejecutar scripts de creación si es necesario
            Log.Information("🗄️ Verificando estructura de base de datos...");
            await context.Database.EnsureCreatedAsync();
            Log.Information("✅ Estructura de base de datos verificada");
        }
    }
    catch (Exception ex)
    {
        Log.Fatal("❌ Error conectando a base de datos: {Error}", ex.Message);
        Log.Fatal("❌ Stack trace: {StackTrace}", ex.StackTrace);
        throw;
    }

    // ===== MIDDLEWARE PIPELINE =====

    // Global error handling
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;

            Log.Error(exception, "Error no manejado en {Path}", context.Request.Path);

            var response = new
            {
                error = "Internal Server Error",
                message = app.Environment.IsDevelopment() ? exception?.Message : "An error occurred processing your request",
                path = context.Request.Path.Value,
                timestamp = DateTime.UtcNow
            };

            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        });
    });

    // Response compression
    app.UseResponseCompression();

    // MiniProfiler (development only)
    if (app.Environment.IsDevelopment())
    {
        app.UseMiniProfiler();
    }

    // CORS - Usar política RenderProduction para producción
    app.UseCors(app.Environment.IsProduction() ? "RenderProduction" : "RenderProduction");

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
                message = "FlexoAPP Enhanced API Health Check - Railway Edition",
                version = "v2.2.0",
                database = report.Entries.ContainsKey("database") ? 
                          (report.Entries["database"].Status == Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy ? "MySQL Connected (Railway)" : "MySQL Disconnected") : 
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
        message = "FlexoAPP Enhanced API - Render/Railway Edition",
        status = "running",
        timestamp = DateTime.UtcNow,
        version = "v2.2.0",
        framework = ".NET 8.0",
        
        // ===== CARACTERÍSTICAS TÉCNICAS =====
        features = new {
            database = "MySQL Railway with Connection Pooling",
            caching = "Memory Cache",
            logging = "Serilog Structured Logging",
            profiling = "MiniProfiler Enabled",
            compression = "Brotli + Gzip Enabled",
            authentication = "JWT Bearer Token"
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
    Log.Information("========================================="); 
    Log.Information("🚀 FLEXOAPP ENHANCED API - RENDER/RAILWAY READY");
    Log.Information("========================================="); 
    Log.Information("🌐 Framework: ASP.NET Core 8.0");
    Log.Information("🗄️ Database: MySQL Railway with connection pooling");
    Log.Information("💾 Caching: Memory Cache with 100MB limit");
    Log.Information("📝 Logging: Serilog with structured logging");
    Log.Information("⚡ Profiling: MiniProfiler enabled (/profiler)");
    Log.Information("🔐 Authentication: JWT Bearer Token");
    Log.Information("🌍 CORS: Enabled for Render domains");
    Log.Information("📊 Health Checks: /health, /health/ready, /health/live");
    Log.Information("🗜️ Compression: Brotli + Gzip enabled");
    Log.Information("👤 Default Login: admin / admin123");
    Log.Information("🔌 MySQL Server: Railway (hopper.proxy.rlwy.net:43791)");
    Log.Information("📁 Database: railway");
    Log.Information("🌐 Backend URL: https://flexoapp-backend.onrender.com");
    Log.Information("🌐 Frontend URL: https://frontend-f54v.onrender.com");
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
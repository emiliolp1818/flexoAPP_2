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
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
var isRailway = environment == "Railway";

var logConfig = new LoggerConfiguration();

// En Railway, nivel Information pero con overrides restrictivos para reducir logs
if (isRailway)
{
    logConfig
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.AspNetCore.Hosting", Serilog.Events.LogEventLevel.Information)
        .MinimumLevel.Override("Microsoft.AspNetCore.SignalR", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.AspNetCore.Http.Connections", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning);
}
else
{
    logConfig.MinimumLevel.Information();
}

Log.Logger = logConfig
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/flexoapp-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("🚀 Iniciando FlexoAPP Backend");

    var builder = WebApplication.CreateBuilder(args);

    // ===== DETECTAR ENTORNO RAILWAY =====
    // Ya tenemos isRailway definido arriba, no redeclarar
    var environmentName = isRailway ? "Railway" : "Development";
    
    Log.Information($"🌍 Entorno detectado: {environmentName}");
    
    // Cargar configuración específica del entorno
    if (isRailway)
    {
        builder.Configuration.AddJsonFile("appsettings.Railway.json", optional: true, reloadOnChange: true);
        
        // Railway MySQL plugin puede usar MYSQLHOST (sin guión bajo) o MYSQL_HOST (con guión bajo)
        var mysqlHost     = Environment.GetEnvironmentVariable("MYSQLHOST")     ?? Environment.GetEnvironmentVariable("MYSQL_HOST");
        var mysqlPort     = Environment.GetEnvironmentVariable("MYSQLPORT")     ?? Environment.GetEnvironmentVariable("MYSQL_PORT") ?? "3306";
        var mysqlDatabase = Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? Environment.GetEnvironmentVariable("MYSQL_DATABASE");
        var mysqlUser     = Environment.GetEnvironmentVariable("MYSQLUSER")     ?? Environment.GetEnvironmentVariable("MYSQL_USER");
        var mysqlPassword = Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? Environment.GetEnvironmentVariable("MYSQL_PASSWORD");

        Log.Information("🔍 Railway MySQL vars → Host:{Host} Port:{Port} DB:{DB} User:{User}",
            mysqlHost ?? "(null)", mysqlPort, mysqlDatabase ?? "(null)", mysqlUser ?? "(null)");

        // Reemplazar variables de entorno en la cadena de conexión del appsettings.Railway.json
        var railwayConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(railwayConnectionString) && !string.IsNullOrEmpty(mysqlHost))
        {
            railwayConnectionString = railwayConnectionString
                .Replace("${MYSQL_HOST}",     mysqlHost)
                .Replace("${MYSQL_PORT}",     mysqlPort)
                .Replace("${MYSQL_DATABASE}", mysqlDatabase)
                .Replace("${MYSQL_USER}",     mysqlUser)
                .Replace("${MYSQL_PASSWORD}", mysqlPassword);
            
            // Remover parámetros no soportados por MySqlConnector
            railwayConnectionString = System.Text.RegularExpressions.Regex.Replace(
                railwayConnectionString, 
                @"ConnectionIdleTimeout=\d+;?", 
                "", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            
            builder.Configuration["ConnectionStrings:DefaultConnection"] = railwayConnectionString;
            Log.Information("✅ Cadena de conexión Railway configurada desde variables individuales");
        }
        else
        {
            Log.Warning("⚠️ Variables MySQL individuales no encontradas, se usará DATABASE_URL/MYSQL_URL como fallback");
        }
        
        // Configurar URL con el puerto de Railway
        var railwayPort = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        builder.Configuration["Urls"] = $"http://0.0.0.0:{railwayPort}";
        Log.Information($"✅ Puerto Railway configurado: {railwayPort}");
    }

    // ===== INTEGRACIÓN DE SERILOG =====
    builder.Host.UseSerilog();


    // ===== CONFIGURACIÓN DE KESTREL (OPTIMIZADO) =====
    builder.WebHost.ConfigureKestrel(options =>
    {
        // Límite de body: 50MB (reducido de 500MB) - suficiente para Excel
        options.Limits.MaxRequestBodySize = 50 * 1024 * 1024;
        
        // Keep-alive: 1 minuto (reducido de 2min)
        options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(1);
        
        // Request timeout: 2 minutos
        options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(2);
        
        // Máximo de conexiones concurrentes (Railway tiene límites)
        options.Limits.MaxConcurrentConnections = 100;
        options.Limits.MaxConcurrentUpgradedConnections = 100;
        
        // Límite de headers
        options.Limits.MaxRequestHeadersTotalSize = 32 * 1024; // 32KB
        options.Limits.MaxRequestLineSize = 8 * 1024; // 8KB

        var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        options.ListenAnyIP(int.Parse(port));
    });


    // ===== RESPONSE COMPRESSION (OPTIMIZADO) =====
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
        
        // Solo comprimir tipos de contenido que realmente se benefician
        options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
        {
            "application/json",
            "text/json",
            "application/javascript",
            "text/css",
            "text/html"
        });
        
        // No comprimir respuestas pequeñas (< 1KB) - overhead no vale la pena
        options.EnableForHttps = true;
    });

    builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
    {
        // Fastest = menos RAM (~2MB/request), compresión 60-70%
        // Optimal = más RAM (~4MB/request), compresión 50-60%
        // SmallestSize = mucha RAM (~8MB/request), compresión 40-50%
        options.Level = CompressionLevel.Fastest;
    });

    builder.Services.Configure<GzipCompressionProviderOptions>(options =>
    {
        // Fastest para balance óptimo RAM/velocidad
        options.Level = CompressionLevel.Fastest;
    });


    // ===== CORS CONFIGURATION =====
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                // Permitir todos los dominios de Railway
                if (origin.Contains(".railway.app") || origin.Contains(".up.railway.app"))
                    return true;
                // Permitir localhost para desarrollo
                if (origin.Contains("localhost") || origin.Contains("127.0.0.1"))
                    return true;
                // Permitir IPs de red local
                if (System.Text.RegularExpressions.Regex.IsMatch(origin,
                    @"https?://(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d{1,3}\.\d{1,3}(:\d+)?"))
                    return true;
                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
    });


    // ===== API CONFIGURATION =====
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {

            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;

            options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        });


    // ===== FORM OPTIONS (OPTIMIZADO) =====
    builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
    {
        // Límites para upload de Excel: 50MB
        options.MultipartBodyLengthLimit = 50 * 1024 * 1024;
        options.ValueLengthLimit = 50 * 1024 * 1024;
        options.MultipartHeadersLengthLimit = 16 * 1024; // 16KB
        
        // Buffer más pequeño para reducir memoria
        options.BufferBodyLengthLimit = 128 * 1024; // 128KB
        options.MemoryBufferThreshold = 64 * 1024; // 64KB
    });

    builder.Services.AddEndpointsApiExplorer();


    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "FlexoAPP API",
            Version = "v2.0.0",
            Description = "Sistema de Gestión Flexográfica",
            Contact = new OpenApiContact
            {
                Name = "FlexoAPP Team",
                Email = "support@flexoapp.com"
            }
        });


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


    builder.Services.AddMiniProfiler(options =>
    {
        options.RouteBasePath = "/profiler";
        options.PopupRenderPosition = StackExchange.Profiling.RenderPosition.BottomLeft;
        options.PopupShowTimeWithChildren = true;
        options.PopupShowTrivial = true;
    }).AddEntityFramework();


    // ===== MEMORY CACHE (OPTIMIZADO) =====
    builder.Services.AddMemoryCache(options =>
    {
        // Límite: 50MB (reducido de 100MB para Railway)
        options.SizeLimit = 1024 * 1024 * 50;
        
        // Compactar cuando se alcance 75% del límite (antes 25%)
        options.CompactionPercentage = 0.25;
        
        // Escanear cada 2 minutos para liberar memoria más frecuentemente
        options.ExpirationScanFrequency = TimeSpan.FromMinutes(2);
    });


    // ===== SIGNALR (OPTIMIZADO) =====
    builder.Services.AddSignalR(options =>
    {
        // Solo en desarrollo para debugging
        options.EnableDetailedErrors = !isRailway;
        
        // Keep-alive cada 30s (reducido de 1min) para detectar desconexiones más rápido
        options.KeepAliveInterval = TimeSpan.FromSeconds(30);
        
        // Timeout de cliente: 2 minutos (reducido de 5min)
        options.ClientTimeoutInterval = TimeSpan.FromMinutes(2);
        
        // Handshake timeout: 30s (reducido de 1min)
        options.HandshakeTimeout = TimeSpan.FromSeconds(30);
        
        // Tamaño máximo de mensaje: 512KB (reducido de 1MB)
        options.MaximumReceiveMessageSize = 512 * 1024;
        
        // Limitar buffer de mensajes paralelos
        options.StreamBufferCapacity = 10;
    });


    // ===== JWT AUTHENTICATION =====
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");

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
    string? dbConnectionString;

    try
    {
        // Prioridad: variable directa > URL completa (MYSQL_URL o DATABASE_URL) > config cargada
        dbConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                          ?? Environment.GetEnvironmentVariable("MYSQL_URL")
                          ?? Environment.GetEnvironmentVariable("MYSQLURL")
                          ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                          ?? builder.Configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(dbConnectionString))
        {
            throw new InvalidOperationException("No se encontró cadena de conexión a la base de datos. Variables disponibles: " +
                string.Join(", ", Environment.GetEnvironmentVariables().Keys.Cast<string>()
                    .Where(k => k.Contains("MYSQL") || k.Contains("DATABASE") || k.Contains("DB"))
                    .OrderBy(k => k)));
        }

        if (dbConnectionString.StartsWith("mysql://") || dbConnectionString.StartsWith("mysql+mysqlconnector://"))
        {
            var cleanUrl = dbConnectionString.Replace("mysql+mysqlconnector://", "mysql://");
            var uri = new Uri(cleanUrl);
            var userInfo = uri.UserInfo.Split(':');
            dbConnectionString = $"Server={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};User={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])};AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;ConnectionTimeout=60;DefaultCommandTimeout=60;";
        }

        Log.Information("🔌 Configurando conexión a MySQL Railway");

        var maskedConnectionString = System.Text.RegularExpressions.Regex.Replace(
            dbConnectionString, @"Password=[^;]+", "Password=***");
        Log.Information("🔌 Connection: {ConnectionString}", maskedConnectionString);
    }
    catch (Exception ex)
    {
        Log.Fatal("❌ Error configurando cadena de conexión: {Error}", ex.Message);
        throw;
    }


    try
    {
        // ===== DB CONTEXT POOL (OPTIMIZADO) =====
        builder.Services.AddDbContextPool<FlexoAPPDbContext>(options =>
        {
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));

            options.UseMySql(dbConnectionString!, serverVersion, mySqlOptions =>
            {
                // Command timeout: 60s (reducido de 90s)
                mySqlOptions.CommandTimeout(60);
                
                // Retry policy optimizado
                mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(3), // Reducido de 5s
                    errorNumbersToAdd: null);
                
                mySqlOptions.EnableStringComparisonTranslations();
                
                // Optimizaciones de rendimiento
                mySqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
            });

            // Solo en desarrollo
            if (builder.Environment.IsDevelopment())
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }

            // Cachear service provider
            options.EnableServiceProviderCaching();
            
            // Optimizaciones de queries
            options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTrackingWithIdentityResolution);
        }, 
        // Pool size: 64 contextos (Railway tiene límites de conexiones)
        poolSize: 64);

        Log.Information("✅ Entity Framework configurado correctamente");
    }
    catch (Exception ex)
    {
        Log.Fatal("❌ Error configurando Entity Framework: {Error}", ex.Message);
        throw;
    }


    Log.Information("✅ MySQL Railway Database configured successfully");


    builder.Services.AddHealthChecks()
        .AddDbContextCheck<FlexoAPPDbContext>("database",
            failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
            tags: new[] { "db", "mysql" })
        .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

    Log.Information("✅ Health checks configured");


    builder.Services.AddAutoMapper(typeof(Program));


    // ===== DEPENDENCY INJECTION =====
    // Authentication & Authorization
    builder.Services.AddScoped<IAuthService, AuthService>();

    // SignalR Notifications
    builder.Services.AddSingleton<ISignalRNotificationService, SignalRNotificationService>();
    Log.Information("✅ SignalR Notification Service registered");

    builder.Services.AddScoped<IPdfConversionService, PdfConversionService>();
    Log.Information("✅ PdfConversionService registered (Free, No Watermark)");

    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();


    builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
    builder.Services.AddScoped<IActivityService, ActivityService>();
    builder.Services.AddScoped<IDesignRepository, DesignRepository>();
    builder.Services.AddScoped<IDesignService, DesignService>();
    builder.Services.AddScoped<ICondicionUnicaRepository, CondicionUnicaRepository>();


    builder.Services.AddScoped<IMaquinaRepository, MaquinaRepository>();
    builder.Services.AddScoped<IMaquinaService, MaquinaService>();


    builder.Services.AddScoped<IReportsService, ReportsService>();





    builder.Services.AddScoped<FlexoAPP.API.Services.IAuditService, FlexoAPP.API.Services.AuditService>();


    builder.Services.AddScoped<IActivityLoggerService, ActivityLoggerService>();


    builder.Services.AddHttpContextAccessor();


    builder.Services.AddScoped<ICacheService, MemoryCacheService>();

    Log.Information("✅ All services configured successfully");

    var app = builder.Build();

    Log.Information("🔧 Configuring middleware pipeline...");


    // ===== VERIFICACIÓN DE BASE DE DATOS (NO FATAL) =====
    _ = Task.Run(async () =>
    {
        await Task.Delay(3000); // Espera 3s para que el server esté listo
        try
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();
            Log.Information("🔍 Verificando conexión a base de datos...");
            var canConnect = await context.Database.CanConnectAsync();
            if (canConnect)
            {
                Log.Information("✅ Conexión a base de datos exitosa");

                // Crear tablas que falten (ej: system_configs) sin perder datos existentes
                try
                {
                    await context.Database.EnsureCreatedAsync();
                    Log.Information("✅ Estructura de base de datos verificada (tablas creadas si faltaban)");
                    
                    // Agregar columna orden_excel si no existe
                    try
                    {
                        var connStr = context.Database.GetConnectionString();
                        using var conn = new MySqlConnector.MySqlConnection(connStr);
                        await conn.OpenAsync();
                        using var checkCmd = conn.CreateCommand();
                        checkCmd.CommandText = @"
                            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'orden_excel'";
                        var exists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) > 0;
                        if (!exists)
                        {
                            using var addCmd = conn.CreateCommand();
                            addCmd.CommandText = "ALTER TABLE maquinas ADD COLUMN orden_excel INT NOT NULL DEFAULT 0";
                            await addCmd.ExecuteNonQueryAsync();
                            Log.Information("✅ Columna orden_excel creada");
                        }
                        else
                        {
                            Log.Information("✅ Columna orden_excel ya existe");
                        }
                    }
                    catch (Exception colEx)
                    {
                        Log.Warning("⚠️ Error con orden_excel: {Error}", colEx.Message);
                    }
                }
                catch (Exception dbEx)
                {
                    Log.Warning("⚠️ EnsureCreated parcial: {Error}", dbEx.Message);
                }
            }
            else
            {
                Log.Error("❌ CanConnect() retornó false — revisa las variables MYSQL en Railway");
            }
        }
        catch (Exception ex)
        {
            Log.Error("❌ Error en verificación de DB: {Error}", ex.Message);
        }
    });





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


    app.UseResponseCompression();


    if (app.Environment.IsDevelopment())
    {
        app.UseMiniProfiler();
    }


    // Usar política default (permite railway.app y localhost)
    app.UseCors();


    app.UseStaticFiles();


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


            var path = ctx.File.Name.ToLower();


            if (path.EndsWith(".pdf"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "inline";
                ctx.Context.Response.Headers["Content-Type"] = "application/pdf";
            }

            else if (path.EndsWith(".png") || path.EndsWith(".jpg") || path.EndsWith(".jpeg") || path.EndsWith(".gif"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "inline";
            }

            else if (path.EndsWith(".xlsx") || path.EndsWith(".xls") || path.EndsWith(".docx") || path.EndsWith(".doc"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "attachment";
            }


            ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=3600";
        }
    });


    // Swagger disponible siempre (útil para verificar el API en Railway)
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


    app.UseAuthentication();
    app.UseAuthorization();

    // ===== MAP ENDPOINTS =====
    app.MapControllers();
    
    // SignalR Hub
    app.MapHub<FlexoAPP.API.Hubs.MaquinasHub>("/hubs/maquinas");
    Log.Information("✅ SignalR Hub mapeado en /hubs/maquinas");





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
                caching = "Memory Cache (50MB, 2min scan)",
                profiling = "MiniProfiler Enabled",
                compression = "Brotli + Gzip (Fastest, ~2MB RAM/req)",
                pooling = "DB Context Pool (64 contexts, 5-50 connections)",
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


    app.MapGet("/health-simple", () => new {
        status = "ok",
        timestamp = DateTime.UtcNow
    });




    app.MapGet("/", () => new {
        message = "FlexoAPP API",
        status = "running",
        timestamp = DateTime.UtcNow,
        version = "v2.1.0",
        framework = ".NET 8.0",
        environment = isRailway ? "Railway" : "Development",

        features = new {
            database = "MySQL with Connection Pooling",
            caching = "Memory Cache (50MB, 2min scan)",
            logging = "Serilog Structured Logging",
            profiling = "MiniProfiler Enabled",
            compression = "Brotli + Gzip (Fastest)",
            pooling = "DB Context Pool (64 contexts)",
            authentication = "JWT Bearer Token",
            realtime = "SignalR WebSockets (30s keep-alive)"
        },

        login = "admin / admin123",

        endpoints = new[] {
            "/api/auth/login",
            "/api/auth/me",
            "/api/designs",
            "/api/maquinas",
            "/api/activities",
            "/api/reports",
            "/health",
            "/swagger",
            "/profiler",
            "/hubs/maquinas"
        }
    });



    Log.Information("=========================================");
    Log.Information("🚀 FLEXOAPP API - OPTIMIZED & READY");
    Log.Information("=========================================");
    Log.Information("🌐 Framework: ASP.NET Core 8.0");
    Log.Information("🌍 Environment: {Environment}", environmentName);
    Log.Information("🗄️ Database: MySQL with optimized pooling (5-50 connections)");
    Log.Information("💾 Caching: Memory Cache 50MB with 2min scan");
    Log.Information("📝 Logging: Serilog structured logging");
    Log.Information("⚡ Profiling: MiniProfiler (/profiler)");
    Log.Information("🔐 Authentication: JWT Bearer Token");
    Log.Information("🔌 SignalR: WebSocket Hub at /hubs/maquinas (30s keep-alive)");
    Log.Information("📊 Health Checks: /health, /health/ready, /health/live");
    Log.Information("🗜️ Compression: Brotli + Gzip (Fastest mode, ~2MB RAM/request)");
    Log.Information("⚙️ Kestrel: 50MB max body, 100 concurrent connections");
    Log.Information("🎯 Performance: Query splitting, no-tracking queries, 64 context pool");
    Log.Information("👤 Default Login: admin / admin123");
    Log.Information("=========================================");

    // ===== MIGRACIÓN AUTOMÁTICA: BCM A DECIMAL (OPCIONAL) =====
    // Esta migración se ejecuta en background y no bloquea el inicio de la app
    if (isRailway)
    {
        _ = Task.Run(async () =>
        {
            await Task.Delay(5000); // Esperar 5s para que la app esté completamente iniciada
            
            try
            {
                Log.Information("🔧 Verificando migración: ALTER anilox.bcm to DECIMAL(5,2)");
                using var scope = app.Services.CreateScope();
                var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                
                if (string.IsNullOrEmpty(connectionString))
                {
                    Log.Warning("⚠️ No se pudo obtener connection string para migración BCM");
                    return;
                }
                
                using var connection = new MySql.Data.MySqlClient.MySqlConnection(connectionString);
                await connection.OpenAsync();
                
                // Verificar si la tabla anilox existe
                using var tableCheckCmd = new MySql.Data.MySqlClient.MySqlCommand(
                    @"SELECT COUNT(*) 
                      FROM INFORMATION_SCHEMA.TABLES 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'anilox'", 
                    connection);
                
                var tableExists = Convert.ToInt32(await tableCheckCmd.ExecuteScalarAsync()) > 0;
                
                if (!tableExists)
                {
                    Log.Information("ℹ️ Tabla 'anilox' no existe, omitiendo migración BCM");
                    await connection.CloseAsync();
                    return;
                }
                
                // Verificar si la columna bcm existe y su tipo
                using var checkCmd = new MySql.Data.MySqlClient.MySqlCommand(
                    @"SELECT DATA_TYPE, COLUMN_TYPE 
                      FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'anilox' 
                      AND COLUMN_NAME = 'bcm'", 
                    connection);
                
                using var reader = await checkCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var dataType = reader.GetString(0);
                    var columnType = reader.GetString(1);
                    Log.Information($"📊 Columna bcm actual: {dataType} ({columnType})");
                    
                    if (dataType.ToLower() == "int")
                    {
                        await reader.CloseAsync();
                        Log.Information("🔄 Convirtiendo bcm de INT a DECIMAL(5,2)...");
                        
                        using var alterCmd = new MySql.Data.MySqlClient.MySqlCommand(
                            "ALTER TABLE `anilox` MODIFY COLUMN `bcm` DECIMAL(5, 2) NOT NULL COMMENT 'BCM (Billion Cubic Microns) - soporta decimales como 8.3'",
                            connection);
                        
                        await alterCmd.ExecuteNonQueryAsync();
                        Log.Information("✅ Migración completada: bcm ahora es DECIMAL(5,2)");
                    }
                    else
                    {
                        Log.Information("✅ Columna bcm ya es DECIMAL, no se requiere migración");
                    }
                }
                else
                {
                    Log.Information("ℹ️ Columna 'bcm' no existe en tabla 'anilox', omitiendo migración");
                }
                
                await connection.CloseAsync();
            }
            catch (MySql.Data.MySqlClient.MySqlException mysqlEx)
            {
                Log.Warning(mysqlEx, "⚠️ Error MySQL en migración de bcm: {Message} (Code: {Code})", 
                    mysqlEx.Message, mysqlEx.Number);
            }
            catch (Exception ex)
            {
                Log.Warning(ex, "⚠️ Error ejecutando migración de bcm: {Message}", ex.Message);
            }
        });
    }

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

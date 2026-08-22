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

// En Railway, solo errores para ahorrar recursos
if (isRailway)
{
    logConfig
        .MinimumLevel.Warning()
        .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("Microsoft.AspNetCore.Hosting", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.AspNetCore.SignalR", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("Microsoft.AspNetCore.Http.Connections", Serilog.Events.LogEventLevel.Error)
        .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Error);
}
else
{
    logConfig.MinimumLevel.Information();
}

Log.Logger = logConfig
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .Enrich.FromLogContext()
    .WriteTo.Conditional(_ => !isRailway, wt => wt.File("logs/flexoapp-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"))
    .CreateLogger();

try
{
    Log.Information("🚀 Iniciando FlexoAPP Backend");

    var builder = WebApplication.CreateBuilder(args);

    // ===== DETECTAR ENTORNO RAILWAY =====
    // Ya tenemos isRailway definido arriba, no redeclarar
    var environmentName = isRailway ? "Railway" : "Development";
    
    Log.Debug($"🌍 Entorno detectado: {environmentName}");
    
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

        Log.Debug("🔍 Railway MySQL vars → Host:{Host} Port:{Port} DB:{DB} User:{User}",
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
            Log.Debug("✅ Cadena de conexión Railway configurada desde variables individuales");
        }
        else
        {
            Log.Warning("⚠️ Variables MySQL individuales no encontradas, se usará DATABASE_URL/MYSQL_URL como fallback");
        }
        
        // Configurar URL con el puerto de Railway
        var railwayPort = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        builder.Configuration["Urls"] = $"http://0.0.0.0:{railwayPort}";
        Log.Debug($"✅ Puerto Railway configurado: {railwayPort}");
    }

    // ===== INTEGRACIÓN DE SERILOG =====
    builder.Host.UseSerilog();


    // ===== CONFIGURACIÓN DE KESTREL (OPTIMIZADO) =====
    builder.WebHost.ConfigureKestrel(options =>
    {
        // Límite de body: 30MB — suficiente para Excel
        options.Limits.MaxRequestBodySize = 30 * 1024 * 1024;
        
        // Keep-alive: 30 segundos
        options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(30);
        
        // Request timeout: 1 minuto
        options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(1);
        
        // Conexiones concurrentes reducidas
        options.Limits.MaxConcurrentConnections = 50;
        options.Limits.MaxConcurrentUpgradedConnections = 20;
        
        options.Limits.MaxRequestHeadersTotalSize = 16 * 1024;
        options.Limits.MaxRequestLineSize = 8 * 1024;

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


    // ===== MINIPROFILER (solo desarrollo) =====
    if (!isRailway)
    {
        builder.Services.AddMiniProfiler(options =>
        {
            options.RouteBasePath = "/profiler";
            options.PopupRenderPosition = StackExchange.Profiling.RenderPosition.BottomLeft;
            options.PopupShowTimeWithChildren = true;
            options.PopupShowTrivial = true;
        }).AddEntityFramework();
    }


    // ===== MEMORY CACHE (OPTIMIZADO) =====
    builder.Services.AddMemoryCache(options =>
    {
        // Límite: 25MB para Railway
        options.SizeLimit = 1024 * 1024 * 25;
        
        // Compactar cuando se alcance 75% del límite
        options.CompactionPercentage = 0.25;
        
        // Escanear cada 1 minuto para liberar memoria
        options.ExpirationScanFrequency = TimeSpan.FromMinutes(1);
    });


    // ===== SIGNALR (OPTIMIZADO) =====
    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = !isRailway;
        
        // Keep-alive frecuente para proxies (Railway) y clientes con serverTimeout ampliado
        options.KeepAliveInterval = TimeSpan.FromSeconds(15);
        
        // Debe ser >= 2x keep-alive del cliente; margen para latencia en cloud
        options.ClientTimeoutInterval = TimeSpan.FromMinutes(3);
        
        // Handshake timeout: 15s
        options.HandshakeTimeout = TimeSpan.FromSeconds(15);
        
        // Tamaño máximo de mensaje: 256KB
        options.MaximumReceiveMessageSize = 256 * 1024;
        
        options.StreamBufferCapacity = 5;
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
                    if (!string.IsNullOrEmpty(accessToken) &&
                        (path.StartsWithSegments("/hubs") || path.StartsWithSegments("/api/hubs")))
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

        Log.Debug("🔌 Configurando conexión a MySQL Railway");

        var maskedConnectionString = System.Text.RegularExpressions.Regex.Replace(
            dbConnectionString, @"Password=[^;]+", "Password=***");
        Log.Debug("🔌 Connection: {ConnectionString}", maskedConnectionString);
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
        // Pool size: 16 contextos para Railway (menos conexiones = menos costo)
        poolSize: isRailway ? 16 : 64);

        Log.Debug("✅ Entity Framework configurado correctamente");
    }
    catch (Exception ex)
    {
        Log.Fatal("❌ Error configurando Entity Framework: {Error}", ex.Message);
        throw;
    }


    Log.Debug("✅ MySQL Railway Database configured successfully");


    builder.Services.AddHealthChecks()
        .AddDbContextCheck<FlexoAPPDbContext>("database",
            failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
            tags: new[] { "db", "mysql" })
        .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

    Log.Debug("✅ Health checks configured");


    builder.Services.AddAutoMapper(typeof(Program));


    // ===== DEPENDENCY INJECTION =====
    // Authentication & Authorization
    builder.Services.AddScoped<IAuthService, AuthService>();

    // SignalR Notifications
    builder.Services.AddSingleton<ISignalRNotificationService, SignalRNotificationService>();
    Log.Debug("✅ SignalR Notification Service registered");

    builder.Services.AddScoped<IPdfConversionService, PdfConversionService>();
    Log.Debug("✅ PdfConversionService registered (Free, No Watermark)");

    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IJwtService, JwtService>();


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

    // Rate limiter para login (protección contra fuerza bruta)
    builder.Services.AddSingleton<FlexoAPP.API.Services.Implementations.LoginRateLimiterService>();

    // Limpieza automática de actividades (elimina registros > 60 días cada 12h)
    builder.Services.AddHostedService<FlexoAPP.API.Services.ActivityCleanupService>();

    Log.Debug("✅ All services configured successfully");

    var app = builder.Build();

    Log.Debug("🔧 Configuring middleware pipeline...");


    // ===== VERIFICACIÓN DE BASE DE DATOS (NO FATAL) =====
    _ = Task.Run(async () =>
    {
        await Task.Delay(3000);
        try
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();
            Log.Debug("🔍 Verificando conexión a base de datos...");
            var canConnect = await context.Database.CanConnectAsync();
            if (canConnect)
            {
                Log.Debug("✅ Conexión a base de datos exitosa");

                try
                {
                    await context.Database.EnsureCreatedAsync();
                    Log.Debug("✅ EnsureCreated completado");

                    var connStr = context.Database.GetConnectionString();
                    using var conn = new MySqlConnector.MySqlConnection(connStr);
                    await conn.OpenAsync();

                    // Helper: ejecutar SQL ignorando errores de "ya existe"
                    async Task ExecSafe(string sql, string label)
                    {
                        try
                        {
                            using var cmd = conn.CreateCommand();
                            cmd.CommandText = sql;
                            await cmd.ExecuteNonQueryAsync();
                            Log.Debug($"✅ {label}");
                        }
                        catch (Exception ex) when (ex.Message.Contains("Duplicate") || ex.Message.Contains("already exists") || ex.Message.Contains("1060") || ex.Message.Contains("1061"))
                        {
                            // Ya existe, ignorar
                        }
                        catch (Exception ex)
                        {
                            Log.Warning($"⚠️ {label}: {ex.Message}");
                        }
                    }

                    // Helper: verificar si columna existe
                    async Task<bool> ColumnExists(string table, string column)
                    {
                        using var cmd = conn.CreateCommand();
                        cmd.CommandText = $"SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}'";
                        return Convert.ToInt32(await cmd.ExecuteScalarAsync()) > 0;
                    }

                    // Helper: agregar columna si no existe
                    async Task AddColumnIfNotExists(string table, string column, string definition)
                    {
                        if (!await ColumnExists(table, column))
                        {
                            await ExecSafe($"ALTER TABLE {table} ADD COLUMN {column} {definition}", $"Columna {table}.{column} creada");
                        }
                    }

                    // ===== MIGRACIONES DE COLUMNAS =====

                    // maquinas
                    await AddColumnIfNotExists("maquinas", "orden_excel", "INT NOT NULL DEFAULT 0");
                    await AddColumnIfNotExists("maquinas", "tipo_impresion", "VARCHAR(50) NULL");
                    await AddColumnIfNotExists("maquinas", "metros", "DECIMAL(10,3) NULL DEFAULT 0");
                    await AddColumnIfNotExists("maquinas", "preparando_started_at", "DATETIME NULL");

                    // designs
                    await AddColumnIfNotExists("designs", "ancho_mm", "DECIMAL(10,2) NULL");

                    // cod_tintas
                    await AddColumnIfNotExists("cod_tintas", "carpeta", "VARCHAR(100) NULL AFTER descripcion");
                    await AddColumnIfNotExists("cod_tintas", "estante", "VARCHAR(100) NULL AFTER carpeta");
                    await AddColumnIfNotExists("cod_tintas", "linea_tinta", "VARCHAR(100) NULL AFTER estante");

                    // anilox
                    await AddColumnIfNotExists("anilox", "factor_eficiencia", "DECIMAL(5,2) NULL DEFAULT 35");
                    await AddColumnIfNotExists("anilox", "densidad", "DECIMAL(6,4) NULL DEFAULT 0.885");

                    // ===== ACTIVITIES: COLUMNAS DE LOG DETALLADO =====
                    // CRÍTICO: Si estas columnas faltan, el INSERT de actividades de máquinas falla en silencio
                    // (ActivityLoggerService captura la excepción) y los gráficos del dashboard quedan vacíos.
                    await AddColumnIfNotExists("Activities", "EntityType", "VARCHAR(100) NULL");
                    await AddColumnIfNotExists("Activities", "EntityId", "INT NULL");
                    await AddColumnIfNotExists("Activities", "EntityName", "VARCHAR(200) NULL");
                    await AddColumnIfNotExists("Activities", "Duration", "BIGINT NULL");
                    await AddColumnIfNotExists("Activities", "OldValues", "VARCHAR(2000) NULL");
                    await AddColumnIfNotExists("Activities", "NewValues", "VARCHAR(2000) NULL");

                    // Asegurar que Duration sea BIGINT (ticks) como espera EF Core.
                    // Migraciones manuales antiguas la crearon como TIME(6), lo que rompe el INSERT.
                    try
                    {
                        using var durTypeCmd = conn.CreateCommand();
                        durTypeCmd.CommandText = @"SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Activities' AND COLUMN_NAME = 'Duration'";
                        var durType = (await durTypeCmd.ExecuteScalarAsync()) as string;
                        if (durType != null && !durType.Equals("bigint", StringComparison.OrdinalIgnoreCase))
                        {
                            using var fixDurCmd = conn.CreateCommand();
                            fixDurCmd.CommandText = "ALTER TABLE Activities MODIFY COLUMN Duration BIGINT NULL";
                            await fixDurCmd.ExecuteNonQueryAsync();
                            Log.Debug("✅ Columna Activities.Duration migrada a BIGINT (ticks)");
                        }
                    }
                    catch (Exception durEx)
                    {
                        Log.Warning($"⚠️ Verificando columna Activities.Duration: {durEx.Message}");
                    }

                    // ===== TABLAS AUXILIARES =====

                    await ExecSafe(@"CREATE TABLE IF NOT EXISTS machine_config (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        machine_number INT NOT NULL,
                        config_key VARCHAR(100) NOT NULL,
                        config_value VARCHAR(500) NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_machine_config (machine_number, config_key)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "Tabla machine_config verificada");

                    await ExecSafe(@"CREATE TABLE IF NOT EXISTS maquinas_backup (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        original_id INT NOT NULL,
                        machine_number INT NOT NULL,
                        ot_sap VARCHAR(50),
                        articulo VARCHAR(100),
                        descripcion VARCHAR(500),
                        estado VARCHAR(50),
                        kilos DECIMAL(10,3),
                        metros DECIMAL(10,3),
                        tipo_impresion VARCHAR(50),
                        backup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        backup_reason VARCHAR(100) DEFAULT 'AUTO',
                        INDEX idx_backup_machine (machine_number),
                        INDEX idx_backup_date (backup_date)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "Tabla maquinas_backup verificada");

                    // Eliminar columna colores_data si existe (ya no se usa)
                    try
                    {
                        using var checkColCmd = conn.CreateCommand();
                        checkColCmd.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas_backup' AND COLUMN_NAME = 'colores_data'";
                        if (Convert.ToInt32(await checkColCmd.ExecuteScalarAsync()) > 0)
                        {
                            using var dropColCmd = conn.CreateCommand();
                            dropColCmd.CommandText = "ALTER TABLE maquinas_backup DROP COLUMN colores_data";
                            await dropColCmd.ExecuteNonQueryAsync();
                        }
                    }
                    catch { }

                    await ExecSafe(@"CREATE TABLE IF NOT EXISTS system_configs (
                        id VARCHAR(100) PRIMARY KEY,
                        name VARCHAR(200) NOT NULL,
                        description VARCHAR(500),
                        value VARCHAR(1000) NOT NULL,
                        type VARCHAR(50) DEFAULT 'string',
                        category VARCHAR(100) DEFAULT 'General',
                        options VARCHAR(1000),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "Tabla system_configs verificada");

                    // ===== PERMISOS =====

                    // Verificar si tabla permissions existe
                    using var checkPermsTable = conn.CreateCommand();
                    checkPermsTable.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'permissions'";
                    var permsTableExists = Convert.ToInt32(await checkPermsTable.ExecuteScalarAsync()) > 0;

                    if (permsTableExists)
                    {
                        Log.Information("🔐 Tabla permissions encontrada, verificando permisos...");
                        // Todos los permisos que deben existir
                        var allPerms = new[] {
                            ("users.view", "Ver usuarios", "users", "Permite ver la lista de usuarios"),
                            ("users.create", "Crear usuarios", "users", "Permite crear nuevos usuarios"),
                            ("users.edit", "Editar usuarios", "users", "Permite modificar usuarios"),
                            ("users.delete", "Eliminar usuarios", "users", "Permite eliminar usuarios"),
                            ("system.configure", "Configurar sistema", "system", "Permite modificar configuraciones"),
                            ("permissions.manage", "Gestión de permisos", "system", "Permite administrar permisos"),
                            ("settings.change", "Cambiar ajustes", "system", "Permite modificar ajustes"),
                            ("module.settings", "Módulo configuraciones", "modules", "Acceso a configuraciones"),
                            ("module.reports", "Módulo reportes", "modules", "Acceso a reportes"),
                            ("module.machines", "Módulo máquinas", "modules", "Acceso a máquinas"),
                            ("module.design", "Módulo diseño", "modules", "Acceso a diseño"),
                            ("module.documents", "Módulo documentos", "modules", "Acceso a documentos"),
                            ("module.information", "Módulo información", "modules", "Acceso a información"),
                            ("module.order_query", "Módulo consulta pedido", "modules", "Acceso a consulta de pedido"),
                            ("action.export", "Exportar", "actions", "Permite exportar datos"),
                            ("action.import", "Importar", "actions", "Permite importar datos"),
                            ("action.add_programming", "Agregar programación", "actions", "Permite agregar programaciones"),
                            ("action.create", "Crear", "actions", "Permite crear registros"),
                            ("reports.view", "Ver reportes", "actions", "Permite ver reportes"),
                            ("machines.status.prealistando", "Cambiar a Prealistando", "machines", "Cambiar estado a Prealistando"),
                            ("machines.status.listo", "Cambiar a Listo", "machines", "Cambiar estado a Listo"),
                            ("machines.status.corriendo", "Cambiar a Corriendo", "machines", "Cambiar estado a Corriendo"),
                            ("machines.status.terminado", "Cambiar a Terminado", "machines", "Cambiar estado a Terminado"),
                            ("machines.status.suspendido", "Cambiar a Suspendido", "machines", "Cambiar estado a Suspendido"),
                            ("machines.send_message", "Enviar mensajes", "machines", "Permite enviar mensajes"),
                            ("machines.print", "Imprimir formatos", "machines", "Permite imprimir formatos"),
                            ("design.create", "Crear diseños", "design", "Permite crear nuevos diseños"),
                            ("design.edit", "Editar diseños", "design", "Permite editar diseños"),
                            ("design.delete", "Eliminar diseños", "design", "Permite eliminar diseños"),
                            ("design.import", "Importar diseños", "design", "Permite importar diseños desde Excel"),
                            ("design.export", "Exportar diseños", "design", "Permite exportar diseños a Excel"),
                            ("reports.delete", "Eliminar actividades", "reports", "Permite eliminar registros de actividad")
                        };

                        foreach (var (code, name, category, desc) in allPerms)
                        {
                            using var check = conn.CreateCommand();
                            check.CommandText = $"SELECT COUNT(*) FROM permissions WHERE code = @code";
                            check.Parameters.AddWithValue("@code", code);
                            if (Convert.ToInt32(await check.ExecuteScalarAsync()) == 0)
                            {
                                using var ins = conn.CreateCommand();
                                ins.CommandText = "INSERT INTO permissions (code, name, category, description, is_active) VALUES (@code, @name, @cat, @desc, 1)";
                                ins.Parameters.AddWithValue("@code", code);
                                ins.Parameters.AddWithValue("@name", name);
                                ins.Parameters.AddWithValue("@cat", category);
                                ins.Parameters.AddWithValue("@desc", desc);
                                await ins.ExecuteNonQueryAsync();
                                Log.Debug($"✅ Permiso {code} creado");
                            }
                        }

                        // Otorgar todos los permisos al admin (user_id=1)
                        foreach (var (code, _, _, _) in allPerms)
                        {
                            using var check = conn.CreateCommand();
                            check.CommandText = "SELECT COUNT(*) FROM user_permissions WHERE user_id = 1 AND permission_code = @code";
                            check.Parameters.AddWithValue("@code", code);
                            if (Convert.ToInt32(await check.ExecuteScalarAsync()) == 0)
                            {
                                using var ins = conn.CreateCommand();
                                ins.CommandText = "INSERT INTO user_permissions (user_id, permission_code, is_granted, granted_by) VALUES (1, @code, 1, 1)";
                                ins.Parameters.AddWithValue("@code", code);
                                await ins.ExecuteNonQueryAsync();
                            }
                        }
                        Log.Information("✅ Permisos verificados y admin actualizado ({Count} permisos)", allPerms.Length);
                    }
                    else
                    {
                        Log.Warning("⚠️ Tabla permissions no existe, saltando inserción de permisos");
                    }

                    // ===== MIGRACIÓN BCM A DECIMAL =====
                    try
                    {
                        using var checkBcm = conn.CreateCommand();
                        checkBcm.CommandText = @"SELECT DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'anilox' AND COLUMN_NAME = 'bcm'";
                        using var bcmReader = await checkBcm.ExecuteReaderAsync();
                        if (await bcmReader.ReadAsync())
                        {
                            var dataType = bcmReader.GetString(0);
                            if (dataType.ToLower() == "int")
                            {
                                await bcmReader.CloseAsync();
                                using var alterBcm = conn.CreateCommand();
                                alterBcm.CommandText = "ALTER TABLE anilox MODIFY COLUMN bcm DECIMAL(5,2) NULL";
                                await alterBcm.ExecuteNonQueryAsync();
                                Log.Debug("✅ BCM migrado a DECIMAL(5,2)");
                            }
                        }
                    }
                    catch { }

                    // ===== TABLA PANTONE_COLORS =====
                    await ExecSafe(@"CREATE TABLE IF NOT EXISTS pantone_colors (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        code VARCHAR(50) NOT NULL,
                        name VARCHAR(100) NOT NULL,
                        display_name VARCHAR(100) NOT NULL,
                        hex VARCHAR(10) NOT NULL DEFAULT '#000000',
                        rgb_r INT NOT NULL DEFAULT 0,
                        rgb_g INT NOT NULL DEFAULT 0,
                        rgb_b INT NOT NULL DEFAULT 0,
                        cmyk_c INT NOT NULL DEFAULT 0,
                        cmyk_m INT NOT NULL DEFAULT 0,
                        cmyk_y INT NOT NULL DEFAULT 0,
                        cmyk_k INT NOT NULL DEFAULT 0,
                        lab_l DOUBLE NULL,
                        lab_a DOUBLE NULL,
                        lab_b DOUBLE NULL,
                        category VARCHAR(50) NOT NULL DEFAULT 'Manual',
                        color_type VARCHAR(20) NOT NULL DEFAULT 'pantone',
                        is_custom TINYINT(1) NOT NULL DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_pantone_code (code),
                        INDEX idx_pantone_type (color_type),
                        INDEX idx_pantone_category (category)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "Tabla pantone_colors verificada");

                    // Seed: insertar colores base si la tabla está vacía
                    using var countCmd = conn.CreateCommand();
                    countCmd.CommandText = "SELECT COUNT(*) FROM pantone_colors";
                    var pantoneCount = Convert.ToInt32(await countCmd.ExecuteScalarAsync());
                    if (pantoneCount == 0)
                    {
                        Log.Debug("🎨 Insertando colores Pantone base...");
                        var baseColors = new List<(string code, string name, string display, string hex, int r, int g, int b, int c2, int m, int y, int k, string cat, string type)>
                        {
                            ("Black", " Black", "Negro", "#000000", 0, 0, 0, 0, 0, 0, 100, "Black", "heptacromia"),
                            ("White", " White", "Blanco", "#FFFFFF", 255, 255, 255, 0, 0, 0, 0, "White", "heptacromia"),
                            ("Cyan", " Cyan", "Cyan", "#00AEEF", 0, 174, 239, 100, 0, 0, 0, "Cyan", "heptacromia"),
                            ("Magenta", " Magenta", "Magenta", "#EC008C", 236, 0, 140, 0, 100, 0, 0, "Pink", "heptacromia"),
                            ("Yellow", " Yellow", "Amarillo", "#FFF200", 255, 242, 0, 0, 0, 100, 0, "Yellow", "heptacromia"),
                            ("Green", " Green", "Verde", "#00A651", 0, 166, 81, 100, 0, 51, 35, "Green", "heptacromia"),
                            ("Orange", " Orange", "Naranja", "#FF6900", 255, 105, 0, 0, 59, 100, 0, "Orange", "heptacromia"),
                            ("Violet", " Violet", "Violeta", "#8B3F8F", 139, 63, 143, 3, 56, 0, 44, "Purple", "heptacromia"),
                            ("185", "Pantone 185 C", "P 185", "#E4002B", 228, 0, 43, 0, 100, 81, 11, "Red", "pantone"),
                            ("186", "Pantone 186 C", "P 186", "#CE1126", 206, 17, 38, 0, 92, 82, 19, "Red", "pantone"),
                            ("187", "Pantone 187 C", "P 187", "#A6192E", 166, 25, 46, 0, 85, 72, 35, "Red", "pantone"),
                            ("193", "Pantone 193 C", "P 193", "#BF0D3E", 191, 13, 62, 0, 93, 68, 25, "Red", "pantone"),
                            ("200", "Pantone 200 C", "P 200", "#C4004A", 196, 0, 74, 0, 100, 62, 23, "Red", "pantone"),
                            ("485", "Pantone 485 C", "P 485", "#DA020E", 218, 2, 14, 0, 99, 94, 15, "Red", "pantone"),
                            ("1788", "Pantone 1788 C", "P 1788", "#EE2C2C", 238, 44, 44, 0, 84, 77, 0, "Red", "pantone"),
                            ("1797", "Pantone 1797 C", "P 1797", "#C8102E", 200, 16, 46, 0, 92, 77, 22, "Red", "pantone"),
                            ("210", "Pantone 210 C", "P 210", "#F9A7B0", 249, 167, 176, 0, 42, 17, 0, "Pink", "pantone"),
                            ("212", "Pantone 212 C", "P 212", "#F25278", 242, 82, 120, 0, 73, 35, 0, "Pink", "pantone"),
                            ("012", "Pantone 012 C", "P 012", "#FFD100", 255, 209, 0, 0, 18, 100, 0, "Yellow", "pantone"),
                            ("100", "Pantone 100 C", "P 100", "#F6EB61", 246, 235, 97, 0, 0, 57, 0, "Yellow", "pantone"),
                            ("102", "Pantone 102 C", "P 102", "#FCE300", 252, 227, 0, 0, 0, 95, 0, "Yellow", "pantone"),
                            ("109", "Pantone 109 C", "P 109", "#FFD700", 255, 215, 0, 0, 16, 100, 0, "Yellow", "pantone"),
                            ("116", "Pantone 116 C", "P 116", "#FFCD00", 255, 205, 0, 0, 20, 100, 0, "Yellow", "pantone"),
                            ("123", "Pantone 123 C", "P 123", "#FFC82E", 255, 200, 46, 0, 19, 89, 0, "Yellow", "pantone"),
                            ("1375", "Pantone 1375 C", "P 1375", "#FF9E1B", 255, 158, 27, 0, 38, 89, 0, "Orange", "pantone"),
                            ("1505", "Pantone 1505 C", "P 1505", "#FF6900", 255, 105, 0, 0, 56, 90, 0, "Orange", "pantone"),
                            ("021", "Pantone 021 C", "P 021", "#FE5000", 254, 80, 0, 0, 69, 100, 0, "Orange", "pantone"),
                            ("165", "Pantone 165 C", "P 165", "#FF6A39", 255, 106, 57, 0, 58, 78, 0, "Orange", "pantone"),
                            ("347", "Pantone 347 C", "P 347", "#009639", 0, 150, 57, 100, 0, 62, 41, "Green", "pantone"),
                            ("348", "Pantone 348 C", "P 348", "#00843D", 0, 132, 61, 100, 0, 54, 48, "Green", "pantone"),
                            ("355", "Pantone 355 C", "P 355", "#00B140", 0, 177, 64, 100, 0, 100, 5, "Green", "pantone"),
                            ("356", "Pantone 356 C", "P 356", "#007A33", 0, 122, 51, 100, 0, 58, 52, "Green", "pantone"),
                            ("368", "Pantone 368 C", "P 368", "#64A70B", 100, 167, 11, 40, 0, 93, 35, "Green", "pantone"),
                            ("376", "Pantone 376 C", "P 376", "#84BD00", 132, 189, 0, 55, 0, 100, 5, "Green", "pantone"),
                            ("072", "Pantone 072 C", "P 072", "#10069F", 16, 6, 159, 90, 100, 0, 2, "Blue", "pantone"),
                            ("280", "Pantone 280 C", "P 280", "#012169", 1, 33, 105, 99, 69, 0, 59, "Blue", "pantone"),
                            ("285", "Pantone 285 C", "P 285", "#0072CE", 0, 114, 206, 74, 43, 0, 0, "Blue", "pantone"),
                            ("286", "Pantone 286 C", "P 286", "#0033A0", 0, 51, 160, 100, 68, 0, 37, "Blue", "pantone"),
                            ("293", "Pantone 293 C", "P 293", "#00539F", 0, 83, 159, 100, 48, 0, 38, "Blue", "pantone"),
                            ("300", "Pantone 300 C", "P 300", "#005EB8", 0, 94, 184, 100, 49, 0, 28, "Blue", "pantone"),
                            ("299", "Pantone 299 C", "P 299", "#00A3E0", 0, 163, 224, 100, 27, 0, 12, "Blue", "pantone"),
                            ("2748", "Pantone 2748 C", "P 2748", "#001489", 0, 20, 137, 100, 85, 0, 46, "Blue", "pantone"),
                            ("2925", "Pantone 2925 C", "P 2925", "#009CDE", 0, 156, 222, 100, 30, 0, 13, "Blue", "pantone"),
                            ("2935", "Pantone 2935 C", "P 2935", "#0057B8", 0, 87, 184, 100, 53, 0, 28, "Blue", "pantone"),
                            ("Reflex Blue", "Pantone Reflex Blue", "P Reflex Blue", "#001489", 0, 20, 137, 100, 82, 0, 46, "Blue", "pantone"),
                            ("258", "Pantone 258 C", "P 258", "#8E5294", 142, 82, 148, 4, 45, 0, 42, "Purple", "pantone"),
                            ("268", "Pantone 268 C", "P 268", "#6D2077", 109, 32, 119, 8, 73, 0, 53, "Purple", "pantone"),
                            ("269", "Pantone 269 C", "P 269", "#5C068C", 92, 6, 140, 34, 96, 0, 45, "Purple", "pantone"),
                            ("Cool Gray 5", "Pantone Cool Gray 5 C", "P CG 5", "#B1B3B3", 177, 179, 179, 0, 0, 0, 30, "Gray", "pantone"),
                            ("Cool Gray 7", "Pantone Cool Gray 7 C", "P CG 7", "#97999B", 151, 153, 155, 0, 0, 0, 39, "Gray", "pantone"),
                            ("Cool Gray 9", "Pantone Cool Gray 9 C", "P CG 9", "#75787B", 117, 120, 123, 0, 0, 0, 52, "Gray", "pantone"),
                            ("Cool Gray 11", "Pantone Cool Gray 11 C", "P CG 11", "#53565A", 83, 86, 90, 0, 0, 0, 65, "Gray", "pantone"),
                            ("877", "Pantone 877 C", "P 877", "#8A8D8F", 138, 141, 143, 3, 1, 0, 44, "Metallic", "pantone"),
                            ("871", "Pantone 871 C", "P 871", "#84754E", 132, 117, 78, 0, 11, 41, 48, "Metallic", "pantone"),
                            ("7548", "Pantone 7548 C", "P 7548", "#FFC72C", 255, 199, 44, 0, 22, 91, 0, "Yellow", "pantone"),
                            ("7506", "Pantone 7506 C", "P 7506", "#EFDBB2", 239, 219, 178, 0, 8, 26, 6, "Beige", "pantone"),
                            ("7595", "Pantone 7595 C", "P 7595", "#C4622D", 196, 98, 45, 0, 50, 77, 23, "Brown", "pantone"),
                            ("3405", "Pantone 3405 C", "P 3405", "#00B140", 0, 177, 64, 100, 0, 64, 31, "Green", "pantone"),
                            ("7739", "Pantone 7739 C", "P 7739", "#319B42", 49, 155, 66, 68, 0, 57, 39, "Green", "pantone")
                        };

                        foreach (var (code, name, display, hex, r2, g, b, c3, m2, y2, k2, cat, type) in baseColors)
                        {
                            try
                            {
                                using var ins = conn.CreateCommand();
                                ins.CommandText = @"INSERT INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) 
                                    VALUES (@code, @name, @display, @hex, @r, @g, @b, @c, @m, @y, @k, @cat, @type, 0)";
                                ins.Parameters.AddWithValue("@code", code);
                                ins.Parameters.AddWithValue("@name", name);
                                ins.Parameters.AddWithValue("@display", display);
                                ins.Parameters.AddWithValue("@hex", hex);
                                ins.Parameters.AddWithValue("@r", r2);
                                ins.Parameters.AddWithValue("@g", g);
                                ins.Parameters.AddWithValue("@b", b);
                                ins.Parameters.AddWithValue("@c", c3);
                                ins.Parameters.AddWithValue("@m", m2);
                                ins.Parameters.AddWithValue("@y", y2);
                                ins.Parameters.AddWithValue("@k", k2);
                                ins.Parameters.AddWithValue("@cat", cat);
                                ins.Parameters.AddWithValue("@type", type);
                                await ins.ExecuteNonQueryAsync();
                            }
                            catch { }
                        }
                        Log.Debug("🎨 {Count} colores Pantone base insertados", baseColors.Count);
                    }

                    Log.Information("✅ Migración automática completada");
                }
                catch (Exception dbEx)
                {
                    Log.Warning("⚠️ Error en migración: {Error}", dbEx.Message);
                }
            }
            else
            {
                Log.Error("❌ No se pudo conectar a la base de datos");
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
            var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;

            // Clasificar el error por tipo de excepción
            int statusCode = 500;
            string errorType = "Internal Server Error";
            string userMessage = "Error interno del servidor. Por favor intente nuevamente.";

            switch (exception)
            {
                case UnauthorizedAccessException:
                    statusCode = 401;
                    errorType = "Unauthorized";
                    userMessage = "No autorizado. Por favor inicie sesión nuevamente.";
                    break;
                case KeyNotFoundException:
                    statusCode = 404;
                    errorType = "Not Found";
                    userMessage = "El recurso solicitado no fue encontrado.";
                    break;
                case ArgumentException or ArgumentNullException:
                    statusCode = 400;
                    errorType = "Bad Request";
                    userMessage = "Los datos enviados son inválidos.";
                    break;
                case InvalidOperationException:
                    statusCode = 409;
                    errorType = "Conflict";
                    userMessage = "La operación no se puede realizar en el estado actual.";
                    break;
                case TimeoutException:
                    statusCode = 504;
                    errorType = "Gateway Timeout";
                    userMessage = "La operación tardó demasiado. Intente nuevamente.";
                    break;
                case OperationCanceledException:
                    statusCode = 499;
                    errorType = "Client Closed Request";
                    userMessage = "La solicitud fue cancelada.";
                    break;
                default:
                    // Para errores de EF Core / MySQL
                    if (exception?.InnerException?.Message?.Contains("Duplicate entry") == true)
                    {
                        statusCode = 409;
                        errorType = "Conflict";
                        userMessage = "Ya existe un registro con esos datos.";
                    }
                    else if (exception?.InnerException?.Message?.Contains("Cannot delete or update a parent row") == true)
                    {
                        statusCode = 409;
                        errorType = "Conflict";
                        userMessage = "No se puede eliminar porque tiene registros relacionados.";
                    }
                    break;
            }

            // Logging con contexto completo
            Log.Error(exception,
                "❌ [{StatusCode} {ErrorType}] {Method} {Path} - {UserMessage}",
                statusCode, errorType, context.Request.Method, context.Request.Path, userMessage);

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = new
            {
                success = false,
                error = errorType,
                message = userMessage,
                // Solo incluir detalles técnicos en desarrollo
                details = app.Environment.IsDevelopment() ? exception?.Message : null,
                path = context.Request.Path.Value,
                method = context.Request.Method,
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


    var contentRoot = Directory.GetCurrentDirectory();
    var uploadsPath = Path.Combine(contentRoot, "uploads");
    var wwwrootUploadsPath = Path.Combine(contentRoot, "wwwroot", "uploads");
    Directory.CreateDirectory(Path.Combine(uploadsPath, "profiles"));

    var uploadProviders = new List<Microsoft.Extensions.FileProviders.IFileProvider>();
    if (Directory.Exists(uploadsPath))
        uploadProviders.Add(new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath));
    if (Directory.Exists(wwwrootUploadsPath))
        uploadProviders.Add(new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootUploadsPath));

    if (uploadProviders.Count == 0)
        uploadProviders.Add(new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath));

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = uploadProviders.Count == 1
            ? uploadProviders[0]
            : new Microsoft.Extensions.FileProviders.CompositeFileProvider(uploadProviders),
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

            else if (path.EndsWith(".xlsx") || path.EndsWith(".xls") || path.EndsWith(".xlsm") || path.EndsWith(".docx") || path.EndsWith(".doc"))
            {
                ctx.Context.Response.Headers["Content-Disposition"] = "attachment";
            }


            ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=3600";
        }
    });


    // Swagger solo en desarrollo
    if (!isRailway)
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


    app.UseAuthentication();
    app.UseAuthorization();

    // ===== MAP ENDPOINTS =====
    app.MapControllers();
    
    // SignalR Hub (ruta canónica + alias /api para clientes que usan el prefijo del API REST)
    app.MapHub<FlexoAPP.API.Hubs.MaquinasHub>("/hubs/maquinas");
    app.MapHub<FlexoAPP.API.Hubs.MaquinasHub>("/api/hubs/maquinas");
    Log.Debug("✅ SignalR Hub: /hubs/maquinas y /api/hubs/maquinas");





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
            "/hubs/maquinas",
            "/api/hubs/maquinas"
        }
    });



    Log.Debug("=========================================");
    Log.Debug("🚀 FLEXOAPP API - OPTIMIZED & READY");
    Log.Debug("=========================================");
    Log.Debug("🌐 Framework: ASP.NET Core 8.0");
    Log.Debug("🌍 Environment: {Environment}", environmentName);
    Log.Debug("🗄️ Database: MySQL with optimized pooling (5-50 connections)");
    Log.Debug("💾 Caching: Memory Cache 50MB with 2min scan");
    Log.Debug("📝 Logging: Serilog structured logging");
    Log.Debug("⚡ Profiling: MiniProfiler (/profiler)");
    Log.Debug("🔐 Authentication: JWT Bearer Token");
    Log.Debug("🔌 SignalR: WebSocket Hub at /hubs/maquinas (30s keep-alive)");
    Log.Debug("📊 Health Checks: /health, /health/ready, /health/live");
    Log.Debug("🗜️ Compression: Brotli + Gzip (Fastest mode, ~2MB RAM/request)");
    Log.Debug("⚙️ Kestrel: 50MB max body, 100 concurrent connections");
    Log.Debug("🎯 Performance: Query splitting, no-tracking queries, 64 context pool");
    Log.Debug("👤 Default Login: admin / admin123");
    Log.Debug("=========================================");

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

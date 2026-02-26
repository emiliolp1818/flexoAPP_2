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
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("🚀 Iniciando FlexoAPP Backend");

    var builder = WebApplication.CreateBuilder(args);

    // ===== DETECTAR ENTORNO RAILWAY =====
    var isRailway = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT"));
    var environmentName = isRailway ? "Railway" : "Development";
    
    Log.Information($"🌍 Entorno detectado: {environmentName}");
    
    // Cargar configuración específica del entorno
    if (isRailway)
    {
        builder.Configuration.AddJsonFile("appsettings.Railway.json", optional: true, reloadOnChange: true);
        
        // Reemplazar variables de entorno en la cadena de conexión
        var railwayConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(railwayConnectionString))
        {
            railwayConnectionString = railwayConnectionString
                .Replace("${MYSQL_HOST}", Environment.GetEnvironmentVariable("MYSQL_HOST"))
                .Replace("${MYSQL_PORT}", Environment.GetEnvironmentVariable("MYSQL_PORT"))
                .Replace("${MYSQL_DATABASE}", Environment.GetEnvironmentVariable("MYSQL_DATABASE"))
                .Replace("${MYSQL_USER}", Environment.GetEnvironmentVariable("MYSQL_USER"))
                .Replace("${MYSQL_PASSWORD}", Environment.GetEnvironmentVariable("MYSQL_PASSWORD"));
            
            builder.Configuration["ConnectionStrings:DefaultConnection"] = railwayConnectionString;
            Log.Information("✅ Cadena de conexión Railway configurada");
        }
        
        // Configurar URL con el puerto de Railway
        var railwayPort = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        builder.Configuration["Urls"] = $"http://0.0.0.0:{railwayPort}";
        Log.Information($"✅ Puerto Railway configurado: {railwayPort}");
    }

    // ===== INTEGRACIÓN DE SERILOG =====
    builder.Host.UseSerilog();


    // ===== CONFIGURACIÓN DE KESTREL =====
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.Limits.MaxRequestBodySize = 524_288_000;
        options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);

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


    builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
    {
        options.MultipartBodyLengthLimit = 524_288_000;
        options.ValueLengthLimit = 524_288_000;
        options.MultipartHeadersLengthLimit = 524_288_000;
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


    builder.Services.AddMemoryCache(options =>
    {
        options.SizeLimit = 1024 * 1024 * 100;
        options.CompactionPercentage = 0.25;
        options.ExpirationScanFrequency = TimeSpan.FromMinutes(5);
    });


    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = true;
        options.KeepAliveInterval = TimeSpan.FromMinutes(1);
        options.ClientTimeoutInterval = TimeSpan.FromMinutes(5);
        options.HandshakeTimeout = TimeSpan.FromMinutes(1);
        options.MaximumReceiveMessageSize = 1024 * 1024;
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
        dbConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                          ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                          ?? builder.Configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(dbConnectionString))
        {
            throw new InvalidOperationException("No se encontró cadena de conexión a la base de datos");
        }

        if (dbConnectionString.StartsWith("mysql://"))
        {
            var uri = new Uri(dbConnectionString);
            var userInfo = uri.UserInfo.Split(':');
            dbConnectionString = $"Server={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};User={userInfo[0]};Password={userInfo[1]};AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;ConnectionTimeout=60;DefaultCommandTimeout=60;";
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
        builder.Services.AddDbContextPool<FlexoAPPDbContext>(options =>
        {

            var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));

            options.UseMySql(dbConnectionString!, serverVersion, mySqlOptions =>
            {
                mySqlOptions.CommandTimeout(90);
                mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null);
                mySqlOptions.EnableStringComparisonTranslations();
            });


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


    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();
            Log.Information("🔍 Verificando conexión a base de datos...");


            await context.Database.CanConnectAsync();
            Log.Information("✅ Conexión a base de datos exitosa");


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


    app.MapGet("/health-simple", () => new {
        status = "ok",
        timestamp = DateTime.UtcNow
    });




    app.MapGet("/", () => new {
        message = "FlexoAPP API",
        status = "running",
        timestamp = DateTime.UtcNow,
        version = "v2.0.0",
        framework = ".NET 8.0",
        environment = isRailway ? "Railway" : "Development",

        features = new {
            database = "MySQL with Connection Pooling",
            caching = "Memory Cache",
            logging = "Serilog Structured Logging",
            profiling = "MiniProfiler Enabled",
            compression = "Brotli + Gzip Enabled",
            authentication = "JWT Bearer Token",
            realtime = "SignalR WebSockets"
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


    try
    {

        await FlexoAPP.API.Data.SeedData.InitializeAsync(app.Services);
        Log.Information("✅ Base de datos inicializada con datos esenciales");
    }
    catch (Exception ex)
    {
        Log.Warning("⚠️ No se pudieron inicializar los datos esenciales: {Error}", ex.Message);
    }


    Log.Information("=========================================");
    Log.Information("🚀 FLEXOAPP API - READY");
    Log.Information("=========================================");
    Log.Information("🌐 Framework: ASP.NET Core 8.0");
    Log.Information("🌍 Environment: {Environment}", environmentName);
    Log.Information("🗄️ Database: MySQL with connection pooling");
    Log.Information("💾 Caching: Memory Cache with 100MB limit");
    Log.Information("📝 Logging: Serilog with structured logging");
    Log.Information("⚡ Profiling: MiniProfiler enabled (/profiler)");
    Log.Information("🔐 Authentication: JWT Bearer Token");
    Log.Information("🔌 SignalR: WebSocket Hub at /hubs/maquinas");
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

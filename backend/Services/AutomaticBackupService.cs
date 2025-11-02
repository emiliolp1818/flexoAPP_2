using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Servicio de backup automático que se ejecuta en segundo plano
    /// </summary>
    public class AutomaticBackupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AutomaticBackupService> _logger;
        private readonly TimeSpan _backupInterval = TimeSpan.FromHours(24); // Backup diario
        private readonly TimeSpan _initialDelay = TimeSpan.FromMinutes(5); // Esperar 5 minutos al inicio

        public AutomaticBackupService(
            IServiceProvider serviceProvider,
            ILogger<AutomaticBackupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🔄 Servicio de backup automático iniciado");

            // Esperar un poco antes del primer backup
            await Task.Delay(_initialDelay, stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformAutomaticBackup();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error en backup automático");
                }

                // Esperar hasta el próximo backup
                await Task.Delay(_backupInterval, stoppingToken);
            }

            _logger.LogInformation("🛑 Servicio de backup automático detenido");
        }

        private async Task PerformAutomaticBackup()
        {
            using var scope = _serviceProvider.CreateScope();
            var backupService = scope.ServiceProvider.GetRequiredService<IMachineBackupService>();

            try
            {
                _logger.LogInformation("🔄 Iniciando backup automático diario...");

                var backupRequest = new MachineBackupRequestDto
                {
                    Description = $"Backup automático diario - {DateTime.Now:yyyy-MM-dd HH:mm:ss}",
                    IncludeAllMachines = true,
                    CreateCompressedBackup = true,
                    RetentionDays = 30 // Mantener backups por 30 días
                };

                var result = await backupService.CreateDailyBackupAsync();

                if (result.Success)
                {
                    _logger.LogInformation("✅ Backup automático completado exitosamente: {BackupId}", result.BackupId);
                    
                    // Limpiar backups antiguos
                    await CleanupOldBackups(backupService);
                }
                else
                {
                    _logger.LogWarning("⚠️ Backup automático falló: {Message}", result.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error crítico en backup automático");
            }
        }

        private async Task CleanupOldBackups(IMachineBackupService backupService)
        {
            try
            {
                _logger.LogInformation("🧹 Limpiando backups antiguos...");

                var backups = await backupService.GetBackupsListAsync();
                var cutoffDate = DateTime.Now.AddDays(-30); // Eliminar backups más antiguos de 30 días

                var oldBackups = backups.Where(b => b.CreatedAt < cutoffDate).ToList();

                foreach (var oldBackup in oldBackups)
                {
                    try
                    {
                        var deleted = await backupService.DeleteBackupAsync(oldBackup.BackupId);
                        if (deleted)
                        {
                            _logger.LogInformation("🗑️ Backup antiguo eliminado: {BackupId}", oldBackup.BackupId);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "⚠️ No se pudo eliminar backup antiguo: {BackupId}", oldBackup.BackupId);
                    }
                }

                _logger.LogInformation("✅ Limpieza de backups completada. {Count} backups eliminados", oldBackups.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en limpieza de backups antiguos");
            }
        }

        public override async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🚀 Iniciando servicio de backup automático...");
            await base.StartAsync(cancellationToken);
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 Deteniendo servicio de backup automático...");
            await base.StopAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Extensiones para registrar el servicio de backup automático
    /// </summary>
    public static class AutomaticBackupServiceExtensions
    {
        public static IServiceCollection AddAutomaticBackupService(this IServiceCollection services)
        {
            services.AddHostedService<AutomaticBackupService>();
            return services;
        }
    }
}
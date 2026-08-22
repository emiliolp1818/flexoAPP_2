using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using FlexoAPP.API.Data.Context;

namespace FlexoAPP.API.Services
{
    public class ActivityCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ActivityCleanupService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromHours(12); // Ejecuta cada 12 horas
        private const int RetentionDays = 90; // Mantener solo 3 meses de datos

        public ActivityCleanupService(IServiceProvider serviceProvider, ILogger<ActivityCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🧹 Servicio de limpieza de actividades iniciado (retención: {Days} días)", RetentionDays);

            // Esperar 30 segundos al iniciar para que la app se estabilice
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupOldActivitiesAsync();
                    await Task.Delay(_period, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error en limpieza de actividades");
                    await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
                }
            }
        }

        private async Task CleanupOldActivitiesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();

            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-RetentionDays);

                // Eliminar actividades más antiguas que 3 meses
                var deleted = await context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM Activities WHERE Timestamp < {0}", cutoffDate);

                if (deleted > 0)
                {
                    _logger.LogInformation("🧹 Limpieza completada: {Count} actividades eliminadas (anteriores a {Date:yyyy-MM-dd})",
                        deleted, cutoffDate);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando actividades antiguas");
            }
        }
    }
}

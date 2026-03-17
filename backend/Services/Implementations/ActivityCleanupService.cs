using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FlexoAPP.API.Services
{
    public class ActivityCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ActivityCleanupService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromHours(6);

        public ActivityCleanupService(IServiceProvider serviceProvider, ILogger<ActivityCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Servicio de limpieza de actividades iniciado");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredActivitiesAsync();
                    await Task.Delay(_period, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Servicio de limpieza de actividades detenido");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error en el servicio de limpieza de actividades");
                    await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
                }
            }
        }

        private async Task CleanupExpiredActivitiesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var activityService = scope.ServiceProvider.GetRequiredService<IActivityService>();

            try
            {


                await activityService.GetAllActivitiesAsync(1);

                _logger.LogInformation("Limpieza automática de actividades ejecutada correctamente");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la limpieza automática de actividades");
            }
        }
    }
}
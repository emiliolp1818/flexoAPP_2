using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Repositories;

namespace FlexoAPP.API.Services
{
    public class ActivityService : IActivityService
    {
        private readonly IActivityRepository _activityRepository;
        private readonly IUserRepository _userRepository;

        public ActivityService(IActivityRepository activityRepository, IUserRepository userRepository)
        {
            _activityRepository = activityRepository;
            _userRepository = userRepository;
        }

        public async Task<List<ActivityDto>> GetUserActivitiesAsync(int userId, int limit = 50)
        {
            // Limpiar actividades expiradas antes de obtener la lista
            await CleanupExpiredActivitiesAsync();
            
            var activities = await _activityRepository.GetUserActivitiesAsync(userId, limit);
            return activities.Select(MapToDto).ToList();
        }

        public async Task<List<ActivityDto>> GetAllActivitiesAsync(int limit = 100)
        {
            // Limpiar actividades expiradas antes de obtener la lista
            await CleanupExpiredActivitiesAsync();
            
            var activities = await _activityRepository.GetAllActivitiesAsync(limit);
            return activities.Select(MapToDto).ToList();
        }

        public async Task<ActivityDto> LogActivityAsync(int userId, string action, string description, string module, string? details = null, string? ipAddress = null)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            var activity = new Activity
            {
                UserId = userId,
                UserCode = user?.UserCode,
                Action = action,
                Description = description,
                Module = module,
                Details = details,
                IpAddress = ipAddress,
                Timestamp = DateTime.UtcNow
            };

            var createdActivity = await _activityRepository.CreateActivityAsync(activity);
            return MapToDto(createdActivity);
        }

        public async Task<bool> DeleteActivityAsync(int id)
        {
            return await _activityRepository.DeleteAsync(id);
        }

        private static ActivityDto MapToDto(Activity activity)
        {
            var expirationDate = activity.Timestamp.AddDays(30);
            var daysRemaining = (int)(expirationDate - DateTime.UtcNow).TotalDays;
            
            return new ActivityDto
            {
                Id = activity.Id,
                Action = activity.Action,
                Description = activity.Description,
                Timestamp = activity.Timestamp,
                Module = activity.Module,
                Details = activity.Details,
                UserId = activity.UserId,
                UserCode = activity.UserCode,
                IpAddress = activity.IpAddress,
                DaysRemaining = Math.Max(0, daysRemaining),
                ExpirationDate = expirationDate,
                IsExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
            };
        }

        private async Task CleanupExpiredActivitiesAsync()
        {
            try
            {
                // Obtener actividades que han pasado 30 días
                var expiredActivities = await _activityRepository.GetExpiredActivitiesAsync();
                
                foreach (var activity in expiredActivities)
                {
                    await _activityRepository.DeleteAsync(activity.Id);
                    Console.WriteLine($"Actividad expirada eliminada: ID {activity.Id}, Acción: {activity.Action}, Fecha: {activity.Timestamp}");
                }

                if (expiredActivities.Count > 0)
                {
                    Console.WriteLine($"Limpieza automática completada: {expiredActivities.Count} actividades eliminadas");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en limpieza automática de actividades: {ex.Message}");
            }
        }
    }
}
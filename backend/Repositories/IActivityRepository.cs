using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    public interface IActivityRepository
    {
        Task<List<Activity>> GetUserActivitiesAsync(int userId, int limit = 50);
        Task<List<Activity>> GetAllActivitiesAsync(int limit = 100);
        Task<Activity> CreateActivityAsync(Activity activity);
        Task<Activity?> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<List<Activity>> GetExpiredActivitiesAsync();
    }
}
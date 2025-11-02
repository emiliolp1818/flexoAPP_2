using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    public interface IActivityService
    {
        Task<List<ActivityDto>> GetUserActivitiesAsync(int userId, int limit = 50);
        Task<List<ActivityDto>> GetAllActivitiesAsync(int limit = 100);
        Task<ActivityDto> LogActivityAsync(int userId, string action, string description, string module, string? details = null, string? ipAddress = null);
        Task<bool> DeleteActivityAsync(int id);
    }
}
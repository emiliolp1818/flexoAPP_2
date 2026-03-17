using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUserCodeAsync(string userCode);
        Task<User?> GetByIdAsync(int id);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> UserCodeExistsAsync(string userCode);
    }
}
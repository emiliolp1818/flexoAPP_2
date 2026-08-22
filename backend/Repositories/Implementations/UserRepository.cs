using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Helpers;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly FlexoAPPDbContext _context;

        public UserRepository(FlexoAPPDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByUserCodeAsync(string userCode)
        {
            // Console.WriteLine($"UserRepository: Looking for user with code: {userCode}");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserCode == userCode && u.IsActive);

            if (user != null)
            {
                // Console.WriteLine($"UserRepository: Found user - ID: {user.Id}, Active: {user.IsActive}");
            }
            else
            {
                // Console.WriteLine($"UserRepository: User not found or inactive: {userCode}");


                var inactiveUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserCode == userCode);

                if (inactiveUser != null)
                {
                    // Console.WriteLine($"UserRepository: User exists but is inactive - ID: {inactiveUser.Id}, Active: {inactiveUser.IsActive}");
                }
            }

            return user;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .OrderBy(u => u.IsActive ? 0 : 1)
                .ThenBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();
        }

        public async Task<User> CreateAsync(User user)
        {
            user.CreatedAt = DateTimeHelper.Now;
            user.UpdatedAt = DateTimeHelper.Now;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            user.UpdatedAt = DateTimeHelper.Now;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }







        public async Task<bool> DeleteAsync(int id)
        {

            var user = await GetByIdAsync(id);
            if (user == null) return false;


            _context.Users.Remove(user);


            await _context.SaveChangesAsync();


            // Console.WriteLine($"✅ Usuario eliminado de la BD: ID={id}, UserCode={user.UserCode}");

            return true;
        }

        public async Task<bool> UserCodeExistsAsync(string userCode)
        {
            return await _context.Users
                .AnyAsync(u => u.UserCode == userCode);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        private readonly FlexoAPPDbContext _context;

        public ActivityRepository(FlexoAPPDbContext context)
        {
            _context = context;
        }

        public async Task<List<Activity>> GetUserActivitiesAsync(int userId, int limit = 50)
        {
            return await _context.Activities
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetAllActivitiesAsync(int limit = 100)
        {
            return await _context.Activities
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<Activity> CreateActivityAsync(Activity activity)
        {
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();
            return activity;
        }

        public async Task<Activity?> GetByIdAsync(int id)
        {
            return await _context.Activities
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return false;

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Activity>> GetExpiredActivitiesAsync()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
            return await _context.Activities
                .Where(a => a.Timestamp <= thirtyDaysAgo)
                .OrderBy(a => a.Timestamp)
                .ToListAsync();
        }
    }
}
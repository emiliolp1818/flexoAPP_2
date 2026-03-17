using System;
using System.Threading.Tasks;

namespace FlexoAPP.API.Services
{



    public interface ICacheService
    {



        Task<T?> GetAsync<T>(string key) where T : class;




        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class;




        Task RemoveAsync(string key);




        Task RemoveByPatternAsync(string pattern);




        Task<bool> ExistsAsync(string key);




        Task<CacheStatistics> GetStatisticsAsync();




        Task ClearAllAsync();
    }




    public class CacheStatistics
    {
        public long TotalKeys { get; set; }
        public long HitCount { get; set; }
        public long MissCount { get; set; }
        public double HitRate => TotalRequests > 0 ? (double)HitCount / TotalRequests * 100 : 0;
        public long TotalRequests => HitCount + MissCount;
        public string CacheType { get; set; } = string.Empty;
        public long MemoryUsage { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
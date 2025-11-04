using System;
using System.Threading.Tasks;

namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Interface for caching service with Redis and Memory cache support
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Get cached value by key
        /// </summary>
        Task<T?> GetAsync<T>(string key) where T : class;

        /// <summary>
        /// Set cached value with expiration
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class;

        /// <summary>
        /// Remove cached value by key
        /// </summary>
        Task RemoveAsync(string key);

        /// <summary>
        /// Remove cached values by pattern
        /// </summary>
        Task RemoveByPatternAsync(string pattern);

        /// <summary>
        /// Check if key exists in cache
        /// </summary>
        Task<bool> ExistsAsync(string key);

        /// <summary>
        /// Get cache statistics
        /// </summary>
        Task<CacheStatistics> GetStatisticsAsync();

        /// <summary>
        /// Clear all cache
        /// </summary>
        Task ClearAllAsync();
    }

    /// <summary>
    /// Cache statistics model
    /// </summary>
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
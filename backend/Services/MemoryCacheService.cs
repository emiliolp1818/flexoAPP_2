using Microsoft.Extensions.Caching.Memory;
using FlexoAPP.API.Services;
using System.Collections.Concurrent;
using System.Text.RegularExpressions;

namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Memory cache implementation of cache service
    /// </summary>
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<MemoryCacheService> _logger;
        private readonly TimeSpan _defaultExpiration;
        private readonly ConcurrentDictionary<string, DateTime> _keyTracker;
        private static long _hitCount = 0;
        private static long _missCount = 0;

        public MemoryCacheService(
            IMemoryCache memoryCache,
            ILogger<MemoryCacheService> logger,
            IConfiguration configuration)
        {
            _memoryCache = memoryCache;
            _logger = logger;
            _defaultExpiration = configuration.GetValue<TimeSpan>("Caching:DefaultExpiration", TimeSpan.FromMinutes(30));
            _keyTracker = new ConcurrentDictionary<string, DateTime>();
        }

        public Task<T?> GetAsync<T>(string key) where T : class
        {
            try
            {
                if (_memoryCache.TryGetValue(key, out T? cachedValue) && cachedValue != null)
                {
                    Interlocked.Increment(ref _hitCount);
                    _logger.LogDebug("Memory Cache HIT for key: {Key}", key);
                    return Task.FromResult<T?>(cachedValue);
                }

                Interlocked.Increment(ref _missCount);
                _logger.LogDebug("Memory Cache MISS for key: {Key}", key);
                return Task.FromResult<T?>(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting memory cache value for key: {Key}", key);
                Interlocked.Increment(ref _missCount);
                return Task.FromResult<T?>(null);
            }
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class
        {
            try
            {
                var options = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiration ?? _defaultExpiration,
                    Priority = CacheItemPriority.Normal
                };

                // Add removal callback to track keys
                options.RegisterPostEvictionCallback((evictedKey, evictedValue, reason, state) =>
                {
                    _keyTracker.TryRemove(evictedKey.ToString()!, out _);
                });

                _memoryCache.Set(key, value, options);
                _keyTracker.TryAdd(key, DateTime.UtcNow);
                
                _logger.LogDebug("Memory Cache SET for key: {Key}, expiration: {Expiration}", key, expiration ?? _defaultExpiration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting memory cache value for key: {Key}", key);
            }

            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            try
            {
                _memoryCache.Remove(key);
                _keyTracker.TryRemove(key, out _);
                _logger.LogDebug("Memory Cache REMOVE for key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing memory cache value for key: {Key}", key);
            }

            return Task.CompletedTask;
        }

        public Task RemoveByPatternAsync(string pattern)
        {
            try
            {
                var regex = new Regex(pattern.Replace("*", ".*"), RegexOptions.IgnoreCase);
                var keysToRemove = _keyTracker.Keys.Where(key => regex.IsMatch(key)).ToList();

                foreach (var key in keysToRemove)
                {
                    _memoryCache.Remove(key);
                    _keyTracker.TryRemove(key, out _);
                }

                _logger.LogDebug("Memory Cache REMOVE BY PATTERN: {Pattern}, removed {Count} keys", pattern, keysToRemove.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing memory cache values by pattern: {Pattern}", pattern);
            }

            return Task.CompletedTask;
        }

        public Task<bool> ExistsAsync(string key)
        {
            try
            {
                return Task.FromResult(_keyTracker.ContainsKey(key));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking memory cache key existence: {Key}", key);
                return Task.FromResult(false);
            }
        }

        public Task<CacheStatistics> GetStatisticsAsync()
        {
            try
            {
                // Clean up expired keys from tracker
                var now = DateTime.UtcNow;
                var expiredKeys = _keyTracker
                    .Where(kvp => now - kvp.Value > _defaultExpiration)
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var expiredKey in expiredKeys)
                {
                    _keyTracker.TryRemove(expiredKey, out _);
                }

                // Estimate memory usage (rough calculation)
                var estimatedMemoryUsage = _keyTracker.Count * 1024; // Rough estimate: 1KB per cached item

                return Task.FromResult(new CacheStatistics
                {
                    TotalKeys = _keyTracker.Count,
                    HitCount = _hitCount,
                    MissCount = _missCount,
                    CacheType = "Memory",
                    MemoryUsage = estimatedMemoryUsage,
                    LastUpdated = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting memory cache statistics");
                return Task.FromResult(new CacheStatistics
                {
                    TotalKeys = -1,
                    HitCount = _hitCount,
                    MissCount = _missCount,
                    CacheType = "Memory (Error)",
                    LastUpdated = DateTime.UtcNow
                });
            }
        }

        public Task ClearAllAsync()
        {
            try
            {
                var keysToRemove = _keyTracker.Keys.ToList();
                
                foreach (var key in keysToRemove)
                {
                    _memoryCache.Remove(key);
                }
                
                _keyTracker.Clear();
                _logger.LogInformation("Memory Cache CLEAR ALL: removed {Count} keys", keysToRemove.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing all memory cache");
            }

            return Task.CompletedTask;
        }
    }
}
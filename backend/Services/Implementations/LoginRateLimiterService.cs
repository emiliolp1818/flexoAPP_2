using System.Collections.Concurrent;

namespace FlexoAPP.API.Services.Implementations
{
    public class LoginRateLimiterService
    {
        private static readonly ConcurrentDictionary<string, int> _attempts = new();
        private static readonly ConcurrentDictionary<string, DateTime> _lockouts = new();
        private const int MaxAttempts = 3;
        private const int LockoutMinutes = 5;

        public (bool IsLocked, int SecondsRemaining) IsLockedOut(string key)
        {
            if (_lockouts.TryGetValue(key, out var lockUntil))
            {
                var remaining = (lockUntil - DateTime.UtcNow).TotalSeconds;
                if (remaining > 0)
                {
                    return (true, (int)Math.Ceiling(remaining));
                }
                // Expiró, limpiar
                _lockouts.TryRemove(key, out _);
                _attempts.TryRemove(key, out _);
            }
            return (false, 0);
        }

        public (bool IsLocked, int AttemptsRemaining, int LockSeconds) RegisterFailedAttempt(string key)
        {
            var attempts = _attempts.AddOrUpdate(key, 1, (_, current) => current + 1);

            if (attempts >= MaxAttempts)
            {
                _lockouts[key] = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                _attempts.TryRemove(key, out _);
                return (true, 0, LockoutMinutes * 60);
            }

            return (false, MaxAttempts - attempts, 0);
        }

        public void ResetAttempts(string key)
        {
            _attempts.TryRemove(key, out _);
            _lockouts.TryRemove(key, out _);
        }

        public static string GetKey(string? userCode, string? ipAddress)
        {
            return (userCode ?? "unknown").ToLower();
        }
    }
}

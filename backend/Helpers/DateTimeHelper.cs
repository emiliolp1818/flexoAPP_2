namespace FlexoAPP.API.Helpers
{
    public static class DateTimeHelper
    {
        private static readonly TimeZoneInfo ColombiaZone = GetColombiaZone();

        private static TimeZoneInfo GetColombiaZone()
        {
            // Intentar con ID de Linux primero (Railway/Docker), luego Windows
            string[] zoneIds = { "America/Bogota", "SA Pacific Standard Time" };
            foreach (var id in zoneIds)
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById(id);
                }
                catch { }
            }
            // Fallback: UTC-5 fijo
            return TimeZoneInfo.CreateCustomTimeZone("Colombia", TimeSpan.FromHours(-5), "Colombia", "Colombia");
        }

        /// <summary>
        /// Hora actual en zona horaria de Colombia (UTC-5).
        /// </summary>
        public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ColombiaZone);

        /// <summary>
        /// Fecha de hoy en zona horaria de Colombia.
        /// </summary>
        public static DateTime Today => Now.Date;
    }
}

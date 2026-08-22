using FlexoAPP.API.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Repositories;
using flexoAPP.Repositories;
using System.Linq;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Models.Entities;
using System.Text.Json;

namespace FlexoAPP.API.Controllers
{




    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class DashboardController : ControllerBase
    {

        private readonly IUserRepository _userRepository;
        private readonly IDesignRepository _designRepository;
        private readonly IMaquinaRepository _maquinaRepository;
        private readonly FlexoAPPDbContext _context;




        public DashboardController(
            IUserRepository userRepository,
            IDesignRepository designRepository,
            IMaquinaRepository maquinaRepository,
            FlexoAPPDbContext context)
        {
            _userRepository = userRepository;
            _designRepository = designRepository;
            _maquinaRepository = maquinaRepository;
            _context = context;
        }





        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {

            int totalUsers = 0;
            int newUsersThisMonth = 0;
            int totalDesigns = 0;
            int newDesignsThisWeek = 0;
            int readyOrders = 0;
            int readyToday = 0;
            double averageSetupTime = 0;
            int totalSetupChanges = 0;

            try
            {

                try
                {
                    var allUsers = await _userRepository.GetAllAsync();
                    totalUsers = allUsers.Count();

                    var firstDayOfMonth = new DateTime(DateTimeHelper.Now.Year, DateTimeHelper.Now.Month, 1);
                    newUsersThisMonth = allUsers.Count(u => u.CreatedAt >= firstDayOfMonth);

                    // Console.WriteLine($"✅ Usuarios: {totalUsers} totales, {newUsersThisMonth} nuevos este mes");
                }
                catch (Exception ex)
                {
                    // Console.WriteLine($"⚠️ Error obteniendo usuarios: {ex.Message}");
                }


                try
                {
                    var allDesigns = await _designRepository.GetAllDesignsAsync();
                    totalDesigns = allDesigns.Count();


                    newDesignsThisWeek = 0;

                    // Console.WriteLine($"✅ Diseños: {totalDesigns} totales");
                }
                catch (Exception ex)
                {
                    // Console.WriteLine($"⚠️ Error obteniendo diseños: {ex.Message}");
                }


                try
                {
                    var allMaquinas = await _maquinaRepository.GetAllAsync();


                    readyOrders = allMaquinas.Count(m =>
                        !string.IsNullOrEmpty(m.Estado) &&
                        (m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                         m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase)));

                    var today = DateTimeHelper.Today;

                    readyToday = allMaquinas.Count(m =>
                        !string.IsNullOrEmpty(m.Estado) &&
                        (m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                         m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase)) &&
                        m.UpdatedAt.Date == today);

                    // Console.WriteLine($"✅ Órdenes: {readyOrders} listas, {readyToday} hoy");
                }
                catch (Exception ex)
                {
                    // Console.WriteLine($"⚠️ Error obteniendo máquinas: {ex.Message}");
                }


                try
                {
                    // Solo últimos 30 días y proyección mínima (evita OOM en Railway)
                    var statsSince = DateTimeHelper.Today.AddDays(-30);
                    var durationMinutes = await _context.Activities
                        .AsNoTracking()
                        .Where(a =>
                            a.Module == "MACHINES" &&
                            a.Action == "MACHINE_STATUS_CHANGED" &&
                            a.Duration != null &&
                            a.Duration > TimeSpan.Zero &&
                            a.Description.Contains("PREPARANDO") &&
                            a.Description.Contains("LISTO") &&
                            a.Timestamp >= statsSince)
                        .Select(a => a.Duration!.Value.TotalMinutes)
                        .ToListAsync();

                    if (durationMinutes.Count > 0)
                    {
                        averageSetupTime = durationMinutes.Average();
                        totalSetupChanges = durationMinutes.Count;
                    }
                }
                catch (Exception ex)
                {
                    // Console.WriteLine($"⚠️ Error calculando tiempo promedio: {ex.Message}");
                }


                var stats = new
                {
                    totalUsers,
                    newUsersThisMonth,
                    readyOrders,
                    readyToday,
                    totalDesigns,
                    newDesignsThisWeek,
                    averageSetupTime = Math.Round(averageSetupTime, 1),
                    totalSetupChanges
                };

                // Console.WriteLine($"📊 Dashboard Stats completo: Users={totalUsers}, Ready={readyOrders}, Designs={totalDesigns}");

                return Ok(stats);
            }
            catch (Exception ex)
            {
                // Console.WriteLine($"❌ Error general en GetDashboardStats: {ex.Message}");


                return Ok(new
                {
                    totalUsers,
                    newUsersThisMonth,
                    readyOrders,
                    readyToday,
                    totalDesigns,
                    newDesignsThisWeek,
                    averageSetupTime,
                    totalSetupChanges
                });
            }
        }





        [HttpGet("average-time-by-user")]
        public async Task<IActionResult> GetAverageTimeByUser()
        {
            try
            {


                var activities = await _context.Activities
                    .Include(a => a.User)
                    .Where(a =>
                        a.Module == "MACHINES" &&
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Duration != null &&
                        a.Description.Contains("PREPARANDO") &&
                        a.Description.Contains("LISTO") &&
                        a.UserId > 0)
                    .ToListAsync();


                var userAverages = activities
                    .Where(a => a.Duration!.Value.TotalMinutes > 0)
                    .GroupBy(a => new { a.UserId, a.UserCode, a.User })
                    .Select(g => new
                    {
                        userId = g.Key.UserId,
                        userCode = g.Key.UserCode,
                        userName = g.Key.User != null ? g.Key.User.FirstName + " " + g.Key.User.LastName : g.Key.UserCode,
                        averageTime = Math.Round(g.Average(a => a.Duration!.Value.TotalMinutes), 1),
                        totalChanges = g.Count(),
                        minTime = Math.Round(g.Min(a => a.Duration!.Value.TotalMinutes), 1),
                        maxTime = Math.Round(g.Max(a => a.Duration!.Value.TotalMinutes), 1)
                    })
                    .OrderBy(u => u.averageTime)
                    .ToList();

                // Console.WriteLine($"📊 Tiempos promedio por usuario: {userAverages.Count} usuarios");

                return Ok(userAverages);
            }
            catch (Exception ex)
            {
                // Console.WriteLine($"❌ Error obteniendo tiempos por usuario: {ex.Message}");
                return Ok(new List<object>());
            }
        }


        /// <summary>
        /// Top pantones más usados en el mes actual (solo pedidos LISTO/TERMINADO desde maquinas_backup)
        /// </summary>
        [HttpGet("top-pantones")]
        public async Task<IActionResult> GetTopPantones()
        {
            try
            {
                var today = DateTimeHelper.Today;
                var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);

                using var conn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    SELECT Colores
                    FROM maquinas_backup
                    WHERE backup_date >= @Desde
                      AND Estado IN ('LISTO', 'TERMINADO', 'TERMINADA')";
                cmd.Parameters.AddWithValue("@Desde", firstDayOfMonth);

                var pantoneCount = new Dictionary<string, int>();
                var heptaNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                    "BLACK", "WHITE", "CYAN", "MAGENTA", "YELLOW", "GREEN", "ORANGE", "VIOLET",
                    "NEGRO", "BLANCO", "AMARILLO", "VERDE", "NARANJA", "VIOLETA"
                };
                var lacaKeywords = new[] { "LACA", "BARNIZ", "MATE", "BRILLO", "VARNISH", "LACQUER",
                    "PRIMER", "TERMO", "REGISTRO", "REG_", "_REG", "SELLADOR", "ADHESIVO", "PROTECTOR" };

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var coloresStr = reader.IsDBNull(0) ? "[]" : reader.GetString(0);
                    try
                    {
                        var colores = System.Text.Json.JsonSerializer.Deserialize<string[]>(coloresStr) ?? Array.Empty<string>();
                        foreach (var color in colores)
                        {
                            if (string.IsNullOrWhiteSpace(color)) continue;
                            var c = color.Trim();
                            if (c.Equals("#N/A", StringComparison.OrdinalIgnoreCase) || c.Equals("N/A", StringComparison.OrdinalIgnoreCase)) continue;
                            if (heptaNames.Contains(c)) continue;
                            var upper = c.ToUpper();
                            if (lacaKeywords.Any(k => upper.Contains(k))) continue;
                            pantoneCount[c] = pantoneCount.GetValueOrDefault(c, 0) + 1;
                        }
                    }
                    catch { }
                }

                var top = pantoneCount
                    .OrderByDescending(kv => kv.Value)
                    .Take(8)
                    .Select(kv => new { name = kv.Key, count = kv.Value })
                    .ToList();

                return Ok(top);
            }
            catch
            {
                return Ok(new List<object>());
            }
        }

        /// <summary>
        /// Kilos y metros totales del mes actual (solo desde maquinas_backup con LISTO/TERMINADO)
        /// Solo muestra datos del mes corriente, al cambiar de mes se reinicia
        /// </summary>
        [HttpGet("monthly-production")]
        public async Task<IActionResult> GetMonthlyProduction()
        {
            try
            {
                var today = DateTimeHelper.Today;
                var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
                var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddSeconds(-1);
                var mesesEs = new[] { "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" };
                var monthLabel = $"{mesesEs[today.Month]} {today.Year}";

                using var conn = new MySqlConnector.MySqlConnection(_context.Database.GetConnectionString());
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    SELECT 
                        COUNT(DISTINCT ot_sap) AS totalPedidos,
                        COALESCE(SUM(Kilos), 0) AS totalKilos,
                        COALESCE(SUM(COALESCE(Metros, 0)), 0) AS totalMetros
                    FROM maquinas_backup
                    WHERE Estado IN ('LISTO', 'TERMINADO', 'TERMINADA')
                      AND backup_date >= @FirstDay
                      AND backup_date <= @LastDay";
                cmd.Parameters.AddWithValue("@FirstDay", firstDayOfMonth);
                cmd.Parameters.AddWithValue("@LastDay", lastDayOfMonth);

                decimal totalKilos = 0;
                decimal totalMetros = 0;
                int totalPedidos = 0;

                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    totalPedidos = reader.GetInt32("totalPedidos");
                    totalKilos = reader.GetDecimal("totalKilos");
                    totalMetros = reader.GetDecimal("totalMetros");
                }

                return Ok(new
                {
                    totalKilos = Math.Round(totalKilos, 1),
                    totalMetros = Math.Round(totalMetros, 1),
                    totalPedidos,
                    month = monthLabel
                });
            }
            catch (Exception ex)
            {
                return Ok(new { totalKilos = 0, totalMetros = 0, totalPedidos = 0, month = "", error = ex.Message });
            }
        }

        /// <summary>
        /// Datos de tendencia para las KPI cards (últimos 7 días)
        /// </summary>
        [HttpGet("kpi-trends")]
        public async Task<IActionResult> GetKpiTrends()
        {
            try
            {
                var today = DateTimeHelper.Today;
                var sevenDaysAgo = today.AddDays(-6);
                var dayNamesMap = new[] { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };

                // Tiempo promedio de prealistamiento por día
                var setupActivities = await _context.Activities
                    .AsNoTracking()
                    .Where(a =>
                        a.Module == "MACHINES" &&
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Duration != null &&
                        a.Description.Contains("PREPARANDO") &&
                        a.Description.Contains("LISTO") &&
                        a.Timestamp >= sevenDaysAgo)
                    .Select(a => new { a.Timestamp, Duration = a.Duration!.Value })
                    .ToListAsync();

                var setupByDay = Enumerable.Range(0, 7).Select(i =>
                {
                    var date = sevenDaysAgo.AddDays(i);
                    var dayActivities = setupActivities.Where(a => a.Timestamp.Date == date && a.Duration.TotalMinutes > 0).ToList();
                    return new {
                        value = dayActivities.Any() ? Math.Round(dayActivities.Average(a => a.Duration.TotalMinutes), 1) : 0,
                        day = dayNamesMap[(int)date.DayOfWeek],
                        date = date.ToString("dd/MM")
                    };
                }).ToList();

                // Órdenes listas por día
                var readyActivities = await _context.Activities
                    .AsNoTracking()
                    .Where(a =>
                        a.Module == "MACHINES" &&
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Description.Contains("LISTO") &&
                        a.Timestamp >= sevenDaysAgo)
                    .Select(a => new { a.Timestamp })
                    .ToListAsync();

                var readyByDay = Enumerable.Range(0, 7).Select(i =>
                {
                    var date = sevenDaysAgo.AddDays(i);
                    return new {
                        value = readyActivities.Count(a => a.Timestamp.Date == date),
                        day = dayNamesMap[(int)date.DayOfWeek],
                        date = date.ToString("dd/MM")
                    };
                }).ToList();

                // Diseños creados por día
                var designs = await _context.Designs
                    .AsNoTracking()
                    .Where(d => d.LastModified != null && d.LastModified >= sevenDaysAgo)
                    .Select(d => new { LastModified = d.LastModified!.Value })
                    .ToListAsync();

                var designsByDay = Enumerable.Range(0, 7).Select(i =>
                {
                    var date = sevenDaysAgo.AddDays(i);
                    return new {
                        value = designs.Count(d => d.LastModified.Date == date),
                        day = dayNamesMap[(int)date.DayOfWeek],
                        date = date.ToString("dd/MM")
                    };
                }).ToList();

                return Ok(new
                {
                    setupTrend = setupByDay,
                    readyTrend = readyByDay,
                    designsTrend = designsByDay
                });
            }
            catch (Exception ex)
            {
                // Console.WriteLine($"❌ Error en kpi-trends: {ex.Message}");
                return Ok(new { setupTrend = new List<double>(), readyTrend = new List<int>(), designsTrend = new List<int>() });
            }
        }

        /// <summary>
        /// Mejor tiempo de usuario de la semana: suma total del tiempo de preparación (PREPARANDO→LISTO)
        /// Solo usuarios que realizaron la acción de preparado
        /// </summary>
        [HttpGet("best-time-week")]
        public async Task<IActionResult> GetBestTimeOfWeek()
        {
            try
            {
                var today = DateTimeHelper.Today;
                var daysFromMonday = ((int)today.DayOfWeek + 6) % 7;
                var monday = today.AddDays(-daysFromMonday);
                var minDuration = TimeSpan.FromMinutes(5);

                // Proyección ligera: sin Include ni entidades completas (crítico en Railway)
                var rows = await _context.Activities
                    .AsNoTracking()
                    .Where(a =>
                        a.Module == "MACHINES" &&
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Duration != null &&
                        a.Duration >= minDuration &&
                        a.Description.Contains("PREPARANDO") &&
                        a.Description.Contains("LISTO") &&
                        a.Timestamp >= monday &&
                        a.UserId > 0)
                    .Select(a => new
                    {
                        a.UserId,
                        a.UserCode,
                        UserFirstName = a.User != null ? a.User.FirstName : null,
                        UserLastName = a.User != null ? a.User.LastName : null,
                        ProfileImage = a.User != null ? a.User.ProfileImage : null,
                        DurationMinutes = a.Duration!.Value.TotalMinutes,
                        a.Details
                    })
                    .ToListAsync();

                if (rows.Count == 0)
                    return Ok(new List<object>());

                var articulosPantoneCount = await BuildArticuloPantoneCountMapAsync(rows.Select(r => r.Details));

                var ranking = rows
                    .GroupBy(r => r.UserId)
                    .Select(g =>
                    {
                        var first = g.First();
                        var totalTimeMinutes = g.Sum(r => r.DurationMinutes);
                        var totalChanges = g.Count();
                        var totalPantones = 0;

                        foreach (var row in g)
                        {
                            if (TryGetArticuloFromDetails(row.Details, out var art) &&
                                !string.IsNullOrEmpty(art) &&
                                articulosPantoneCount.TryGetValue(art, out var count))
                            {
                                totalPantones += count;
                            }
                            else
                            {
                                totalPantones += 1;
                            }
                        }

                        if (totalPantones == 0) totalPantones = totalChanges;
                        var avgTimePerPantone = totalPantones > 0 ? totalTimeMinutes / totalPantones : totalTimeMinutes;

                        return new
                        {
                            userId = g.Key,
                            userCode = first.UserCode,
                            userName = FormatShortUserName(first.UserFirstName, first.UserLastName, first.UserCode),
                            totalTime = Math.Round(totalTimeMinutes, 1),
                            totalPantones,
                            avgTimePerPantone = Math.Round(avgTimePerPantone, 1),
                            totalChanges,
                            profileImage = first.ProfileImage
                        };
                    })
                    .OrderBy(u => u.avgTimePerPantone)
                    .Take(5)
                    .ToList();

                return Ok(ranking);
            }
            catch (Exception)
            {
                return Ok(new List<object>());
            }
        }

        private static string FormatShortUserName(string? firstName, string? lastName, string? userCode)
        {
            if (!string.IsNullOrWhiteSpace(firstName) || !string.IsNullOrWhiteSpace(lastName))
            {
                var first = (firstName ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "";
                var last = (lastName ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "";
                return $"{first} {last}".Trim();
            }
            return userCode ?? "";
        }

        private static bool TryGetArticuloFromDetails(string? details, out string? articulo)
        {
            articulo = null;
            if (string.IsNullOrEmpty(details)) return false;
            try
            {
                var det = JsonSerializer.Deserialize<JsonElement>(details);
                if (det.TryGetProperty("articulo", out var artProp))
                {
                    articulo = artProp.GetString();
                    return !string.IsNullOrEmpty(articulo);
                }
            }
            catch { }
            return false;
        }

        private async Task<Dictionary<string, int>> BuildArticuloPantoneCountMapAsync(IEnumerable<string?> detailsList)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            var needsDesignLookup = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var details in detailsList)
            {
                if (string.IsNullOrEmpty(details)) continue;
                try
                {
                    var det = JsonSerializer.Deserialize<JsonElement>(details);
                    if (!det.TryGetProperty("articulo", out var artProp)) continue;
                    var art = artProp.GetString();
                    if (string.IsNullOrEmpty(art) || map.ContainsKey(art)) continue;

                    if (det.TryGetProperty("pantoneColors", out var pantoneArr) &&
                        pantoneArr.ValueKind == JsonValueKind.Array &&
                        pantoneArr.GetArrayLength() > 0)
                    {
                        map[art] = pantoneArr.GetArrayLength();
                    }
                    else
                    {
                        needsDesignLookup.Add(art);
                    }
                }
                catch { }
            }

            if (needsDesignLookup.Count > 0)
            {
                var articles = needsDesignLookup.ToList();
                var designs = await _context.Set<Design>()
                    .AsNoTracking()
                    .Where(d => d.ArticleF != null && articles.Contains(d.ArticleF))
                    .Select(d => new { d.ArticleF, d.ColorCount })
                    .ToListAsync();

                foreach (var d in designs)
                {
                    if (d.ArticleF != null && !map.ContainsKey(d.ArticleF))
                        map[d.ArticleF] = d.ColorCount ?? 1;
                }

                foreach (var art in needsDesignLookup)
                {
                    if (!map.ContainsKey(art))
                        map[art] = 1;
                }
            }

            return map;
        }

        /// <summary>
        /// Eficiencia por turno por día: Lunes a Domingo, Turno 1 (6-14), Turno 2 (14-22), Turno 3 (22-6)
        /// </summary>
        [HttpGet("shift-efficiency")]
        public async Task<IActionResult> GetShiftEfficiency()
        {
            try
            {
                var today = DateTimeHelper.Today;
                var sevenDaysAgo = today.AddDays(-6);
                var dayNamesMap = new[] { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };

                // Zona horaria de Colombia (UTC-5)
                var colombiaZone = TimeZoneInfo.FindSystemTimeZoneById("America/Bogota");

                // Fetch con ventana más amplia (8 días) para cubrir desfase UTC/Colombia
                var activities = await _context.Activities
                    .AsNoTracking()
                    .Where(a =>
                        a.Module == "MACHINES" &&
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Duration != null &&
                        a.Description.Contains("PREPARANDO") &&
                        a.Description.Contains("LISTO") &&
                        a.Timestamp >= sevenDaysAgo.AddDays(-1))
                    .Select(a => new { a.Timestamp, Duration = a.Duration!.Value })
                    .ToListAsync();

                var validActivities = activities
                    .Where(a => a.Duration.TotalMinutes >= 5)
                    .Select(a => new
                    {
                        // Convertir timestamp a hora Colombia (asumimos UTC en BD)
                        Timestamp = TimeZoneInfo.ConvertTimeFromUtc(
                            DateTime.SpecifyKind(a.Timestamp, DateTimeKind.Utc), 
                            colombiaZone),
                        Duration = a.Duration
                    })
                    .Where(a => a.Timestamp.Date >= sevenDaysAgo) // Filtrar ya en hora Colombia
                    .ToList();

                int GetShift(DateTime dt) {
                    var hour = dt.Hour;
                    if (hour >= 6 && hour < 14) return 1;
                    if (hour >= 14 && hour < 22) return 2;
                    return 3;
                }

                var result = Enumerable.Range(0, 7).Select(i =>
                {
                    var date = sevenDaysAgo.AddDays(i);
                    var dayActivities = validActivities.Where(a => a.Timestamp.Date == date).ToList();

                    var shifts = new[] { 1, 2, 3 }.Select(shift =>
                    {
                        var shiftActs = dayActivities.Where(a => GetShift(a.Timestamp) == shift).ToList();
                        return new
                        {
                            shift,
                            label = shift == 1 ? "T1 (6-14)" : shift == 2 ? "T2 (14-22)" : "T3 (22-6)",
                            count = shiftActs.Count,
                            avgTime = shiftActs.Any() ? Math.Round(shiftActs.Average(a => a.Duration.TotalMinutes), 1) : 0
                        };
                    }).ToList();

                    return new
                    {
                        day = dayNamesMap[(int)date.DayOfWeek],
                        date = date.ToString("dd/MM"),
                        totalCount = dayActivities.Count,
                        shifts
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return Ok(new List<object>());
            }
        }


        /// <summary>
        /// Preparación de máquinas por día (últimos 7 días): cuántos pedidos quedaron LISTO por día
        /// </summary>
        [HttpGet("daily-preparation")]
        public async Task<IActionResult> GetDailyPreparation()
        {
            try
            {
                var today = DateTimeHelper.Today;
                var startDate = today.AddDays(-7);

                // Console.WriteLine($"📊 daily-preparation: today={today:yyyy-MM-dd}, startDate={startDate:yyyy-MM-dd}");

                // Contar directamente con SQL raw para evitar problemas de traducción EF
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                using var cmd = connection.CreateCommand();
                cmd.CommandText = @"
                    SELECT DATE(Timestamp) as dia, COUNT(*) as total
                    FROM Activities
                    WHERE Module = 'MACHINES'
                      AND Action = 'MACHINE_STATUS_CHANGED'
                      AND Description LIKE '%LISTO%'
                      AND Timestamp >= @startDate
                    GROUP BY DATE(Timestamp)";
                cmd.Parameters.AddWithValue("@startDate", startDate);

                var countsByDate = new Dictionary<DateTime, int>();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var dia = reader.GetDateTime("dia");
                    var total = reader.GetInt32("total");
                    countsByDate[dia.Date] = total;
                    // Console.WriteLine($"📊 daily-preparation: {dia:yyyy-MM-dd} = {total}");
                }

                var dayNames = new[] { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };

                var days = Enumerable.Range(0, 7).Select(i =>
                {
                    var date = today.AddDays(-6 + i);
                    countsByDate.TryGetValue(date, out int count);
                    return new
                    {
                        date = date.ToString("dd/MM"),
                        dayName = dayNames[(int)date.DayOfWeek],
                        count
                    };
                }).ToList();

                return Ok(days);
            }
            catch (Exception ex)
            {
                // Console.WriteLine($"❌ Error en daily-preparation: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}


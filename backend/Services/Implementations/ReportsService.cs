using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;
using System.Text;
using OfficeOpenXml;

namespace FlexoAPP.API.Services
{
    public class ReportsService : IReportsService
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<ReportsService> _logger;

        public ReportsService(FlexoAPPDbContext context, ILogger<ReportsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ReportSummaryDto> GetReportSummaryAsync(ReportFilterDto filter)
        {
            var query = _context.Maquinas.AsQueryable();


            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.NumeroMaquina));

            if (filter.Status?.Any() == true)
                query = query.Where(p => p.Estado != null && filter.Status.Contains(p.Estado!));

            var programs = await query.ToListAsync();

            var summary = new ReportSummaryDto
            {
                TotalPrograms = programs.Count,
                CompletedPrograms = programs.Count(p => p.Estado == "TERMINADO"),
                RunningPrograms = programs.Count(p => p.Estado == "CORRIENDO"),
                SuspendedPrograms = programs.Count(p => p.Estado == "SUSPENDIDO"),
                ReadyPrograms = programs.Count(p => p.Estado == "LISTO"),
                TotalKilos = programs.Sum(p => p.Kilos),
                AverageEfficiency = 0,
                ActiveMachines = programs.Where(p => p.Estado == "CORRIENDO").Select(p => p.NumeroMaquina).Distinct().Count(),
                TotalMachines = programs.Select(p => p.NumeroMaquina).Distinct().Count()
            };

            return summary;
        }

        public async Task<List<ProductionReportDto>> GetProductionReportAsync(ReportFilterDto filter)
        {
            var query = _context.Maquinas.AsQueryable();


            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.NumeroMaquina));

            if (filter.Status?.Any() == true)
                query = query.Where(p => p.Estado != null && filter.Status.Contains(p.Estado!));

            if (!string.IsNullOrEmpty(filter.Cliente))
                query = query.Where(p => p.Cliente.Contains(filter.Cliente));

            if (!string.IsNullOrEmpty(filter.Articulo))
                query = query.Where(p => p.Articulo.Contains(filter.Articulo));

            var programs = await query.OrderByDescending(p => p.FechaTintaEnMaquina).ToListAsync();

            return programs.Select(p => new ProductionReportDto
            {
                MachineNumber = p.NumeroMaquina,
                ProgramName = p.Articulo,
                Articulo = p.Articulo,
                Cliente = p.Cliente,
                Referencia = p.Referencia ?? "",
                Kilos = p.Kilos,
                Estado = p.Estado ?? "SIN ASIGNAR",
                FechaInicio = p.FechaTintaEnMaquina,
                FechaFin = (p.Estado == "TERMINADO") ? p.LastActionAt : null,
                Progreso = 0,
                TiempoTotal = (p.Estado == "TERMINADO" && p.LastActionAt.HasValue) ?
                    (p.LastActionAt.Value - p.FechaTintaEnMaquina).TotalHours : null,
                Eficiencia = 0,
                OperatorName = p.LastActionBy
            }).ToList();
        }

        public async Task<List<MachineEfficiencyReportDto>> GetMachineEfficiencyReportAsync(ReportFilterDto filter)
        {
            var query = _context.Maquinas.AsQueryable();


            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.NumeroMaquina));

            var programs = await query.ToListAsync();

            var machineGroups = programs.GroupBy(p => p.NumeroMaquina);

            var reports = new List<MachineEfficiencyReportDto>();

            foreach (var group in machineGroups)
            {
                var machinePrograms = group.ToList();
                var completedPrograms = machinePrograms.Where(p => p.Estado == "TERMINADO").ToList();

                var report = new MachineEfficiencyReportDto
                {
                    MachineNumber = group.Key,
                    TotalPrograms = machinePrograms.Count,
                    CompletedPrograms = completedPrograms.Count,
                    TotalKilos = machinePrograms.Sum(p => p.Kilos),
                    AverageEfficiency = 0,
                    TotalHours = completedPrograms.Where(p => p.LastActionAt.HasValue)
                        .Sum(p => (p.LastActionAt!.Value - p.FechaTintaEnMaquina).TotalHours),
                    Downtime = CalculateDowntime(machinePrograms),
                    UtilizationRate = CalculateUtilizationRate(machinePrograms)
                };

                reports.Add(report);
            }

            return reports.OrderBy(r => r.MachineNumber).ToList();
        }

        public async Task<List<ClientReportDto>> GetClientReportAsync(ReportFilterDto filter)
        {
            var query = _context.Maquinas.AsQueryable();


            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina <= filter.EndDate.Value);

            if (!string.IsNullOrEmpty(filter.Cliente))
                query = query.Where(p => p.Cliente.Contains(filter.Cliente));

            var programs = await query.ToListAsync();

            var clientGroups = programs.GroupBy(p => p.Cliente);

            var reports = new List<ClientReportDto>();

            foreach (var group in clientGroups)
            {
                var clientPrograms = group.ToList();
                var completedPrograms = clientPrograms.Where(p => p.Estado == "TERMINADO").ToList();

                var report = new ClientReportDto
                {
                    Cliente = group.Key,
                    TotalPrograms = clientPrograms.Count,
                    TotalKilos = clientPrograms.Sum(p => p.Kilos),
                    CompletedPrograms = completedPrograms.Count,
                    PendingPrograms = clientPrograms.Count(p => p.Estado != "TERMINADO"),
                    AverageCompletionTime = completedPrograms.Where(p => p.LastActionAt.HasValue)
                        .Average(p => (double?)(p.LastActionAt!.Value - p.FechaTintaEnMaquina).TotalHours) ?? 0
                };

                reports.Add(report);
            }

            return reports.OrderByDescending(r => r.TotalKilos).ToList();
        }

        public async Task<List<DailyProductionReportDto>> GetDailyProductionReportAsync(ReportFilterDto filter)
        {
            var startDate = filter.StartDate ?? DateTime.Now.AddDays(-30);
            var endDate = filter.EndDate ?? DateTime.Now;

            var programs = await _context.Maquinas
                .Where(p => p.FechaTintaEnMaquina >= startDate && p.FechaTintaEnMaquina <= endDate)
                .ToListAsync();

            var dailyGroups = programs.GroupBy(p => p.FechaTintaEnMaquina.Date);

            var reports = new List<DailyProductionReportDto>();

            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var dayPrograms = programs.Where(p => p.FechaTintaEnMaquina.Date == date).ToList();
                var completedPrograms = dayPrograms.Where(p => p.Estado == "TERMINADO").ToList();

                var report = new DailyProductionReportDto
                {
                    Date = date,
                    TotalPrograms = dayPrograms.Count,
                    CompletedPrograms = completedPrograms.Count,
                    TotalKilos = dayPrograms.Sum(p => p.Kilos),
                    ActiveMachines = dayPrograms.Where(p => p.Estado == "CORRIENDO")
                        .Select(p => p.NumeroMaquina).Distinct().Count(),
                    Efficiency = 0
                };

                reports.Add(report);
            }

            return reports.OrderBy(r => r.Date).ToList();
        }

        public async Task<List<string>> GetClientsListAsync()
        {
            return await _context.Maquinas
                .Select(p => p.Cliente)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        public async Task<List<string>> GetArticulosListAsync()
        {
            return await _context.Maquinas
                .Select(p => p.Articulo)
                .Distinct()
                .OrderBy(a => a)
                .ToListAsync();
        }

        public async Task<byte[]> ExportToExcelAsync(string reportType, ReportFilterDto filter)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add($"Reporte {reportType}");

            switch (reportType.ToLower())
            {
                case "production":
                    await CreateProductionExcel(worksheet, filter);
                    break;
                case "efficiency":
                    await CreateEfficiencyExcel(worksheet, filter);
                    break;
                case "clients":
                    await CreateClientsExcel(worksheet, filter);
                    break;
                case "daily":
                    await CreateDailyExcel(worksheet, filter);
                    break;
                default:
                    throw new ArgumentException("Tipo de reporte no válido");
            }

            return package.GetAsByteArray();
        }

        public async Task<byte[]> ExportToPDFAsync(string reportType, ReportFilterDto filter)
        {

            var data = reportType.ToLower() switch
            {
                "production" => await GetProductionDataForExport(filter),
                "efficiency" => await GetEfficiencyDataForExport(filter),
                "clients" => await GetClientsDataForExport(filter),
                "daily" => await GetDailyDataForExport(filter),
                _ => "Tipo de reporte no válido"
            };

            return Encoding.UTF8.GetBytes(data);
        }

        private double CalculateEfficiency(Maquina program)
        {
            if (program.Estado == "TERMINADO" && program.LastActionAt.HasValue)
            {
                var expectedHours = (double)program.Kilos / 100;
                var actualHours = (program.LastActionAt.Value - program.FechaTintaEnMaquina).TotalHours;
                if (actualHours > 0)
                     return Math.Min(100, (expectedHours / actualHours) * 100);
            }
            return 0;
        }

        private double CalculateDowntime(List<Maquina> programs)
        {

            var suspendedPrograms = programs.Where(p => p.Estado == "SUSPENDIDO");
            return suspendedPrograms.Count() * 2;
        }

        private double CalculateUtilizationRate(List<Maquina> programs)
        {
            var totalPrograms = programs.Count;
            var activePrograms = programs.Count(p => p.Estado == "CORRIENDO" || p.Estado == "TERMINADO");
            return totalPrograms > 0 ? (double)activePrograms / totalPrograms * 100 : 0;
        }

        private async Task<string> GetProductionDataForExport(ReportFilterDto filter)
        {
            var reports = await GetProductionReportAsync(filter);
            var csv = new StringBuilder();
            csv.AppendLine("Máquina,Programa,Artículo,Cliente,Kilos,Estado,Progreso,Eficiencia,Operario");

            foreach (var report in reports)
            {
                csv.AppendLine($"{report.MachineNumber},{report.ProgramName},{report.Articulo},{report.Cliente},{report.Kilos},{report.Estado},{report.Progreso},{report.Eficiencia:F1},{report.OperatorName}");
            }

            return csv.ToString();
        }

        private async Task<string> GetEfficiencyDataForExport(ReportFilterDto filter)
        {
            var reports = await GetMachineEfficiencyReportAsync(filter);
            var csv = new StringBuilder();
            csv.AppendLine("Máquina,Total Programas,Completados,Kilos Totales,Eficiencia Promedio,Utilización");

            foreach (var report in reports)
            {
                csv.AppendLine($"{report.MachineNumber},{report.TotalPrograms},{report.CompletedPrograms},{report.TotalKilos},{report.AverageEfficiency:F1},{report.UtilizationRate:F1}");
            }

            return csv.ToString();
        }

        private async Task<string> GetClientsDataForExport(ReportFilterDto filter)
        {
            var reports = await GetClientReportAsync(filter);
            var csv = new StringBuilder();
            csv.AppendLine("Cliente,Total Programas,Kilos Totales,Completados,Pendientes,Tiempo Promedio");

            foreach (var report in reports)
            {
                csv.AppendLine($"{report.Cliente},{report.TotalPrograms},{report.TotalKilos},{report.CompletedPrograms},{report.PendingPrograms},{report.AverageCompletionTime:F1}");
            }

            return csv.ToString();
        }

        private async Task<string> GetDailyDataForExport(ReportFilterDto filter)
        {
            var reports = await GetDailyProductionReportAsync(filter);
            var csv = new StringBuilder();
            csv.AppendLine("Fecha,Total Programas,Completados,Kilos Totales,Máquinas Activas,Eficiencia");

            foreach (var report in reports)
            {
                csv.AppendLine($"{report.Date:yyyy-MM-dd},{report.TotalPrograms},{report.CompletedPrograms},{report.TotalKilos},{report.ActiveMachines},{report.Efficiency:F1}");
            }

            return csv.ToString();
        }

        private async Task CreateProductionExcel(ExcelWorksheet worksheet, ReportFilterDto filter)
        {
            var reports = await GetProductionReportAsync(filter);


            worksheet.Cells[1, 1].Value = "Máquina";
            worksheet.Cells[1, 2].Value = "Programa";
            worksheet.Cells[1, 3].Value = "Artículo";
            worksheet.Cells[1, 4].Value = "Cliente";
            worksheet.Cells[1, 5].Value = "Kilos";
            worksheet.Cells[1, 6].Value = "Estado";
            worksheet.Cells[1, 7].Value = "Progreso";
            worksheet.Cells[1, 8].Value = "Eficiencia";
            worksheet.Cells[1, 9].Value = "Operario";


            for (int i = 0; i < reports.Count; i++)
            {
                var report = reports[i];
                var row = i + 2;

                worksheet.Cells[row, 1].Value = report.MachineNumber;
                worksheet.Cells[row, 2].Value = report.ProgramName;
                worksheet.Cells[row, 3].Value = report.Articulo;
                worksheet.Cells[row, 4].Value = report.Cliente;
                worksheet.Cells[row, 5].Value = report.Kilos;
                worksheet.Cells[row, 6].Value = report.Estado;
                worksheet.Cells[row, 7].Value = report.Progreso;
                worksheet.Cells[row, 8].Value = report.Eficiencia;
                worksheet.Cells[row, 9].Value = report.OperatorName;
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task CreateEfficiencyExcel(ExcelWorksheet worksheet, ReportFilterDto filter)
        {
            var reports = await GetMachineEfficiencyReportAsync(filter);


            worksheet.Cells[1, 1].Value = "Máquina";
            worksheet.Cells[1, 2].Value = "Total Programas";
            worksheet.Cells[1, 3].Value = "Completados";
            worksheet.Cells[1, 4].Value = "Kilos Totales";
            worksheet.Cells[1, 5].Value = "Eficiencia Promedio";
            worksheet.Cells[1, 6].Value = "Utilización";


            for (int i = 0; i < reports.Count; i++)
            {
                var report = reports[i];
                var row = i + 2;

                worksheet.Cells[row, 1].Value = report.MachineNumber;
                worksheet.Cells[row, 2].Value = report.TotalPrograms;
                worksheet.Cells[row, 3].Value = report.CompletedPrograms;
                worksheet.Cells[row, 4].Value = report.TotalKilos;
                worksheet.Cells[row, 5].Value = report.AverageEfficiency;
                worksheet.Cells[row, 6].Value = report.UtilizationRate;
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task CreateClientsExcel(ExcelWorksheet worksheet, ReportFilterDto filter)
        {
            var reports = await GetClientReportAsync(filter);


            worksheet.Cells[1, 1].Value = "Cliente";
            worksheet.Cells[1, 2].Value = "Total Programas";
            worksheet.Cells[1, 3].Value = "Kilos Totales";
            worksheet.Cells[1, 4].Value = "Completados";
            worksheet.Cells[1, 5].Value = "Pendientes";
            worksheet.Cells[1, 6].Value = "Tiempo Promedio";


            for (int i = 0; i < reports.Count; i++)
            {
                var report = reports[i];
                var row = i + 2;

                worksheet.Cells[row, 1].Value = report.Cliente;
                worksheet.Cells[row, 2].Value = report.TotalPrograms;
                worksheet.Cells[row, 3].Value = report.TotalKilos;
                worksheet.Cells[row, 4].Value = report.CompletedPrograms;
                worksheet.Cells[row, 5].Value = report.PendingPrograms;
                worksheet.Cells[row, 6].Value = report.AverageCompletionTime;
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task CreateDailyExcel(ExcelWorksheet worksheet, ReportFilterDto filter)
        {
            var reports = await GetDailyProductionReportAsync(filter);


            worksheet.Cells[1, 1].Value = "Fecha";
            worksheet.Cells[1, 2].Value = "Total Programas";
            worksheet.Cells[1, 3].Value = "Completados";
            worksheet.Cells[1, 4].Value = "Kilos Totales";
            worksheet.Cells[1, 5].Value = "Máquinas Activas";
            worksheet.Cells[1, 6].Value = "Eficiencia";


            for (int i = 0; i < reports.Count; i++)
            {
                var report = reports[i];
                var row = i + 2;

                worksheet.Cells[row, 1].Value = report.Date.ToString("yyyy-MM-dd");
                worksheet.Cells[row, 2].Value = report.TotalPrograms;
                worksheet.Cells[row, 3].Value = report.CompletedPrograms;
                worksheet.Cells[row, 4].Value = report.TotalKilos;
                worksheet.Cells[row, 5].Value = report.ActiveMachines;
                worksheet.Cells[row, 6].Value = report.Efficiency;
            }

            worksheet.Cells.AutoFitColumns();
        }


        public async Task<List<UserActivityDto>> GetUserActivitiesAsync(UserActivityFilterDto filter)
        {
            try
            {
                _logger.LogInformation("🔍 Consultando actividades REALES para usuario: {UserCode}", filter.UserCode);
                _logger.LogInformation("📅 Rango de fechas: {StartDate} - {EndDate}", filter.StartDate, filter.EndDate);
                _logger.LogInformation("📦 Módulo: {Module}", filter.Module ?? "TODOS");


                var totalForUser = await _context.Activities
                    .Where(a => a.UserCode == filter.UserCode)
                    .CountAsync();

                _logger.LogInformation("📊 Total de actividades para {UserCode}: {Total}", filter.UserCode, totalForUser);


                var query = _context.Activities.AsQueryable();


                query = query.Where(a => a.UserCode == filter.UserCode);


                if (filter.StartDate.HasValue)
                {
                    var startDate = filter.StartDate.Value.Date;
                    query = query.Where(a => a.Timestamp >= startDate);
                    _logger.LogInformation("🔍 Filtrando desde: {StartDate}", startDate);
                }


                if (filter.EndDate.HasValue)
                {
                    var endDate = filter.EndDate.Value.Date.AddDays(1).AddSeconds(-1);
                    query = query.Where(a => a.Timestamp <= endDate);
                    _logger.LogInformation("🔍 Filtrando hasta: {EndDate}", endDate);
                }


                if (!string.IsNullOrEmpty(filter.Module) && filter.Module != "ALL")
                {
                    query = query.Where(a => a.Module == filter.Module);
                    _logger.LogInformation("🔍 Filtrando por módulo: {Module}", filter.Module);
                }


                var countBeforeExecution = await query.CountAsync();
                _logger.LogInformation("📊 Actividades que coinciden con filtros: {Count}", countBeforeExecution);


                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .ToListAsync();

                _logger.LogInformation("✅ Actividades obtenidas de la BD: {Count}", activities.Count);


                if (activities.Count == 0)
                {
                    _logger.LogWarning("⚠️ No se encontraron actividades para {UserCode}", filter.UserCode);

                    var recentActivities = await _context.Activities
                        .OrderByDescending(a => a.Timestamp)
                        .Take(5)
                        .Select(a => new { a.UserCode, a.Action, a.Timestamp })
                        .ToListAsync();

                    _logger.LogInformation("📋 Últimas 5 actividades en la BD (cualquier usuario): {Activities}",
                        string.Join(", ", recentActivities.Select(a => $"{a.UserCode}:{a.Action}@{a.Timestamp:HH:mm:ss}")));
                }


                var result = activities.Select(a => new UserActivityDto
                {
                    Id = a.Id.ToString(),
                    UserId = a.UserId.ToString(),
                    UserCode = a.UserCode ?? "",
                    Action = a.Action,
                    Description = a.Description,
                    Module = a.Module,
                    Component = a.Module,
                    Timestamp = a.Timestamp,
                    Metadata = a.Details != null ?
                        new Dictionary<string, object> { { "details", a.Details } } :
                        new Dictionary<string, object>()
                }).ToList();

                _logger.LogInformation("✅ Retornando {Count} actividades para {UserCode}", result.Count, filter.UserCode);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo actividades del usuario {UserCode}", filter.UserCode);
                throw;
            }
        }





        public async Task<MachineActivityReportDto> GetMachineActivitiesByUserAsync(MachineActivityFilterDto filter)
        {

            var user = await GetUserByCodeAsync(filter.UserCode);







            return new MachineActivityReportDto
            {
                User = user,
                ReportDate = filter.ReportDate,
                CompletedOrders = 0,
                SuspendedOrders = 0,
                TotalMovements = 0,
                ActiveHours = 0,
                CompletedOrdersList = new List<MachineOrderDto>(),
                SuspendedOrdersList = new List<MachineOrderDto>(),
                UserMovements = new List<UserMovementDto>()
            };
        }





        public Task<MachineActivityReportDto> GetMachineActivitiesFromBackupAsync(string backupId)
        {




            var backupUser = new UserDto
            {
                Id = "backup-user",
                UserCode = "backup_data",
                FirstName = "Datos de",
                LastName = "Backup",
                Email = "backup@flexoapp.com",
                Role = "system",
                IsActive = true
            };


            var report = new MachineActivityReportDto
            {
                User = backupUser,
                ReportDate = DateTime.Now,
                CompletedOrders = 0,
                SuspendedOrders = 0,
                TotalMovements = 0,
                ActiveHours = 0,
                CompletedOrdersList = new List<MachineOrderDto>(),
                SuspendedOrdersList = new List<MachineOrderDto>(),
                UserMovements = new List<UserMovementDto>(),
                BackupId = backupId,
                IsFromBackup = true
            };

            return Task.FromResult(report);
        }





        public Task<List<UserDto>> GetUsersListAsync()
        {







            var users = new List<UserDto>
            {
                new UserDto
                {
                    Id = "1",
                    UserCode = "admin",
                    FirstName = "Administrador",
                    LastName = "del Sistema",
                    Email = "admin@flexoapp.com",
                    Role = "admin",
                    IsActive = true
                }
            };

            return Task.FromResult(users);
        }


        private async Task<UserDto> GetUserByCodeAsync(string userCode)
        {
            var users = await GetUsersListAsync();
            return users.FirstOrDefault(u => u.UserCode.Equals(userCode, StringComparison.OrdinalIgnoreCase))
                ?? new UserDto
                {
                    Id = userCode,
                    UserCode = userCode,
                    FirstName = "Usuario",
                    LastName = "Sistema",
                    Email = $"{userCode}@flexoapp.com",
                    Role = "user",
                    IsActive = true
                };
        }




        public async Task<List<object>> GetRecentActivitiesTestAsync()
        {
            try
            {
                _logger.LogInformation("🔍 Consultando actividades recientes REALES de la BD");


                var activities = await _context.Activities
                    .OrderByDescending(a => a.Timestamp)
                    .Take(50)
                    .Select(a => new
                    {
                        id = a.Id,
                        userId = a.UserId,
                        userCode = a.UserCode,
                        action = a.Action,
                        description = a.Description,
                        module = a.Module,
                        details = a.Details,
                        timestamp = a.Timestamp,
                        ipAddress = a.IpAddress
                    })
                    .ToListAsync();

                _logger.LogInformation($"✅ Se encontraron {activities.Count} actividades en la BD");

                return activities.Cast<object>().ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error consultando actividades recientes");
                throw;
            }
        }




        public async Task<object> GetActivitiesStatsTestAsync()
        {
            try
            {
                _logger.LogInformation("📊 Consultando estadísticas REALES de Activities");

                var totalActivities = await _context.Activities.CountAsync();
                var activitiesLast24h = await _context.Activities
                    .Where(a => a.Timestamp >= DateTime.Now.AddDays(-1))
                    .CountAsync();
                var activitiesLast7days = await _context.Activities
                    .Where(a => a.Timestamp >= DateTime.Now.AddDays(-7))
                    .CountAsync();

                var activityTypes = await _context.Activities
                    .GroupBy(a => a.Action)
                    .Select(g => new { action = g.Key, count = g.Count() })
                    .OrderByDescending(x => x.count)
                    .ToListAsync();

                var moduleStats = await _context.Activities
                    .GroupBy(a => a.Module)
                    .Select(g => new { module = g.Key, count = g.Count() })
                    .OrderByDescending(x => x.count)
                    .ToListAsync();

                var userStats = await _context.Activities
                    .GroupBy(a => a.UserCode)
                    .Select(g => new { userCode = g.Key, count = g.Count() })
                    .OrderByDescending(x => x.count)
                    .Take(10)
                    .ToListAsync();

                var recentActivity = await _context.Activities
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => new { a.Timestamp, a.Action, a.UserCode })
                    .FirstOrDefaultAsync();

                var oldestActivity = await _context.Activities
                    .OrderBy(a => a.Timestamp)
                    .Select(a => new { a.Timestamp, a.Action, a.UserCode })
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"✅ Estadísticas: Total={totalActivities}, Últimas 24h={activitiesLast24h}");

                return new
                {
                    totalActivities = totalActivities,
                    activitiesLast24Hours = activitiesLast24h,
                    activitiesLast7Days = activitiesLast7days,
                    activityTypes = activityTypes,
                    moduleStats = moduleStats,
                    topUsers = userStats,
                    mostRecentActivity = recentActivity,
                    oldestActivity = oldestActivity,
                    databaseTime = DateTime.Now,
                    message = totalActivities == 0
                        ? "⚠️ No hay actividades en la base de datos"
                        : $"✅ Base de datos funcionando correctamente con {totalActivities} actividades"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error consultando estadísticas");
                throw;
            }
        }

        // ============================================================================
        // MÉTODOS OPTIMIZADOS PARA AUDITORÍA CON PAGINACIÓN
        // ============================================================================

        /// <summary>
        /// Obtiene actividades de auditoría con paginación optimizada
        /// </summary>
        public async Task<PagedResultDto<AuditActivityDto>> GetAuditActivitiesPagedAsync(AuditActivityFilterDto filter)
        {
            try
            {
                _logger.LogInformation("📊 Consultando actividades paginadas - Página {Page}, Tamaño {PageSize}", 
                    filter.Page, filter.PageSize);

                // Query base con tracking deshabilitado para mejor rendimiento
                var query = _context.Activities
                    .AsNoTracking()
                    .Include(a => a.User)
                    .AsQueryable();

                // Aplicar filtros
                if (filter.UserId.HasValue)
                {
                    query = query.Where(a => a.UserId == filter.UserId.Value);
                }

                if (!string.IsNullOrEmpty(filter.Module) && filter.Module != "ALL")
                {
                    query = query.Where(a => a.Module == filter.Module);
                }

                if (!string.IsNullOrEmpty(filter.Action))
                {
                    query = query.Where(a => a.Action.Contains(filter.Action));
                }

                if (filter.StartDate.HasValue)
                {
                    var startDate = filter.StartDate.Value.Date;
                    query = query.Where(a => a.Timestamp >= startDate);
                }

                if (filter.EndDate.HasValue)
                {
                    var endDate = filter.EndDate.Value.Date.AddDays(1).AddSeconds(-1);
                    query = query.Where(a => a.Timestamp <= endDate);
                }

                // Contar total ANTES de paginar
                var totalCount = await query.CountAsync();

                // Aplicar ordenamiento
                query = ApplySorting(query, filter.SortBy, filter.SortDescending);

                // Aplicar paginación
                var items = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(a => new AuditActivityDto
                    {
                        Id = a.Id,
                        Action = a.Action,
                        Description = a.Description,
                        Timestamp = a.Timestamp,
                        Module = a.Module,
                        Details = a.Details,
                        UserId = a.UserId,
                        UserCode = a.UserCode ?? "",
                        IpAddress = a.IpAddress,
                        EntityType = a.EntityType,
                        EntityId = a.EntityId,
                        EntityName = a.EntityName,
                        Duration = a.Duration.HasValue ? a.Duration.Value.TotalSeconds : (double?)null,
                        OldValues = a.OldValues,
                        NewValues = a.NewValues,
                        User = a.User != null ? new UserBasicDto
                        {
                            Id = a.User.Id,
                            UserCode = a.User.UserCode ?? "",
                            FirstName = a.User.FirstName ?? "",
                            LastName = a.User.LastName ?? ""
                        } : null
                    })
                    .ToListAsync();

                _logger.LogInformation("✅ Retornando {Count} actividades de {Total} total", 
                    items.Count, totalCount);

                return new PagedResultDto<AuditActivityDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo actividades paginadas");
                throw;
            }
        }

        /// <summary>
        /// Obtiene estadísticas por módulo sin cargar todos los datos
        /// </summary>
        public async Task<List<ModuleStatsDto>> GetModuleStatsAsync(AuditActivityFilterDto filter)
        {
            try
            {
                _logger.LogInformation("📊 Calculando estadísticas por módulo");

                var query = _context.Activities.AsNoTracking().AsQueryable();

                // Aplicar filtros de fecha
                if (filter.StartDate.HasValue)
                {
                    var startDate = filter.StartDate.Value.Date;
                    query = query.Where(a => a.Timestamp >= startDate);
                }

                if (filter.EndDate.HasValue)
                {
                    var endDate = filter.EndDate.Value.Date.AddDays(1).AddSeconds(-1);
                    query = query.Where(a => a.Timestamp <= endDate);
                }

                if (filter.UserId.HasValue)
                {
                    query = query.Where(a => a.UserId == filter.UserId.Value);
                }

                // Agrupar y calcular en la base de datos
                var stats = await query
                    .GroupBy(a => a.Module)
                    .Select(g => new ModuleStatsDto
                    {
                        Module = g.Key,
                        ModuleLabel = GetModuleLabel(g.Key),
                        TotalActivities = g.Count(),
                        LastActivity = g.Max(a => a.Timestamp),
                        UniqueUsers = g.Select(a => a.UserId).Distinct().Count()
                    })
                    .OrderByDescending(s => s.TotalActivities)
                    .ToListAsync();

                _logger.LogInformation("✅ Estadísticas calculadas para {Count} módulos", stats.Count);

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error calculando estadísticas de módulos");
                throw;
            }
        }

        /// <summary>
        /// Obtiene lista de usuarios activos
        /// </summary>
        public async Task<List<UserBasicDto>> GetActiveUsersListAsync()
        {
            try
            {
                _logger.LogInformation("👥 Obteniendo lista de usuarios activos");

                var users = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.IsActive)
                    .OrderBy(u => u.UserCode)
                    .Select(u => new UserBasicDto
                    {
                        Id = u.Id,
                        UserCode = u.UserCode,
                        FirstName = u.FirstName,
                        LastName = u.LastName
                    })
                    .ToListAsync();

                _logger.LogInformation("✅ {Count} usuarios activos encontrados", users.Count);

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error obteniendo lista de usuarios activos");
                throw;
            }
        }

        // Métodos auxiliares
        private IQueryable<Activity> ApplySorting(IQueryable<Activity> query, string? sortBy, bool descending)
        {
            return sortBy?.ToLower() switch
            {
                "timestamp" => descending ? query.OrderByDescending(a => a.Timestamp) : query.OrderBy(a => a.Timestamp),
                "module" => descending ? query.OrderByDescending(a => a.Module) : query.OrderBy(a => a.Module),
                "action" => descending ? query.OrderByDescending(a => a.Action) : query.OrderBy(a => a.Action),
                "user" => descending ? query.OrderByDescending(a => a.UserCode) : query.OrderBy(a => a.UserCode),
                _ => query.OrderByDescending(a => a.Timestamp)
            };
        }

        private string GetModuleLabel(string module)
        {
            return module switch
            {
                "AUTH" => "Autenticación",
                "MACHINES" => "Máquinas",
                "DESIGNS" => "Diseños",
                "DOCUMENTS" => "Documentos",
                "REPORTS" => "Reportes",
                "CONFIG" => "Configuración",
                "SETTINGS" => "Ajustes",
                "PROFILE" => "Perfil",
                "CONDICION_UNICA" => "Condición Única",
                _ => module
            };
        }

    }
}

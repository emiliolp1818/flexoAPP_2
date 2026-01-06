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

            // Aplicar filtros
            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.NumeroMaquina));

            if (filter.Status?.Any() == true)
                query = query.Where(p => filter.Status.Contains(p.Estado));

            var programs = await query.ToListAsync();

            var summary = new ReportSummaryDto
            {
                TotalPrograms = programs.Count,
                CompletedPrograms = programs.Count(p => p.Estado == "TERMINADO"),
                RunningPrograms = programs.Count(p => p.Estado == "CORRIENDO"),
                SuspendedPrograms = programs.Count(p => p.Estado == "SUSPENDIDO"),
                ReadyPrograms = programs.Count(p => p.Estado == "LISTO"),
                TotalKilos = programs.Sum(p => p.Kilos),
                AverageEfficiency = 0, // No disponible
                ActiveMachines = programs.Where(p => p.Estado == "CORRIENDO").Select(p => p.NumeroMaquina).Distinct().Count(),
                TotalMachines = programs.Select(p => p.NumeroMaquina).Distinct().Count()
            };

            return summary;
        }

        public async Task<List<ProductionReportDto>> GetProductionReportAsync(ReportFilterDto filter)
        {
            var query = _context.Maquinas.AsQueryable();

            // Aplicar filtros
            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaTintaEnMaquina <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.NumeroMaquina));

            if (filter.Status?.Any() == true)
                query = query.Where(p => filter.Status.Contains(p.Estado));

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

            // Aplicar filtros
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

            // Aplicar filtros
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
            // Implementación básica - en producción usar una librería como iTextSharp
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
                var expectedHours = (double)program.Kilos / 100; // Ejemplo: 100 kg/hora
                var actualHours = (program.LastActionAt.Value - program.FechaTintaEnMaquina).TotalHours;
                if (actualHours > 0)
                     return Math.Min(100, (expectedHours / actualHours) * 100);
            }
            return 0;
        }

        private double CalculateDowntime(List<Maquina> programs)
        {
            // Cálculo simplificado del tiempo inactivo
            var suspendedPrograms = programs.Where(p => p.Estado == "SUSPENDIDO");
            return suspendedPrograms.Count() * 2; // Ejemplo: 2 horas promedio por suspensión
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
            
            // Headers
            worksheet.Cells[1, 1].Value = "Máquina";
            worksheet.Cells[1, 2].Value = "Programa";
            worksheet.Cells[1, 3].Value = "Artículo";
            worksheet.Cells[1, 4].Value = "Cliente";
            worksheet.Cells[1, 5].Value = "Kilos";
            worksheet.Cells[1, 6].Value = "Estado";
            worksheet.Cells[1, 7].Value = "Progreso";
            worksheet.Cells[1, 8].Value = "Eficiencia";
            worksheet.Cells[1, 9].Value = "Operario";

            // Data
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
            
            // Headers
            worksheet.Cells[1, 1].Value = "Máquina";
            worksheet.Cells[1, 2].Value = "Total Programas";
            worksheet.Cells[1, 3].Value = "Completados";
            worksheet.Cells[1, 4].Value = "Kilos Totales";
            worksheet.Cells[1, 5].Value = "Eficiencia Promedio";
            worksheet.Cells[1, 6].Value = "Utilización";

            // Data
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
            
            // Headers
            worksheet.Cells[1, 1].Value = "Cliente";
            worksheet.Cells[1, 2].Value = "Total Programas";
            worksheet.Cells[1, 3].Value = "Kilos Totales";
            worksheet.Cells[1, 4].Value = "Completados";
            worksheet.Cells[1, 5].Value = "Pendientes";
            worksheet.Cells[1, 6].Value = "Tiempo Promedio";

            // Data
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
            
            // Headers
            worksheet.Cells[1, 1].Value = "Fecha";
            worksheet.Cells[1, 2].Value = "Total Programas";
            worksheet.Cells[1, 3].Value = "Completados";
            worksheet.Cells[1, 4].Value = "Kilos Totales";
            worksheet.Cells[1, 5].Value = "Máquinas Activas";
            worksheet.Cells[1, 6].Value = "Eficiencia";

            // Data
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

        // Nuevos métodos para actividades de usuario
        public async Task<List<UserActivityDto>> GetUserActivitiesAsync(UserActivityFilterDto filter)
        {
            try
            {
                _logger.LogInformation("🔍 Consultando actividades REALES para usuario: {UserCode}", filter.UserCode);
                _logger.LogInformation("📅 Rango de fechas: {StartDate} - {EndDate}", filter.StartDate, filter.EndDate);
                _logger.LogInformation("📦 Módulo: {Module}", filter.Module ?? "TODOS");

                // Primero, verificar cuántas actividades hay en total para este usuario
                var totalForUser = await _context.Activities
                    .Where(a => a.UserCode == filter.UserCode)
                    .CountAsync();
                
                _logger.LogInformation("📊 Total de actividades para {UserCode}: {Total}", filter.UserCode, totalForUser);

                // Consulta a la tabla Activities
                var query = _context.Activities.AsQueryable();

                // Filtrar por código de usuario
                query = query.Where(a => a.UserCode == filter.UserCode);

                // Aplicar filtro de fecha de inicio
                if (filter.StartDate.HasValue)
                {
                    var startDate = filter.StartDate.Value.Date; // Solo la fecha, sin hora
                    query = query.Where(a => a.Timestamp >= startDate);
                    _logger.LogInformation("🔍 Filtrando desde: {StartDate}", startDate);
                }

                // Aplicar filtro de fecha de fin
                if (filter.EndDate.HasValue)
                {
                    var endDate = filter.EndDate.Value.Date.AddDays(1).AddSeconds(-1); // Hasta el final del día
                    query = query.Where(a => a.Timestamp <= endDate);
                    _logger.LogInformation("🔍 Filtrando hasta: {EndDate}", endDate);
                }

                // Aplicar filtro de módulo
                if (!string.IsNullOrEmpty(filter.Module) && filter.Module != "ALL")
                {
                    query = query.Where(a => a.Module == filter.Module);
                    _logger.LogInformation("🔍 Filtrando por módulo: {Module}", filter.Module);
                }

                // Contar resultados antes de ejecutar
                var countBeforeExecution = await query.CountAsync();
                _logger.LogInformation("📊 Actividades que coinciden con filtros: {Count}", countBeforeExecution);

                // Ejecutar consulta y ordenar por fecha descendente
                var activities = await query
                    .OrderByDescending(a => a.Timestamp)
                    .ToListAsync();

                _logger.LogInformation("✅ Actividades obtenidas de la BD: {Count}", activities.Count);

                // Si no hay actividades, mostrar las últimas 5 de cualquier usuario para debug
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

                // Mapear a DTOs
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

        /// <summary>
        /// Obtener actividades de máquinas por usuario desde datos reales
        /// TODO: Implementar consulta real a la base de datos
        /// </summary>
        public async Task<MachineActivityReportDto> GetMachineActivitiesByUserAsync(MachineActivityFilterDto filter)
        {
            // Obtener usuario desde la base de datos
            var user = await GetUserByCodeAsync(filter.UserCode);
            
            // TODO: Implementar consulta real a la base de datos
            // var completedOrders = await _context.MachinePrograms
            //     .Where(mp => mp.Estado == "TERMINADO" && mp.CreatedAt.Date == filter.ReportDate.Date)
            //     .ToListAsync();
            
            // Retornar estructura vacía hasta implementar consultas reales
            return new MachineActivityReportDto
            {
                User = user,                    // Usuario obtenido de la base de datos
                ReportDate = filter.ReportDate, // Fecha del reporte solicitado
                CompletedOrders = 0,            // Órdenes completadas (desde BD real)
                SuspendedOrders = 0,            // Órdenes suspendidas (desde BD real)
                TotalMovements = 0,             // Total de movimientos (desde BD real)
                ActiveHours = 0,                // Horas activas (calculadas desde BD real)
                CompletedOrdersList = new List<MachineOrderDto>(),  // Lista vacía hasta implementar
                SuspendedOrdersList = new List<MachineOrderDto>(),  // Lista vacía hasta implementar
                UserMovements = new List<UserMovementDto>()         // Lista vacía hasta implementar
            };
        }

        /// <summary>
        /// Obtener actividades de máquinas desde backup real
        /// TODO: Implementar restauración real desde archivos de backup
        /// </summary>
        public async Task<MachineActivityReportDto> GetMachineActivitiesFromBackupAsync(string backupId)
        {
            // TODO: Implementar carga real desde archivo de backup
            // var backupData = await _backupService.RestoreBackup(backupId);
            
            // Usuario temporal para representar datos de backup
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

            // Retornar estructura vacía hasta implementar restauración real
            return new MachineActivityReportDto
            {
                User = backupUser,              // Usuario representativo del backup
                ReportDate = DateTime.Now,      // Fecha actual como placeholder
                CompletedOrders = 0,            // Órdenes desde backup (implementar)
                SuspendedOrders = 0,            // Órdenes suspendidas desde backup (implementar)
                TotalMovements = 0,             // Movimientos desde backup (implementar)
                ActiveHours = 0,                // Horas activas desde backup (implementar)
                CompletedOrdersList = new List<MachineOrderDto>(),  // Lista desde backup
                SuspendedOrdersList = new List<MachineOrderDto>(),  // Lista desde backup
                UserMovements = new List<UserMovementDto>(),        // Movimientos desde backup
                BackupId = backupId,            // ID del backup utilizado
                IsFromBackup = true             // Flag indicando origen desde backup
            };
        }

        /// <summary>
        /// Obtener lista de usuarios desde la base de datos real
        /// TODO: Implementar consulta real a la tabla Users
        /// </summary>
        public async Task<List<UserDto>> GetUsersListAsync()
        {
            // TODO: Implementar consulta real a la base de datos
            // return await _context.Users
            //     .Where(u => u.IsActive)
            //     .Select(u => new UserDto { ... })
            //     .ToListAsync();
            
            // Por ahora, retornar solo el usuario administrador que existe
            return new List<UserDto>
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
        }

        // Métodos auxiliares para generar datos simulados
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

        /// <summary>
        /// TEST: Obtener actividades recientes REALES de la base de datos
        /// </summary>
        public async Task<List<object>> GetRecentActivitiesTestAsync()
        {
            try
            {
                _logger.LogInformation("🔍 Consultando actividades recientes REALES de la BD");

                // Consulta DIRECTA a la tabla Activities sin filtros
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

        /// <summary>
        /// TEST: Obtener estadísticas REALES de la tabla Activities
        /// </summary>
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

    }
}

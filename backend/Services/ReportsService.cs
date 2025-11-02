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
            var query = _context.MachinePrograms.AsQueryable();

            // Aplicar filtros
            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaInicio >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaInicio <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.MachineNumber));

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
                AverageEfficiency = programs.Where(p => p.Progreso > 0).Average(p => (double?)p.Progreso) ?? 0,
                ActiveMachines = programs.Where(p => p.Estado == "CORRIENDO").Select(p => p.MachineNumber).Distinct().Count(),
                TotalMachines = programs.Select(p => p.MachineNumber).Distinct().Count()
            };

            return summary;
        }

        public async Task<List<ProductionReportDto>> GetProductionReportAsync(ReportFilterDto filter)
        {
            var query = _context.MachinePrograms.AsQueryable();

            // Aplicar filtros
            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaInicio >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaInicio <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.MachineNumber));

            if (filter.Status?.Any() == true)
                query = query.Where(p => filter.Status.Contains(p.Estado));

            if (!string.IsNullOrEmpty(filter.Cliente))
                query = query.Where(p => p.Cliente.Contains(filter.Cliente));

            if (!string.IsNullOrEmpty(filter.Articulo))
                query = query.Where(p => p.Articulo.Contains(filter.Articulo));

            var programs = await query.OrderByDescending(p => p.FechaInicio).ToListAsync();

            return programs.Select(p => new ProductionReportDto
            {
                Id = p.Id,
                MachineNumber = p.MachineNumber,
                ProgramName = p.Name,
                Articulo = p.Articulo,
                Cliente = p.Cliente,
                Referencia = p.Referencia ?? "",
                Kilos = p.Kilos,
                Estado = p.Estado,
                FechaInicio = p.FechaInicio,
                FechaFin = p.FechaFin,
                Progreso = p.Progreso,
                TiempoTotal = p.FechaFin.HasValue ? 
                    (p.FechaFin.Value - p.FechaInicio).TotalHours : null,
                Eficiencia = CalculateEfficiency(p),
                OperatorName = p.OperatorName
            }).ToList();
        }

        public async Task<List<MachineEfficiencyReportDto>> GetMachineEfficiencyReportAsync(ReportFilterDto filter)
        {
            var query = _context.MachinePrograms.AsQueryable();

            // Aplicar filtros
            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaInicio >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaInicio <= filter.EndDate.Value);

            if (filter.MachineNumbers?.Any() == true)
                query = query.Where(p => filter.MachineNumbers.Contains(p.MachineNumber));

            var programs = await query.ToListAsync();

            var machineGroups = programs.GroupBy(p => p.MachineNumber);

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
                    AverageEfficiency = machinePrograms.Where(p => p.Progreso > 0).Average(p => (double?)p.Progreso) ?? 0,
                    TotalHours = completedPrograms.Where(p => p.FechaFin.HasValue)
                        .Sum(p => (p.FechaFin!.Value - p.FechaInicio).TotalHours),
                    Downtime = CalculateDowntime(machinePrograms),
                    UtilizationRate = CalculateUtilizationRate(machinePrograms)
                };

                reports.Add(report);
            }

            return reports.OrderBy(r => r.MachineNumber).ToList();
        }

        public async Task<List<ClientReportDto>> GetClientReportAsync(ReportFilterDto filter)
        {
            var query = _context.MachinePrograms.AsQueryable();

            // Aplicar filtros
            if (filter.StartDate.HasValue)
                query = query.Where(p => p.FechaInicio >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(p => p.FechaInicio <= filter.EndDate.Value);

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
                    AverageCompletionTime = completedPrograms.Where(p => p.FechaFin.HasValue)
                        .Average(p => (double?)(p.FechaFin!.Value - p.FechaInicio).TotalHours) ?? 0
                };

                reports.Add(report);
            }

            return reports.OrderByDescending(r => r.TotalKilos).ToList();
        }

        public async Task<List<DailyProductionReportDto>> GetDailyProductionReportAsync(ReportFilterDto filter)
        {
            var startDate = filter.StartDate ?? DateTime.Now.AddDays(-30);
            var endDate = filter.EndDate ?? DateTime.Now;

            var programs = await _context.MachinePrograms
                .Where(p => p.FechaInicio >= startDate && p.FechaInicio <= endDate)
                .ToListAsync();

            var dailyGroups = programs.GroupBy(p => p.FechaInicio.Date);

            var reports = new List<DailyProductionReportDto>();

            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var dayPrograms = programs.Where(p => p.FechaInicio.Date == date).ToList();
                var completedPrograms = dayPrograms.Where(p => p.Estado == "TERMINADO").ToList();

                var report = new DailyProductionReportDto
                {
                    Date = date,
                    TotalPrograms = dayPrograms.Count,
                    CompletedPrograms = completedPrograms.Count,
                    TotalKilos = dayPrograms.Sum(p => p.Kilos),
                    ActiveMachines = dayPrograms.Where(p => p.Estado == "CORRIENDO")
                        .Select(p => p.MachineNumber).Distinct().Count(),
                    Efficiency = dayPrograms.Where(p => p.Progreso > 0)
                        .Average(p => (double?)p.Progreso) ?? 0
                };

                reports.Add(report);
            }

            return reports.OrderBy(r => r.Date).ToList();
        }

        public async Task<List<string>> GetClientsListAsync()
        {
            return await _context.MachinePrograms
                .Select(p => p.Cliente)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        public async Task<List<string>> GetArticulosListAsync()
        {
            return await _context.MachinePrograms
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

        private double CalculateEfficiency(MachineProgram program)
        {
            if (program.Estado == "TERMINADO" && program.FechaFin.HasValue)
            {
                var expectedHours = (double)program.Kilos / 100; // Ejemplo: 100 kg/hora
                var actualHours = (program.FechaFin.Value - program.FechaInicio).TotalHours;
                return Math.Min(100, (expectedHours / actualHours) * 100);
            }
            return program.Progreso;
        }

        private double CalculateDowntime(List<MachineProgram> programs)
        {
            // Cálculo simplificado del tiempo inactivo
            var suspendedPrograms = programs.Where(p => p.Estado == "SUSPENDIDO");
            return suspendedPrograms.Count() * 2; // Ejemplo: 2 horas promedio por suspensión
        }

        private double CalculateUtilizationRate(List<MachineProgram> programs)
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
            // Implementación simulada - en producción conectar con tabla de actividades real
            var activities = new List<UserActivityDto>();
            var random = new Random();
            
            for (int i = 1; i <= 15; i++)
            {
                var timestamp = DateTime.Now.AddDays(-i).AddHours(random.Next(8, 18));
                
                activities.Add(new UserActivityDto
                {
                    Id = i.ToString(),
                    UserId = filter.UserCode,
                    UserCode = filter.UserCode,
                    Action = GetRandomAction(),
                    Description = GetRandomDescription(),
                    Module = GetRandomModule(filter.Module),
                    Component = "Component" + i,
                    Timestamp = timestamp,
                    ExpiryDate = timestamp.AddDays(30),
                    DaysRemaining = 30 - i,
                    IsExpiringSoon = i > 25,
                    Metadata = new Dictionary<string, object>
                    {
                        ["ip"] = "192.168.1." + random.Next(1, 255),
                        ["browser"] = GetRandomBrowser()
                    }
                });
            }

            return activities.Where(a => 
                (filter.StartDate == null || a.Timestamp >= filter.StartDate) &&
                (filter.EndDate == null || a.Timestamp <= filter.EndDate) &&
                (string.IsNullOrEmpty(filter.Module) || filter.Module == "ALL" || a.Module == filter.Module)
            ).ToList();
        }

        public async Task<MachineActivityReportDto> GetMachineActivitiesByUserAsync(MachineActivityFilterDto filter)
        {
            // Implementación simulada - en producción conectar con datos reales
            var user = await GetUserByCodeAsync(filter.UserCode);
            var random = new Random();
            
            var completedOrders = GenerateMockOrders(filter.ReportDate, "COMPLETED", random.Next(2, 8));
            var suspendedOrders = GenerateMockOrders(filter.ReportDate, "SUSPENDED", random.Next(0, 3));
            var userMovements = GenerateMockMovements(filter.ReportDate, filter.UserCode, random.Next(10, 25));

            return new MachineActivityReportDto
            {
                User = user,
                ReportDate = filter.ReportDate,
                CompletedOrders = completedOrders.Count,
                SuspendedOrders = suspendedOrders.Count,
                TotalMovements = userMovements.Count,
                ActiveHours = random.Next(6, 12),
                CompletedOrdersList = completedOrders,
                SuspendedOrdersList = suspendedOrders,
                UserMovements = userMovements
            };
        }

        public async Task<MachineActivityReportDto> GetMachineActivitiesFromBackupAsync(string backupId)
        {
            // Implementación simulada - en producción cargar desde backup real
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

            var random = new Random();
            var reportDate = DateTime.Now.AddDays(-random.Next(1, 30));
            var completedOrders = GenerateMockOrders(reportDate, "COMPLETED", random.Next(5, 15));
            var suspendedOrders = GenerateMockOrders(reportDate, "SUSPENDED", random.Next(1, 5));
            var userMovements = GenerateMockMovements(reportDate, "backup_data", random.Next(20, 50));

            return new MachineActivityReportDto
            {
                User = backupUser,
                ReportDate = reportDate,
                CompletedOrders = completedOrders.Count,
                SuspendedOrders = suspendedOrders.Count,
                TotalMovements = userMovements.Count,
                ActiveHours = random.Next(8, 16),
                CompletedOrdersList = completedOrders,
                SuspendedOrdersList = suspendedOrders,
                UserMovements = userMovements,
                BackupId = backupId,
                IsFromBackup = true
            };
        }

        public async Task<List<UserDto>> GetUsersListAsync()
        {
            // En producción, obtener de la tabla Users real
            return new List<UserDto>
            {
                new UserDto { Id = "1", UserCode = "admin", FirstName = "Admin", LastName = "System", Email = "admin@flexoapp.com", Role = "admin", IsActive = true },
                new UserDto { Id = "2", UserCode = "OP001", FirstName = "Operario", LastName = "Uno", Email = "op001@flexoapp.com", Role = "operator", IsActive = true },
                new UserDto { Id = "3", UserCode = "DIS001", FirstName = "Diseñador", LastName = "Principal", Email = "dis001@flexoapp.com", Role = "designer", IsActive = true },
                new UserDto { Id = "4", UserCode = "SUP001", FirstName = "Supervisor", LastName = "Producción", Email = "sup001@flexoapp.com", Role = "supervisor", IsActive = true }
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

        private List<MachineOrderDto> GenerateMockOrders(DateTime date, string type, int count)
        {
            var orders = new List<MachineOrderDto>();
            var random = new Random();
            var suspensionReasons = new[] { "Falta de material", "Mantenimiento", "Cambio de especificaciones", "Problema técnico" };

            for (int i = 0; i < count; i++)
            {
                var orderTime = date.AddHours(8 + random.Next(0, 10)).AddMinutes(random.Next(0, 60));
                
                var order = new MachineOrderDto
                {
                    OrderNumber = $"{(type == "COMPLETED" ? "ORD" : "SUS")}-{random.Next(1000, 9999)}",
                    Description = $"Impresión flexográfica - {type.ToLower()} {i + 1}",
                    MachineId = $"MAQ-{random.Next(1, 13):D2}",
                    Quantity = random.Next(1000, 6000)
                };

                if (type == "COMPLETED")
                {
                    order.CompletedTime = orderTime;
                    order.Duration = random.Next(30, 150);
                }
                else
                {
                    order.SuspendedTime = orderTime;
                    order.ElapsedTime = random.Next(15, 105);
                    order.Progress = random.Next(10, 80);
                    order.SuspensionReason = suspensionReasons[random.Next(suspensionReasons.Length)];
                }

                orders.Add(order);
            }

            return orders;
        }

        private List<UserMovementDto> GenerateMockMovements(DateTime date, string userCode, int count)
        {
            var movements = new List<UserMovementDto>();
            var random = new Random();
            var movementTypes = new[] { "START", "STOP", "PAUSE", "CONFIG", "MAINTENANCE" };
            var actions = new Dictionary<string, string[]>
            {
                ["START"] = new[] { "Inicio de producción", "Arranque de máquina", "Inicio de turno" },
                ["STOP"] = new[] { "Fin de producción", "Parada de máquina", "Fin de turno" },
                ["PAUSE"] = new[] { "Pausa para mantenimiento", "Pausa programada", "Pausa por cambio" },
                ["CONFIG"] = new[] { "Configuración de parámetros", "Ajuste de máquina", "Cambio de configuración" },
                ["MAINTENANCE"] = new[] { "Mantenimiento preventivo", "Limpieza de máquina", "Revisión técnica" }
            };

            for (int i = 0; i < count; i++)
            {
                var movementTime = date.AddHours(8 + random.Next(0, 10)).AddMinutes(random.Next(0, 60));
                var type = movementTypes[random.Next(movementTypes.Length)];
                var actionList = actions[type];
                var action = actionList[random.Next(actionList.Length)];

                movements.Add(new UserMovementDto
                {
                    Id = $"mov-{i + 1}",
                    Action = action,
                    Description = $"{action} realizada por {userCode}",
                    Type = type,
                    Timestamp = movementTime,
                    MachineId = $"MAQ-{random.Next(1, 13):D2}",
                    OrderNumber = random.Next(0, 10) > 3 ? $"ORD-{random.Next(1000, 9999)}" : null,
                    Module = "MACHINES"
                });
            }

            return movements.OrderBy(m => m.Timestamp).ToList();
        }

        private string GetRandomAction()
        {
            var random = new Random();
            var actions = new[] { "Inicio de sesión", "Actualización de perfil", "Gestión de máquinas", "Creación de diseño", "Consulta de reportes", "Configuración del sistema" };
            return actions[random.Next(actions.Length)];
        }

        private string GetRandomDescription()
        {
            var random = new Random();
            var descriptions = new[] { "Acceso exitoso al sistema", "Modificación de información", "Programación de máquina", "Nuevo diseño registrado", "Generación de reporte", "Cambio de configuración" };
            return descriptions[random.Next(descriptions.Length)];
        }

        private string GetRandomModule(string? filterModule)
        {
            if (!string.IsNullOrEmpty(filterModule) && filterModule != "ALL")
                return filterModule;

            var random = new Random();
            var modules = new[] { "AUTH", "PROFILE", "MACHINES", "DESIGN", "REPORTS", "SETTINGS" };
            return modules[random.Next(modules.Length)];
        }

        private string GetRandomBrowser()
        {
            var random = new Random();
            var browsers = new[] { "Chrome", "Firefox", "Safari", "Edge" };
            return browsers[random.Next(browsers.Length)];
        }
    }
}
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FlexoAPP.API.Data
{
    public static class MachineProgramSeedData
    {
        public static async Task SeedMachineProgramsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();

            try
            {
                // Verificar si ya existen programas
                if (await context.MachinePrograms.AnyAsync())
                {
                    Console.WriteLine("📊 Los programas de máquinas ya existen, omitiendo seed data");
                    return;
                }

                Console.WriteLine("🔄 Creando datos de ejemplo para programas de máquinas...");

                var samplePrograms = new List<MachineProgram>
                {
                    new MachineProgram
                    {
                        MachineNumber = 11,
                        Name = "Programa Coca-Cola 500ml",
                        Articulo = "CC500ML001",
                        OtSap = "OT2024001",
                        Cliente = "Coca-Cola Company",
                        Referencia = "Etiqueta Coca-Cola Original 500ml",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Rojo Coca-Cola", "Blanco", "Negro", "Dorado" }),
                        Sustrato = "Papel Couché 80g",
                        Kilos = 150.50m,
                        Estado = "LISTO",
                        FechaInicio = DateTime.UtcNow.AddHours(-2),
                        Progreso = 0,
                        Observaciones = "Programa listo para iniciar producción",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new MachineProgram
                    {
                        MachineNumber = 11,
                        Name = "Programa Pepsi 350ml",
                        Articulo = "PP350ML002",
                        OtSap = "OT2024002",
                        Cliente = "PepsiCo",
                        Referencia = "Etiqueta Pepsi Original 350ml",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Azul Pepsi", "Rojo", "Blanco", "Plateado" }),
                        Sustrato = "Papel Couché 90g",
                        Kilos = 200.75m,
                        Estado = "CORRIENDO",
                        FechaInicio = DateTime.UtcNow.AddHours(-4),
                        Progreso = 35,
                        Observaciones = "Producción en curso, sin incidencias",
                        LastActionBy = "Juan Pérez",
                        LastActionAt = DateTime.UtcNow.AddMinutes(-30),
                        LastAction = "Cambio de estado a CORRIENDO",
                        CreatedAt = DateTime.UtcNow.AddHours(-5),
                        UpdatedAt = DateTime.UtcNow.AddMinutes(-30)
                    },
                    new MachineProgram
                    {
                        MachineNumber = 12,
                        Name = "Programa Fanta Naranja 1L",
                        Articulo = "FN1L003",
                        OtSap = "OT2024003",
                        Cliente = "Coca-Cola Company",
                        Referencia = "Etiqueta Fanta Naranja 1 Litro",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Naranja Fanta", "Blanco", "Verde", "Negro" }),
                        Sustrato = "Papel Couché 85g",
                        Kilos = 180.25m,
                        Estado = "SUSPENDIDO",
                        FechaInicio = DateTime.UtcNow.AddHours(-6),
                        Progreso = 15,
                        Observaciones = "Suspendido por cambio de rodillo",
                        LastActionBy = "María González",
                        LastActionAt = DateTime.UtcNow.AddMinutes(-45),
                        LastAction = "Suspensión de programa",
                        CreatedAt = DateTime.UtcNow.AddHours(-7),
                        UpdatedAt = DateTime.UtcNow.AddMinutes(-45)
                    },
                    new MachineProgram
                    {
                        MachineNumber = 12,
                        Name = "Programa Sprite 600ml",
                        Articulo = "SP600ML004",
                        OtSap = "OT2024004",
                        Cliente = "Coca-Cola Company",
                        Referencia = "Etiqueta Sprite Original 600ml",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Verde Sprite", "Amarillo", "Blanco", "Azul" }),
                        Sustrato = "Papel Couché 80g",
                        Kilos = 120.00m,
                        Estado = "TERMINADO",
                        FechaInicio = DateTime.UtcNow.AddDays(-1),
                        FechaFin = DateTime.UtcNow.AddHours(-8),
                        Progreso = 100,
                        Observaciones = "Programa completado exitosamente",
                        LastActionBy = "Carlos Rodríguez",
                        LastActionAt = DateTime.UtcNow.AddHours(-8),
                        LastAction = "Cambio de estado a TERMINADO",
                        CreatedAt = DateTime.UtcNow.AddDays(-2),
                        UpdatedAt = DateTime.UtcNow.AddHours(-8)
                    },
                    new MachineProgram
                    {
                        MachineNumber = 13,
                        Name = "Programa Cerveza Águila 330ml",
                        Articulo = "AG330ML005",
                        OtSap = "OT2024005",
                        Cliente = "Bavaria S.A.",
                        Referencia = "Etiqueta Cerveza Águila 330ml",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Dorado Águila", "Rojo", "Negro", "Blanco", "Azul" }),
                        Sustrato = "Papel Metalizado",
                        Kilos = 300.50m,
                        Estado = "LISTO",
                        FechaInicio = DateTime.UtcNow.AddHours(2),
                        Progreso = 0,
                        Observaciones = "Programado para iniciar en 2 horas",
                        CreatedAt = DateTime.UtcNow.AddHours(-1),
                        UpdatedAt = DateTime.UtcNow.AddHours(-1)
                    },
                    new MachineProgram
                    {
                        MachineNumber = 14,
                        Name = "Programa Leche Alpina 1L",
                        Articulo = "AL1L006",
                        OtSap = "OT2024006",
                        Cliente = "Alpina Productos Alimenticios",
                        Referencia = "Etiqueta Leche Entera Alpina 1L",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Azul Alpina", "Blanco", "Rojo", "Verde" }),
                        Sustrato = "Papel Couché 90g",
                        Kilos = 250.75m,
                        Estado = "CORRIENDO",
                        FechaInicio = DateTime.UtcNow.AddHours(-3),
                        Progreso = 60,
                        Observaciones = "Producción avanzada, buen ritmo",
                        LastActionBy = "Ana Martínez",
                        LastActionAt = DateTime.UtcNow.AddMinutes(-15),
                        LastAction = "Actualización de progreso",
                        CreatedAt = DateTime.UtcNow.AddHours(-4),
                        UpdatedAt = DateTime.UtcNow.AddMinutes(-15)
                    },
                    new MachineProgram
                    {
                        MachineNumber = 15,
                        Name = "Programa Yogurt Alpina 150g",
                        Articulo = "YA150G007",
                        OtSap = "OT2024007",
                        Cliente = "Alpina Productos Alimenticios",
                        Referencia = "Etiqueta Yogurt Griego Alpina 150g",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Azul Alpina", "Blanco", "Dorado", "Rosa" }),
                        Sustrato = "Papel Couché 75g",
                        Kilos = 80.25m,
                        Estado = "LISTO",
                        FechaInicio = DateTime.UtcNow.AddHours(1),
                        Progreso = 0,
                        Observaciones = "Esperando inicio de turno",
                        CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                        UpdatedAt = DateTime.UtcNow.AddMinutes(-30)
                    },
                    new MachineProgram
                    {
                        MachineNumber = 16,
                        Name = "Programa Aceite Gourmet 500ml",
                        Articulo = "GO500ML008",
                        OtSap = "OT2024008",
                        Cliente = "Grasas S.A.",
                        Referencia = "Etiqueta Aceite Gourmet 500ml",
                        Td = "ETQ",
                        Colores = JsonSerializer.Serialize(new List<string> { "Verde Oliva", "Dorado", "Negro", "Blanco" }),
                        Sustrato = "Papel Couché 85g",
                        Kilos = 160.00m,
                        Estado = "SUSPENDIDO",
                        FechaInicio = DateTime.UtcNow.AddHours(-1),
                        Progreso = 25,
                        Observaciones = "Suspendido por falta de material",
                        LastActionBy = "Luis Hernández",
                        LastActionAt = DateTime.UtcNow.AddMinutes(-20),
                        LastAction = "Suspensión por falta de material",
                        CreatedAt = DateTime.UtcNow.AddHours(-2),
                        UpdatedAt = DateTime.UtcNow.AddMinutes(-20)
                    }
                };

                await context.MachinePrograms.AddRangeAsync(samplePrograms);
                await context.SaveChangesAsync();

                Console.WriteLine($"✅ Se crearon {samplePrograms.Count} programas de máquinas de ejemplo");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creando datos de ejemplo para programas de máquinas: {ex.Message}");
            }
        }
    }
}
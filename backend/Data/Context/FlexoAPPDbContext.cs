using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Data.Context
{
    /// <summary>
    /// Contexto de base de datos para FlexoAPP
    /// Maneja todas las entidades y configuraciones de la base de datos MySQL
    /// </summary>
    public class FlexoAPPDbContext : DbContext
    {
        /// <summary>
        /// Constructor del contexto de base de datos
        /// </summary>
        /// <param name="options">Opciones de configuración del contexto</param>
        public FlexoAPPDbContext(DbContextOptions<FlexoAPPDbContext> options) : base(options)
        {
        }
        
        // Conjuntos de entidades (tablas) de la base de datos
        public DbSet<User> Users { get; set; }                      // Tabla de usuarios del sistema
        public DbSet<Design> Designs { get; set; }                  // Tabla de diseños flexográficos
        public DbSet<MachineProgram> MachinePrograms { get; set; }   // Tabla de programas de máquinas
        public DbSet<Maquina> Maquinas { get; set; }                // Tabla de máquinas flexográficas
        public DbSet<Pedido> Pedidos { get; set; }                  // Tabla de pedidos de clientes
        public DbSet<Activity> Activities { get; set; }             // Tabla de actividades y auditoría
        
        /// <summary>
        /// Configuración del modelo de base de datos
        /// Define las relaciones, restricciones e índices de todas las entidades
        /// </summary>
        /// <param name="modelBuilder">Constructor del modelo de Entity Framework</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configuración de la entidad Usuario
            modelBuilder.Entity<User>(entity =>
            {
                // Clave primaria
                entity.HasKey(e => e.Id);
                
                // Código de usuario - requerido y único
                entity.Property(e => e.UserCode)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Índice único para código de usuario
                entity.HasIndex(e => e.UserCode)
                    .IsUnique();
                
                // Contraseña encriptada - requerida
                entity.Property(e => e.Password)
                    .IsRequired()
                    .HasMaxLength(255);
                
                // Nombre del usuario
                entity.Property(e => e.FirstName)
                    .HasMaxLength(50);
                
                // Apellido del usuario
                entity.Property(e => e.LastName)
                    .HasMaxLength(50);
                
                // Rol del usuario - convertido a string y requerido
                entity.Property(e => e.Role)
                    .HasConversion<string>()
                    .IsRequired();
                
                // Permisos del usuario en formato JSON
                entity.Property(e => e.Permissions)
                    .HasColumnType("JSON");
                
                // Imagen de perfil en base64 (texto largo)
                entity.Property(e => e.ProfileImage)
                    .HasColumnType("LONGTEXT");
                
                // URL de imagen de perfil
                entity.Property(e => e.ProfileImageUrl)
                    .HasMaxLength(500);
                
                // Número de teléfono
                entity.Property(e => e.Phone)
                    .HasMaxLength(20);
                
                // Estado activo del usuario - por defecto true
                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);
                
                // Fecha de creación automática
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                // Fecha de actualización automática
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Índices para optimizar consultas
                entity.HasIndex(e => e.Role);      // Índice por rol
                entity.HasIndex(e => e.IsActive);  // Índice por estado activo
            });

            // Configuración de la entidad Diseño - estructura mínima y flexible
            modelBuilder.Entity<Design>(entity =>
            {
                // Mapear a tabla 'designs'
                entity.ToTable("designs");
                entity.HasKey(e => e.Id);
                
                // Configurar ID como auto-generado
                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd();
                
                // Columnas de colores con espacios en los nombres (compatibilidad con BD existente)
                entity.Property(e => e.Color1).HasColumnName("color 1");
                entity.Property(e => e.Color2).HasColumnName("color 2");
                entity.Property(e => e.Color3).HasColumnName("color 3");
                entity.Property(e => e.Color4).HasColumnName("color 4");
                entity.Property(e => e.Color5).HasColumnName("color 5");
                entity.Property(e => e.Color6).HasColumnName("color 6");
                entity.Property(e => e.Color7).HasColumnName("color 7");
                entity.Property(e => e.Color8).HasColumnName("color 8");
                entity.Property(e => e.Color9).HasColumnName("color 9");
                entity.Property(e => e.Color10).HasColumnName("color 10");
                
                // Ignorar propiedades de navegación no utilizadas
                entity.Ignore(e => e.CreatedByUserId);
                entity.Ignore(e => e.CreatedBy);
            });



            // Configuración de la entidad Pedido
            modelBuilder.Entity<Pedido>(entity =>
            {
                // Mapear a tabla 'pedidos'
                entity.ToTable("pedidos");
                entity.HasKey(e => e.Id);
                
                // Número de máquina asignada - requerido
                entity.Property(e => e.MachineNumber)
                    .IsRequired();
                
                // Número único del pedido - requerido
                entity.Property(e => e.NumeroPedido)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Índice único para número de pedido
                entity.HasIndex(e => e.NumeroPedido)
                    .IsUnique();
                
                // Código del artículo - requerido
                entity.Property(e => e.Articulo)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Nombre del cliente - requerido
                entity.Property(e => e.Cliente)
                    .IsRequired()
                    .HasMaxLength(200);
                
                // Descripción del pedido
                entity.Property(e => e.Descripcion)
                    .HasMaxLength(500);
                
                // Cantidad solicitada - requerida con decimales
                entity.Property(e => e.Cantidad)
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,2)");
                
                // Unidad de medida - por defecto kilogramos
                entity.Property(e => e.Unidad)
                    .HasMaxLength(50)
                    .HasDefaultValue("kg");
                
                // Estado del pedido - por defecto PENDIENTE
                entity.Property(e => e.Estado)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("PENDIENTE");
                
                // Fecha del pedido - requerida
                entity.Property(e => e.FechaPedido)
                    .IsRequired();
                
                // Fecha de entrega estimada
                entity.Property(e => e.FechaEntrega);
                
                // Prioridad del pedido - por defecto NORMAL
                entity.Property(e => e.Prioridad)
                    .HasMaxLength(20)
                    .HasDefaultValue("NORMAL");
                
                // Observaciones adicionales
                entity.Property(e => e.Observaciones)
                    .HasMaxLength(1000);
                
                // Usuario asignado al pedido
                entity.Property(e => e.AsignadoA)
                    .HasMaxLength(100);
                
                // Fecha de asignación
                entity.Property(e => e.FechaAsignacion);
                
                // Fecha de creación automática
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                // Fecha de actualización automática
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Relaciones de clave foránea
                entity.HasOne(e => e.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                // Índices para optimizar consultas
                entity.HasIndex(e => e.MachineNumber);                    // Por número de máquina
                entity.HasIndex(e => e.Estado);                          // Por estado
                entity.HasIndex(e => e.FechaPedido);                     // Por fecha de pedido
                entity.HasIndex(e => e.Prioridad);                       // Por prioridad
                entity.HasIndex(e => new { e.MachineNumber, e.Estado }); // Compuesto: máquina y estado
                entity.HasIndex(e => new { e.Cliente, e.Estado });       // Compuesto: cliente y estado
            });

            // Configuración de la entidad Programa de Máquina
            modelBuilder.Entity<MachineProgram>(entity =>
            {
                // Mapear a tabla 'machine_programs'
                entity.ToTable("machine_programs");
                entity.HasKey(e => e.Id);
                
                // Número de máquina flexográfica - requerido
                entity.Property(e => e.MachineNumber)
                    .IsRequired();
                
                // Nombre descriptivo del programa - requerido
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);
                
                // Código del artículo a producir - requerido
                entity.Property(e => e.Articulo)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Orden de trabajo SAP - requerido y único
                entity.Property(e => e.OtSap)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Índice único para orden de trabajo SAP
                entity.HasIndex(e => e.OtSap)
                    .IsUnique();
                
                // Nombre del cliente - requerido
                entity.Property(e => e.Cliente)
                    .IsRequired()
                    .HasMaxLength(200);
                
                // Referencia del producto
                entity.Property(e => e.Referencia)
                    .HasMaxLength(500);
                
                // Tipo de documento (ETQ, BOL, etc.)
                entity.Property(e => e.Td)
                    .HasMaxLength(3);
                
                // Array de colores en formato JSON - requerido
                entity.Property(e => e.Colores)
                    .IsRequired()
                    .HasColumnType("JSON");
                
                // Material del sustrato
                entity.Property(e => e.Sustrato)
                    .HasMaxLength(200);
                
                // Cantidad en kilogramos - requerido con decimales
                entity.Property(e => e.Kilos)
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,2)");
                
                // Estado del programa - por defecto LISTO
                entity.Property(e => e.Estado)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("LISTO");
                
                // Fecha y hora de inicio - requerida
                entity.Property(e => e.FechaInicio)
                    .IsRequired();
                
                // Porcentaje de progreso - por defecto 0
                entity.Property(e => e.Progreso)
                    .HasDefaultValue(0);
                
                // Observaciones adicionales
                entity.Property(e => e.Observaciones)
                    .HasMaxLength(1000);
                
                // Usuario que realizó la última acción
                entity.Property(e => e.LastActionBy)
                    .HasMaxLength(100);
                
                // Descripción de la última acción
                entity.Property(e => e.LastAction)
                    .HasMaxLength(200);
                
                // Nombre del operario asignado
                entity.Property(e => e.OperatorName)
                    .HasMaxLength(100);
                
                // Fecha de creación automática
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                // Fecha de actualización automática
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Relaciones de clave foránea con propiedades de navegación explícitas
                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(u => u.CreatedPrograms)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany(u => u.UpdatedPrograms)
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                // Índices para optimizar consultas
                entity.HasIndex(e => e.MachineNumber);                    // Por número de máquina
                entity.HasIndex(e => e.Estado);                          // Por estado
                entity.HasIndex(e => e.FechaInicio);                     // Por fecha de inicio
                entity.HasIndex(e => new { e.MachineNumber, e.Estado }); // Compuesto: máquina y estado
            });

            // Configuración de la entidad Máquina
            modelBuilder.Entity<Maquina>(entity =>
            {
                // Mapear a tabla 'maquinas'
                entity.ToTable("maquinas");
                entity.HasKey(e => e.Id);
                
                // Número de máquina flexográfica (11-21) - requerido y único por registro activo
                entity.Property(e => e.NumeroMaquina)
                    .IsRequired();
                
                // Código del artículo a producir - requerido
                entity.Property(e => e.Articulo)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Orden de trabajo SAP - requerido
                entity.Property(e => e.OtSap)
                    .IsRequired()
                    .HasMaxLength(50);
                
                // Nombre del cliente - requerido
                entity.Property(e => e.Cliente)
                    .IsRequired()
                    .HasMaxLength(200);
                
                // Referencia del producto
                entity.Property(e => e.Referencia)
                    .HasMaxLength(100);
                
                // Código TD (Tipo de Diseño)
                entity.Property(e => e.Td)
                    .HasMaxLength(10);
                
                // Número de colores - requerido
                entity.Property(e => e.NumeroColores)
                    .IsRequired();
                
                // Array de colores en formato JSON - requerido
                entity.Property(e => e.Colores)
                    .IsRequired()
                    .HasColumnType("JSON");
                
                // Cantidad en kilogramos - requerido con decimales
                entity.Property(e => e.Kilos)
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,2)");
                
                // Fecha y hora de tinta en máquina - requerida
                entity.Property(e => e.FechaTintaEnMaquina)
                    .IsRequired();
                
                // Material del sustrato - requerido
                entity.Property(e => e.Sustrato)
                    .IsRequired()
                    .HasMaxLength(100);
                
                // Estado del programa - por defecto LISTO
                entity.Property(e => e.Estado)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("LISTO");
                
                // Observaciones adicionales
                entity.Property(e => e.Observaciones)
                    .HasMaxLength(1000);
                
                // Usuario que realizó la última acción
                entity.Property(e => e.LastActionBy)
                    .HasMaxLength(100);
                
                // Fecha de la última acción
                entity.Property(e => e.LastActionAt);
                
                // Fecha de creación automática
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                // Fecha de actualización automática
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Relaciones de clave foránea
                entity.HasOne(e => e.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                // Índices para optimizar consultas
                entity.HasIndex(e => e.NumeroMaquina);                    // Por número de máquina
                entity.HasIndex(e => e.Estado);                          // Por estado
                entity.HasIndex(e => e.FechaTintaEnMaquina);             // Por fecha de tinta en máquina
                entity.HasIndex(e => new { e.NumeroMaquina, e.Estado }); // Compuesto: máquina y estado
                entity.HasIndex(e => e.OtSap);                           // Por orden SAP
                entity.HasIndex(e => e.Cliente);                         // Por cliente
            });

            // Configuración de la entidad Actividad (Auditoría)
            modelBuilder.Entity<Activity>(entity =>
            {
                // Mapear a tabla 'Activities'
                entity.ToTable("Activities");
                entity.HasKey(e => e.Id);
                
                // Acción realizada - requerida
                entity.Property(e => e.Action)
                    .IsRequired()
                    .HasMaxLength(200);
                
                // Descripción de la actividad - requerida
                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(500);
                
                // Módulo donde se realizó la actividad - requerido
                entity.Property(e => e.Module)
                    .IsRequired()
                    .HasMaxLength(100);
                
                // Detalles adicionales de la actividad
                entity.Property(e => e.Details)
                    .HasMaxLength(1000);
                
                // Código del usuario que realizó la actividad
                entity.Property(e => e.UserCode)
                    .HasMaxLength(50);
                
                // Dirección IP desde donde se realizó la actividad
                entity.Property(e => e.IpAddress)
                    .HasMaxLength(45);
                
                // Marca de tiempo automática - requerida
                entity.Property(e => e.Timestamp)
                    .IsRequired()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                // Relación de clave foránea con usuario
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Índices para optimizar consultas de auditoría
                entity.HasIndex(e => e.UserId);                          // Por usuario
                entity.HasIndex(e => e.Module);                          // Por módulo
                entity.HasIndex(e => e.Timestamp);                       // Por fecha/hora
                entity.HasIndex(e => new { e.UserId, e.Timestamp });     // Compuesto: usuario y fecha
            });
        }
    }
}

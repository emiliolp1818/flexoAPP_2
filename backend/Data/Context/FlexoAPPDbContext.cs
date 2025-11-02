using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Data.Context
{
    public class FlexoAPPDbContext : DbContext
    {
        public FlexoAPPDbContext(DbContextOptions<FlexoAPPDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Design> Designs { get; set; }
        public DbSet<MachineProgram> MachinePrograms { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<Activity> Activities { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.UserCode)
                    .IsRequired()
                    .HasMaxLength(50);
                
                entity.HasIndex(e => e.UserCode)
                    .IsUnique();
                
                entity.Property(e => e.Password)
                    .IsRequired()
                    .HasMaxLength(255);
                
                entity.Property(e => e.FirstName)
                    .HasMaxLength(50);
                
                entity.Property(e => e.LastName)
                    .HasMaxLength(50);
                
                entity.Property(e => e.Role)
                    .HasConversion<string>()
                    .IsRequired();
                
                entity.Property(e => e.Permissions)
                    .HasColumnType("JSON");
                
                entity.Property(e => e.ProfileImage)
                    .HasColumnType("LONGTEXT");
                
                entity.Property(e => e.ProfileImageUrl)
                    .HasMaxLength(500);
                
                entity.Property(e => e.Phone)
                    .HasMaxLength(20);
                
                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);
                
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Indexes
                entity.HasIndex(e => e.Role);
                entity.HasIndex(e => e.IsActive);
            });

            // Design configuration - minimal and flexible
            modelBuilder.Entity<Design>(entity =>
            {
                entity.ToTable("designs");
                entity.HasKey(e => e.Id);
                
                // Configure Id as auto-generated
                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd();
                
                // Color columns with spaces in names
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
                
                // Ignore navigation properties
                entity.Ignore(e => e.CreatedByUserId);
                entity.Ignore(e => e.CreatedBy);
            });



            // Pedido configuration
            modelBuilder.Entity<Pedido>(entity =>
            {
                entity.ToTable("pedidos");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.MachineNumber)
                    .IsRequired();
                
                entity.Property(e => e.NumeroPedido)
                    .IsRequired()
                    .HasMaxLength(50);
                
                entity.HasIndex(e => e.NumeroPedido)
                    .IsUnique();
                
                entity.Property(e => e.Articulo)
                    .IsRequired()
                    .HasMaxLength(50);
                
                entity.Property(e => e.Cliente)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Descripcion)
                    .HasMaxLength(500);
                
                entity.Property(e => e.Cantidad)
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,2)");
                
                entity.Property(e => e.Unidad)
                    .HasMaxLength(50)
                    .HasDefaultValue("kg");
                
                entity.Property(e => e.Estado)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("PENDIENTE");
                
                entity.Property(e => e.FechaPedido)
                    .IsRequired();
                
                entity.Property(e => e.FechaEntrega);
                
                entity.Property(e => e.Prioridad)
                    .HasMaxLength(20)
                    .HasDefaultValue("NORMAL");
                
                entity.Property(e => e.Observaciones)
                    .HasMaxLength(1000);
                
                entity.Property(e => e.AsignadoA)
                    .HasMaxLength(100);
                
                entity.Property(e => e.FechaAsignacion);
                
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Foreign key relationships
                entity.HasOne(e => e.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                // Indexes
                entity.HasIndex(e => e.MachineNumber);
                entity.HasIndex(e => e.Estado);
                entity.HasIndex(e => e.FechaPedido);
                entity.HasIndex(e => e.Prioridad);
                entity.HasIndex(e => new { e.MachineNumber, e.Estado });
                entity.HasIndex(e => new { e.Cliente, e.Estado });
            });

            // MachineProgram configuration
            modelBuilder.Entity<MachineProgram>(entity =>
            {
                entity.ToTable("machine_programs");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.MachineNumber)
                    .IsRequired();
                
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Articulo)
                    .IsRequired()
                    .HasMaxLength(50);
                
                entity.Property(e => e.OtSap)
                    .IsRequired()
                    .HasMaxLength(50);
                
                entity.HasIndex(e => e.OtSap)
                    .IsUnique();
                
                entity.Property(e => e.Cliente)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Referencia)
                    .HasMaxLength(500);
                
                entity.Property(e => e.Td)
                    .HasMaxLength(3);
                
                entity.Property(e => e.Colores)
                    .IsRequired()
                    .HasColumnType("JSON");
                
                entity.Property(e => e.Sustrato)
                    .HasMaxLength(200);
                
                entity.Property(e => e.Kilos)
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,2)");
                
                entity.Property(e => e.Estado)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("LISTO");
                
                entity.Property(e => e.FechaInicio)
                    .IsRequired();
                
                entity.Property(e => e.Progreso)
                    .HasDefaultValue(0);
                
                entity.Property(e => e.Observaciones)
                    .HasMaxLength(1000);
                
                entity.Property(e => e.LastActionBy)
                    .HasMaxLength(100);
                
                entity.Property(e => e.LastAction)
                    .HasMaxLength(200);
                
                entity.Property(e => e.OperatorName)
                    .HasMaxLength(100);
                
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                
                // Foreign key relationships with explicit navigation properties
                entity.HasOne(e => e.CreatedByUser)
                    .WithMany(u => u.CreatedPrograms)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasOne(e => e.UpdatedByUser)
                    .WithMany(u => u.UpdatedPrograms)
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                
                // Indexes
                entity.HasIndex(e => e.MachineNumber);
                entity.HasIndex(e => e.Estado);
                entity.HasIndex(e => e.FechaInicio);
                entity.HasIndex(e => new { e.MachineNumber, e.Estado });
            });

            // Activity configuration
            modelBuilder.Entity<Activity>(entity =>
            {
                entity.ToTable("Activities");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Action)
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(500);
                
                entity.Property(e => e.Module)
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(e => e.Details)
                    .HasMaxLength(1000);
                
                entity.Property(e => e.UserCode)
                    .HasMaxLength(50);
                
                entity.Property(e => e.IpAddress)
                    .HasMaxLength(45);
                
                entity.Property(e => e.Timestamp)
                    .IsRequired()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                
                // Foreign key relationship
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Indexes
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Module);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => new { e.UserId, e.Timestamp });
            });
        }
    }
}
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Models.Entities;
using flexoAPP.Models;

namespace FlexoAPP.API.Data.Context
{




    public class FlexoAPPDbContext : DbContext
    {
        public FlexoAPPDbContext(DbContextOptions<FlexoAPPDbContext> options) : base(options)
        {
        }


        public DbSet<User> Users { get; set; }
        public DbSet<Design> Designs { get; set; }
        public DbSet<Maquina> Maquinas { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<CondicionUnica> CondicionUnica { get; set; }
        public DbSet<Documento> Documentos { get; set; }
        public DbSet<SystemConfig> SystemConfigs { get; set; }
        public DbSet<Anilox> Anilox { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.UserCode).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.UserCode).IsUnique();

                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Role).HasConversion<string>().IsRequired();


                entity.Property(e => e.Permissions).HasColumnType("JSON");


                entity.Property(e => e.ProfileImage).HasColumnType("LONGTEXT");
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.IsActive).HasDefaultValue(true);


                entity.Property(e => e.CreatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Role);
                entity.HasIndex(e => e.IsActive);
            });


            modelBuilder.Entity<Design>(entity =>
            {
                entity.ToTable("designs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();


                entity.Property(e => e.AnchoMm).HasColumnName("ancho_mm");


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

                entity.Ignore(e => e.CreatedByUserId);
                entity.Ignore(e => e.CreatedBy);
            });





            modelBuilder.Entity<Maquina>(entity =>
            {


                entity.ToTable("maquinas");



                entity.HasKey(e => e.OtSap);






                entity.Property(e => e.OtSap)
                    .HasColumnName("ot_sap")
                    .IsRequired()
                    .HasMaxLength(50);



                entity.Property(e => e.Articulo)
                    .HasColumnName("articulo")
                    .IsRequired()
                    .HasMaxLength(50);



                entity.Property(e => e.NumeroMaquina)
                    .HasColumnName("numero_maquina")
                    .IsRequired();



                entity.Property(e => e.Cliente)
                    .HasColumnName("cliente")
                    .IsRequired()
                    .HasMaxLength(200);



                entity.Property(e => e.Referencia)
                    .HasColumnName("referencia")
                    .HasMaxLength(100);



                entity.Property(e => e.Td)
                    .HasColumnName("td")
                    .HasMaxLength(10);



                entity.Property(e => e.NumeroColores)
                    .HasColumnName("numero_colores")
                    .IsRequired();



                entity.Property(e => e.Colores)
                    .HasColumnName("colores")
                    .IsRequired()
                    .HasColumnType("JSON");



                entity.Property(e => e.Kilos)
                    .HasColumnName("kilos")
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,3)");



                entity.Property(e => e.FechaTintaEnMaquina)
                    .HasColumnName("fecha_tinta_en_maquina")
                    .IsRequired();



                entity.Property(e => e.Sustrato)
                    .HasColumnName("sustrato")
                    .IsRequired()
                    .HasMaxLength(100);



                entity.Property(e => e.Estado)
                    .HasColumnName("estado")
                    .IsRequired(false)
                    .HasMaxLength(20)
                    .HasDefaultValue(null);



                entity.Property(e => e.Observaciones)
                    .HasColumnName("observaciones")
                    .HasMaxLength(1000);



                entity.Property(e => e.LastActionBy)
                    .HasColumnName("last_action_by")
                    .HasMaxLength(100);



                entity.Property(e => e.LastActionAt)
                    .HasColumnName("last_action_at");



                entity.Property(e => e.CreatedBy)
                    .HasColumnName("created_by");



                entity.Property(e => e.UpdatedBy)
                    .HasColumnName("updated_by");



                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("TIMESTAMP")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");



                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at")
                    .HasColumnType("TIMESTAMP")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");



                        entity.HasOne(e => e.CreatedByUser)
                            .WithMany(u => u.CreatedMaquinas)
                            .HasForeignKey(e => e.CreatedBy)
                            .HasPrincipalKey(u => u.Id)
                            .OnDelete(DeleteBehavior.SetNull);

                        entity.HasOne(e => e.UpdatedByUser)
                            .WithMany(u => u.UpdatedMaquinas)
                            .HasForeignKey(e => e.UpdatedBy)
                            .HasPrincipalKey(u => u.Id)
                            .OnDelete(DeleteBehavior.SetNull);



                entity.HasIndex(e => e.NumeroMaquina);
                entity.HasIndex(e => e.Estado);
                entity.HasIndex(e => e.FechaTintaEnMaquina);
                entity.HasIndex(e => new { e.NumeroMaquina, e.Estado });
                entity.HasIndex(e => e.Cliente);
            });


            modelBuilder.Entity<Activity>(entity =>
            {
                entity.ToTable("Activities");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Action).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Module).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Details).HasMaxLength(1000);
                entity.Property(e => e.UserCode).HasMaxLength(50);
                entity.Property(e => e.IpAddress).HasMaxLength(45);


                entity.Property(e => e.Timestamp).IsRequired().HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");


                entity.Property(e => e.Duration)
                    .HasConversion(
                        v => v.HasValue ? v.Value.Ticks : (long?)null,
                        v => v.HasValue ? TimeSpan.FromTicks(v.Value) : (TimeSpan?)null
                    );

                entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Module);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => new { e.UserId, e.Timestamp });
            });


            modelBuilder.Entity<CondicionUnica>(entity =>
            {
                entity.ToTable("condicionunica");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.FArticulo).IsRequired().HasMaxLength(50).HasColumnName("farticulo");
                entity.Property(e => e.Descripcion).IsRequired().HasMaxLength(500).HasColumnName("descripcion");
                entity.Property(e => e.Estante).IsRequired().HasMaxLength(50).HasColumnName("estante");
                entity.Property(e => e.NumeroCarpeta).IsRequired().HasMaxLength(50).HasColumnName("numerocarpeta");


                entity.Property(e => e.CreatedDate).HasColumnName("createddate").HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastModified).HasColumnName("lastmodified").HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");


                entity.HasIndex(e => e.FArticulo);
                entity.HasIndex(e => e.Estante);
                entity.HasIndex(e => e.LastModified);
            });


            modelBuilder.Entity<SystemConfig>(entity =>
            {
                entity.ToTable("system_configs");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Value).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50).HasDefaultValue("string");
                entity.Property(e => e.Category).IsRequired().HasMaxLength(100).HasDefaultValue("General");
                entity.Property(e => e.Options).HasMaxLength(1000);


                entity.Property(e => e.CreatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");


                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Type);
            });


            modelBuilder.Entity<Anilox>(entity =>
            {
                entity.ToTable("anilox");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Codigo).IsUnique();

                entity.Property(e => e.Maquina).IsRequired();
                entity.Property(e => e.Bcm).IsRequired();
                entity.Property(e => e.Lineatura).IsRequired();
                entity.Property(e => e.Marca).IsRequired().HasMaxLength(50);
                entity.Property(e => e.VolumenReal).IsRequired().HasColumnType("DECIMAL(10,2)");


                entity.Property(e => e.CreatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");


                entity.HasIndex(e => e.Maquina);
                entity.HasIndex(e => e.Marca);
            });
        }
    }
}

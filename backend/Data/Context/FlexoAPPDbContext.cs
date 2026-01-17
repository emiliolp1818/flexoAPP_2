using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Models.Entities;
using flexoAPP.Models;

namespace FlexoAPP.API.Data.Context
{
    /// <summary>
    /// Contexto de base de datos para FlexoAPP - MySQL Edition
    /// Maneja todas las entidades y configuraciones de la base de datos MySQL
    /// </summary>
    public class FlexoAPPDbContext : DbContext
    {
        public FlexoAPPDbContext(DbContextOptions<FlexoAPPDbContext> options) : base(options)
        {
        }
        
        // Conjuntos de entidades (tablas) de la base de datos
        public DbSet<User> Users { get; set; }
        public DbSet<Design> Designs { get; set; }
        public DbSet<Maquina> Maquinas { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<CondicionUnica> CondicionUnica { get; set; }
        public DbSet<Documento> Documentos { get; set; } // Tabla de documentos
        public DbSet<SystemConfig> SystemConfigs { get; set; } // Tabla de configuraciones del sistema
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // ===== CONFIGURACIÓN USUARIO =====
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.UserCode).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.UserCode).IsUnique();
                
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Role).HasConversion<string>().IsRequired();
                
                // MySQL: JSON en lugar de jsonb
                entity.Property(e => e.Permissions).HasColumnType("JSON");
                
                // MySQL: LONGTEXT en lugar de text - Almacena imágenes en base64 o URLs
                entity.Property(e => e.ProfileImage).HasColumnType("LONGTEXT");
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                
                // MySQL: CURRENT_TIMESTAMP - usando TIMESTAMP para compatibilidad
                entity.Property(e => e.CreatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                
                entity.HasIndex(e => e.Role);
                entity.HasIndex(e => e.IsActive);
            });

            // ===== CONFIGURACIÓN DISEÑO =====
            modelBuilder.Entity<Design>(entity =>
            {
                entity.ToTable("designs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                
                // Columnas con espacios (compatibilidad con BD existente)
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

            // ===== CONFIGURACIÓN MÁQUINA =====
            // Tabla: maquinas (base de datos: flexoapp_bd)
            // CLAVE PRIMARIA: OtSap (Orden de Trabajo SAP)
            // Articulo puede repetirse
            modelBuilder.Entity<Maquina>(entity =>
            {
                // ===== CONFIGURACIÓN DE TABLA =====
                // ToTable: especifica el nombre de la tabla en MySQL
                entity.ToTable("maquinas"); // Nombre de la tabla: maquinas
                
                // ===== CLAVE PRIMARIA =====
                // HasKey: define qué campo es la clave primaria (PRIMARY KEY)
                entity.HasKey(e => e.OtSap); // PRIMARY KEY: ot_sap VARCHAR(50)
                
                // ===== MAPEO DE COLUMNAS (C# PascalCase -> MySQL snake_case) =====
                // HasColumnName: mapea el nombre de la propiedad C# al nombre de la columna MySQL
                
                // OtSap: orden de trabajo SAP
                // Propiedad C#: OtSap -> Columna MySQL: ot_sap
                entity.Property(e => e.OtSap)
                    .HasColumnName("ot_sap") // Mapeo explícito a snake_case
                    .IsRequired()
                    .HasMaxLength(50);

                // Articulo: código del producto
                // Propiedad C#: Articulo -> Columna MySQL: articulo
                entity.Property(e => e.Articulo)
                    .HasColumnName("articulo") // Mapeo explícito a minúsculas
                    .IsRequired() // NOT NULL
                    .HasMaxLength(50); // VARCHAR(50)
                
                // NumeroMaquina: número de máquina (11-21), obligatorio
                // Propiedad C#: NumeroMaquina -> Columna MySQL: numero_maquina
                entity.Property(e => e.NumeroMaquina)
                    .HasColumnName("numero_maquina") // Mapeo explícito a snake_case
                    .IsRequired(); // NOT NULL
                
                // Cliente: nombre del cliente
                // Propiedad C#: Cliente -> Columna MySQL: cliente
                entity.Property(e => e.Cliente)
                    .HasColumnName("cliente") // Mapeo explícito a minúsculas
                    .IsRequired()
                    .HasMaxLength(200);
                
                // Referencia: referencia del producto
                // Propiedad C#: Referencia -> Columna MySQL: referencia
                entity.Property(e => e.Referencia)
                    .HasColumnName("referencia") // Mapeo explícito a minúsculas
                    .HasMaxLength(100);
                
                // Td: código TD (Tipo de Diseño)
                // Propiedad C#: Td -> Columna MySQL: td
                entity.Property(e => e.Td)
                    .HasColumnName("td") // Mapeo explícito a minúsculas
                    .HasMaxLength(10);
                
                // NumeroColores: cantidad de colores
                // Propiedad C#: NumeroColores -> Columna MySQL: numero_colores
                entity.Property(e => e.NumeroColores)
                    .HasColumnName("numero_colores") // Mapeo explícito a snake_case
                    .IsRequired();
                
                // Colores: array JSON de colores
                // Propiedad C#: Colores -> Columna MySQL: colores
                entity.Property(e => e.Colores)
                    .HasColumnName("colores") // Mapeo explícito a minúsculas
                    .IsRequired()
                    .HasColumnType("JSON"); // MySQL: JSON en lugar de jsonb
                
                // Kilos: cantidad en kilogramos
                // Propiedad C#: Kilos -> Columna MySQL: kilos
                entity.Property(e => e.Kilos)
                    .HasColumnName("kilos") // Mapeo explícito a minúsculas
                    .IsRequired()
                    .HasColumnType("DECIMAL(10,2)");
                
                // FechaTintaEnMaquina: fecha de aplicación de tinta
                // Propiedad C#: FechaTintaEnMaquina -> Columna MySQL: fecha_tinta_en_maquina
                entity.Property(e => e.FechaTintaEnMaquina)
                    .HasColumnName("fecha_tinta_en_maquina") // Mapeo explícito a snake_case
                    .IsRequired();
                
                // Sustrato: tipo de material base
                // Propiedad C#: Sustrato -> Columna MySQL: sustrato
                entity.Property(e => e.Sustrato)
                    .HasColumnName("sustrato") // Mapeo explícito a minúsculas
                    .IsRequired()
                    .HasMaxLength(100);
                
                // Estado: estado actual del programa
                // Propiedad C#: Estado -> Columna MySQL: estado
                entity.Property(e => e.Estado)
                    .HasColumnName("estado") // Mapeo explícito a minúsculas
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("LISTO");
                
                // Observaciones: notas adicionales
                // Propiedad C#: Observaciones -> Columna MySQL: observaciones
                entity.Property(e => e.Observaciones)
                    .HasColumnName("observaciones") // Mapeo explícito a minúsculas
                    .HasMaxLength(1000);
                
                // LastActionBy: usuario que realizó la última acción
                // Propiedad C#: LastActionBy -> Columna MySQL: last_action_by
                entity.Property(e => e.LastActionBy)
                    .HasColumnName("last_action_by") // Mapeo explícito a snake_case
                    .HasMaxLength(100);
                
                // LastActionAt: timestamp de la última acción
                // Propiedad C#: LastActionAt -> Columna MySQL: last_action_at
                entity.Property(e => e.LastActionAt)
                    .HasColumnName("last_action_at"); // Mapeo explícito a snake_case
                
                // CreatedBy: ID del usuario creador
                // Propiedad C#: CreatedBy -> Columna MySQL: created_by
                entity.Property(e => e.CreatedBy)
                    .HasColumnName("created_by"); // Mapeo explícito a snake_case
                
                // UpdatedBy: ID del usuario actualizador
                // Propiedad C#: UpdatedBy -> Columna MySQL: updated_by
                entity.Property(e => e.UpdatedBy)
                    .HasColumnName("updated_by"); // Mapeo explícito a snake_case
                
                // CreatedAt: timestamp de creación
                // Propiedad C#: CreatedAt -> Columna MySQL: created_at
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at") // Mapeo explícito a snake_case
                    .HasColumnType("TIMESTAMP")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                // UpdatedAt: timestamp de última actualización
                // Propiedad C#: UpdatedAt -> Columna MySQL: updated_at
                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at") // Mapeo explícito a snake_case
                    .HasColumnType("TIMESTAMP")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                
                // ===== RELACIONES CON TABLA USERS =====
                    // Configurar relaciones con la entidad User (creador / actualizador)
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
                
                // ===== ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS =====
                // Crear índices en columnas frecuentemente consultadas
                entity.HasIndex(e => e.NumeroMaquina); // Índice en numero_maquina
                entity.HasIndex(e => e.Estado); // Índice en estado
                entity.HasIndex(e => e.FechaTintaEnMaquina); // Índice en fecha_tinta_en_maquina
                entity.HasIndex(e => new { e.NumeroMaquina, e.Estado }); // Índice compuesto
                entity.HasIndex(e => e.Cliente); // Índice en cliente
            });

            // ===== CONFIGURACIÓN ACTIVIDAD =====
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
                
                // MySQL timestamp - usando TIMESTAMP para compatibilidad
                entity.Property(e => e.Timestamp).IsRequired().HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
                
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Module);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => new { e.UserId, e.Timestamp });
            });

            // ===== CONFIGURACIÓN CONDICIÓN ÚNICA =====
            modelBuilder.Entity<CondicionUnica>(entity =>
            {
                entity.ToTable("condicionunica");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                
                entity.Property(e => e.FArticulo).IsRequired().HasMaxLength(50).HasColumnName("farticulo");
                entity.Property(e => e.Descripcion).IsRequired().HasMaxLength(500).HasColumnName("descripcion");
                entity.Property(e => e.Estante).IsRequired().HasMaxLength(50).HasColumnName("estante");
                entity.Property(e => e.NumeroCarpeta).IsRequired().HasMaxLength(50).HasColumnName("numerocarpeta");
                
                // MySQL timestamps - usando TIMESTAMP en lugar de DATETIME para compatibilidad
                entity.Property(e => e.CreatedDate).HasColumnName("createddate").HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastModified).HasColumnName("lastmodified").HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                
                // Índices para mejorar el rendimiento de búsquedas
                entity.HasIndex(e => e.FArticulo);
                entity.HasIndex(e => e.Estante);
                entity.HasIndex(e => e.LastModified);
            });

            // ===== CONFIGURACIÓN SYSTEM CONFIG =====
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
                
                // MySQL timestamps
                entity.Property(e => e.CreatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("TIMESTAMP").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                
                // Índices
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Type);
            });
        }
    }
}

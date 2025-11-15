using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlexoAPP.API.Models.Enums;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad User - Representa un usuario del sistema FlexoAPP
    /// Tabla en MySQL: users (base de datos: flexoapp_bd)
    /// </summary>
    [Table("users")] // Mapeo a la tabla "users" en MySQL
    public class User
    {
        /// <summary>
        /// ID único del usuario (clave primaria autoincremental)
        /// Columna MySQL: Id INT AUTO_INCREMENT PRIMARY KEY
        /// </summary>
        [Key]
        [Column("Id")] // Mapeo explícito a la columna "Id" (PascalCase en MySQL)
        public int Id { get; set; }

        /// <summary>
        /// Código único de usuario (ej: admin, 90009, 54190)
        /// Columna MySQL: UserCode VARCHAR(50) NOT NULL UNIQUE
        /// </summary>
        [Required]
        [Column("UserCode")] // Mapeo explícito a la columna "UserCode"
        [StringLength(50)]
        public string UserCode { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña hasheada con bcrypt
        /// Columna MySQL: Password VARCHAR(255) NOT NULL
        /// IMPORTANTE: Nunca se almacena en texto plano
        /// </summary>
        [Required]
        [Column("Password")] // Mapeo explícito a la columna "Password"
        [StringLength(255)]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Primer nombre del usuario
        /// Columna MySQL: FirstName VARCHAR(50) NULL
        /// </summary>
        [Column("FirstName")] // Mapeo explícito a la columna "FirstName"
        [StringLength(50)]
        public string? FirstName { get; set; }

        /// <summary>
        /// Apellido del usuario
        /// Columna MySQL: LastName VARCHAR(50) NULL
        /// </summary>
        [Column("LastName")] // Mapeo explícito a la columna "LastName"
        [StringLength(50)]
        public string? LastName { get; set; }

        /// <summary>
        /// Rol del usuario (Admin, Supervisor, Operador, Prealistador, Matizadores, etc.)
        /// Columna MySQL: Role VARCHAR(255) NOT NULL
        /// Se convierte de enum UserRole a string en la base de datos
        /// </summary>
        [Column("Role")] // Mapeo explícito a la columna "Role"
        public UserRole Role { get; set; } = UserRole.Operario;

        /// <summary>
        /// Permisos específicos del usuario en formato JSON
        /// Columna MySQL: Permissions JSON NULL
        /// Ejemplo: {"canEdit": true, "canDelete": false}
        /// </summary>
        [Column("Permissions")] // Mapeo explícito a la columna "Permissions"
        public string? Permissions { get; set; }

        /// <summary>
        /// Imagen de perfil en formato base64
        /// Columna MySQL: ProfileImage LONGTEXT NULL
        /// </summary>
        [Column("ProfileImage")] // Mapeo explícito a la columna "ProfileImage"
        public string? ProfileImage { get; set; }

        /// <summary>
        /// URL de la imagen de perfil (alternativa a base64)
        /// Columna MySQL: ProfileImageUrl VARCHAR(500) NULL
        /// </summary>
        [Column("ProfileImageUrl")] // Mapeo explícito a la columna "ProfileImageUrl"
        public string? ProfileImageUrl { get; set; }

        /// <summary>
        /// Correo electrónico del usuario
        /// Columna MySQL: Email VARCHAR(100) NULL
        /// </summary>
        [Column("Email")] // Mapeo explícito a la columna "Email"
        [StringLength(100)]
        public string? Email { get; set; }

        /// <summary>
        /// Número de teléfono del usuario
        /// Columna MySQL: Phone VARCHAR(20) NULL
        /// </summary>
        [Column("Phone")] // Mapeo explícito a la columna "Phone"
        [StringLength(20)]
        public string? Phone { get; set; }

        /// <summary>
        /// Indica si el usuario está activo (true) o deshabilitado (false)
        /// Columna MySQL: IsActive TINYINT(1) NOT NULL DEFAULT 1
        /// </summary>
        [Column("IsActive")] // Mapeo explícito a la columna "IsActive"
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Fecha y hora de creación del usuario
        /// Columna MySQL: CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        /// </summary>
        [Column("CreatedAt")] // Mapeo explícito a la columna "CreatedAt"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Fecha y hora de última actualización del usuario
        /// Columna MySQL: UpdatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        /// Se actualiza automáticamente en MySQL al modificar el registro
        /// </summary>
        [Column("UpdatedAt")] // Mapeo explícito a la columna "UpdatedAt"
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ===== PROPIEDADES DE NAVEGACIÓN =====
        // Estas propiedades NO se mapean a columnas en la base de datos
        // Se usan para relaciones entre entidades en Entity Framework
        
        /// <summary>
        /// Máquinas creadas por este usuario
        /// Relación: User (1) -> Maquinas (N)
        /// </summary>
        public virtual ICollection<Maquina> CreatedMaquinas { get; set; } = new List<Maquina>();
        
        /// <summary>
        /// Máquinas actualizadas por este usuario
        /// Relación: User (1) -> Maquinas (N)
        /// </summary>
        public virtual ICollection<Maquina> UpdatedMaquinas { get; set; } = new List<Maquina>();
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad que representa un permiso del sistema
    /// Tabla: permissions
    /// </summary>
    [Table("permissions")]
    public class Permission
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Código único del permiso (ej: 'users.view', 'modules.machines')
        /// </summary>
        [Required]
        [MaxLength(100)]
        [Column("code")]
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Nombre descriptivo del permiso
        /// </summary>
        [Required]
        [MaxLength(200)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Categoría del permiso (users, system, modules, actions)
        /// </summary>
        [Required]
        [MaxLength(50)]
        [Column("category")]
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Descripción detallada del permiso
        /// </summary>
        [MaxLength(500)]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Si el permiso está activo en el sistema
        /// </summary>
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Fecha de creación del permiso
        /// </summary>
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// Fecha de última actualización
        /// </summary>
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}

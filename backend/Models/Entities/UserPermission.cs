using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    /// <summary>
    /// Entidad que representa los permisos asignados a un usuario
    /// Tabla: user_permissions
    /// </summary>
    [Table("user_permissions")]
    public class UserPermission
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID del usuario (FK a users)
        /// </summary>
        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        /// <summary>
        /// Código del permiso
        /// </summary>
        [Required]
        [MaxLength(100)]
        [Column("permission_code")]
        public string PermissionCode { get; set; } = string.Empty;

        /// <summary>
        /// Si el permiso está concedido al usuario
        /// </summary>
        [Column("is_granted")]
        public bool IsGranted { get; set; } = false;

        /// <summary>
        /// Fecha en que se concedió el permiso
        /// </summary>
        [Column("granted_at")]
        public DateTime GrantedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// ID del usuario que concedió el permiso (FK a users)
        /// </summary>
        [Column("granted_by")]
        public int? GrantedBy { get; set; }

        /// <summary>
        /// Fecha de creación del registro
        /// </summary>
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// Fecha de última actualización
        /// </summary>
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("GrantedBy")]
        public virtual User? GrantedByUser { get; set; }
    }
}

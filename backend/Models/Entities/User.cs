using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlexoAPP.API.Models.Enums;

namespace FlexoAPP.API.Models.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("UserCode")]
        [StringLength(50)]
        public string UserCode { get; set; } = string.Empty;

        [Required]
        [Column("Password")]
        [StringLength(255)]
        public string Password { get; set; } = string.Empty;

        [Column("FirstName")]
        [StringLength(50)]
        public string? FirstName { get; set; }

        [Column("LastName")]
        [StringLength(50)]
        public string? LastName { get; set; }

        [Column("Role")]
        public UserRole Role { get; set; } = UserRole.Operario;

        [Column("Permissions")]
        public string? Permissions { get; set; }

        [Column("ProfileImage")]
        public string? ProfileImage { get; set; }

        [Column("ProfileImageUrl")]
        public string? ProfileImageUrl { get; set; }

        [Column("Email")]
        [StringLength(100)]
        public string? Email { get; set; }

        [Column("Phone")]
        [StringLength(20)]
        public string? Phone { get; set; }

        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<MachineProgram> CreatedPrograms { get; set; } = new List<MachineProgram>();
        public virtual ICollection<MachineProgram> UpdatedPrograms { get; set; } = new List<MachineProgram>();
    }
}
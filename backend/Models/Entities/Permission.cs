using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{




    [Table("permissions")]
    public class Permission
    {
        [Key]
        public int Id { get; set; }




        [Required]
        [MaxLength(100)]
        [Column("code")]
        public string Code { get; set; } = string.Empty;




        [Required]
        [MaxLength(200)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;




        [Required]
        [MaxLength(50)]
        [Column("category")]
        public string Category { get; set; } = string.Empty;




        [MaxLength(500)]
        [Column("description")]
        public string Description { get; set; } = string.Empty;




        [Column("is_active")]
        public bool IsActive { get; set; } = true;




        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;




        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}

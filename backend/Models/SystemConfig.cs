using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace flexoAPP.Models
{




    [Table("system_configs")]
    public class SystemConfig
    {
        [Key]
        [Column("id")]
        [MaxLength(100)]
        public string Id { get; set; } = string.Empty;

        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        [Column("value")]
        [MaxLength(1000)]
        public string Value { get; set; } = string.Empty;

        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = "string";

        [Column("category")]
        [MaxLength(100)]
        public string Category { get; set; } = "General";

        [Column("options")]
        [MaxLength(1000)]
        public string? Options { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

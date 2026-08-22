using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    [Table("pantone_colors")]
    public class PantoneColor
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("code")]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("display_name")]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [Required]
        [Column("hex")]
        [MaxLength(10)]
        public string Hex { get; set; } = "#000000";

        [Column("rgb_r")]
        public int RgbR { get; set; }

        [Column("rgb_g")]
        public int RgbG { get; set; }

        [Column("rgb_b")]
        public int RgbB { get; set; }

        [Column("cmyk_c")]
        public int CmykC { get; set; }

        [Column("cmyk_m")]
        public int CmykM { get; set; }

        [Column("cmyk_y")]
        public int CmykY { get; set; }

        [Column("cmyk_k")]
        public int CmykK { get; set; }

        [Column("lab_l")]
        public double? LabL { get; set; }

        [Column("lab_a")]
        public double? LabA { get; set; }

        [Column("lab_b")]
        public double? LabB { get; set; }

        [Required]
        [Column("category")]
        [MaxLength(50)]
        public string Category { get; set; } = "Manual";

        [Required]
        [Column("color_type")]
        [MaxLength(20)]
        public string ColorType { get; set; } = "pantone";

        [Column("is_custom")]
        public bool IsCustom { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

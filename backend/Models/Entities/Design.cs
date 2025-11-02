using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{
    [Table("designs")]
    public class Design
    {
        [Key]
        public int Id { get; set; }
        
        public string? ArticleF { get; set; }
        
        public string? Client { get; set; }
        
        public string? Description { get; set; }
        
        public string? Substrate { get; set; }
        
        public string? Type { get; set; }
        
        public string? PrintType { get; set; }
        
        public int? ColorCount { get; set; }
        
        [Column("color 1")]
        public string? Color1 { get; set; }
        
        [Column("color 2")]
        public string? Color2 { get; set; }
        
        [Column("color 3")]
        public string? Color3 { get; set; }
        
        [Column("color 4")]
        public string? Color4 { get; set; }
        
        [Column("color 5")]
        public string? Color5 { get; set; }
        
        [Column("color 6")]
        public string? Color6 { get; set; }
        
        [Column("color 7")]
        public string? Color7 { get; set; }
        
        [Column("color 8")]
        public string? Color8 { get; set; }
        
        [Column("color 9")]
        public string? Color9 { get; set; }
        
        [Column("color 10")]
        public string? Color10 { get; set; }
        
        public string? Status { get; set; }
        
        public DateTime? CreatedDate { get; set; }
        
        public DateTime? LastModified { get; set; }
        
        // Navigation properties - not mapped to database
        [NotMapped]
        public int? CreatedByUserId { get; set; }
        
        [NotMapped]
        public virtual User? CreatedBy { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAPP.API.Models.Entities
{




    [Table("user_permissions")]
    public class UserPermission
    {
        [Key]
        public int Id { get; set; }




        [Required]
        [Column("user_id")]
        public int UserId { get; set; }




        [Required]
        [MaxLength(100)]
        [Column("permission_code")]
        public string PermissionCode { get; set; } = string.Empty;




        [Column("is_granted")]
        public bool IsGranted { get; set; } = false;




        [Column("granted_at")]
        public DateTime GrantedAt { get; set; } = DateTime.Now;




        [Column("granted_by")]
        public int? GrantedBy { get; set; }




        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;




        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;


        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("GrantedBy")]
        public virtual User? GrantedByUser { get; set; }
    }
}

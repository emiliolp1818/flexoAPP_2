using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    public class UserActivityFilterDto
    {
        [Required]
        public string UserCode { get; set; } = string.Empty;
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public string? Module { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    public class MachineActivityFilterDto
    {
        [Required]
        public string UserCode { get; set; } = string.Empty;
        
        [Required]
        public DateTime ReportDate { get; set; }
    }
}
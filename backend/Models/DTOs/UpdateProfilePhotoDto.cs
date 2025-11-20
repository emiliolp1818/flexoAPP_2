using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    public class UpdateProfilePhotoDto
    {
        // Permitir null para eliminar la foto de perfil
        public string? ProfileImage { get; set; }
    }
}
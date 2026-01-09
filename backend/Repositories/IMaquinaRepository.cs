using FlexoAPP.API.Models.Entities;

namespace flexoAPP.Repositories
{
    public interface IMaquinaRepository
    {
        Task<IEnumerable<Maquina>> GetAllAsync();
        Task<Maquina?> GetByArticuloAsync(string articulo);
        Task<Maquina?> GetByOtSapAsync(string otSap);
        Task<IEnumerable<Maquina>> GetByNumeroMaquinaAsync(int numeroMaquina);
        Task<IEnumerable<Maquina>> GetByEstadoAsync(string estado);
        Task<Maquina> CreateAsync(Maquina maquina);
        Task<Maquina> UpdateAsync(Maquina maquina);
        Task<bool> DeleteAsync(string otSap);
        Task<bool> ExistsByArticuloAsync(string articulo);
    }
}

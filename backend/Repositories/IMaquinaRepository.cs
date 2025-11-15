using FlexoAPP.API.Models.Entities;

namespace flexoAPP.Repositories
{
    public interface IMaquinaRepository
    {
        Task<IEnumerable<Maquina>> GetAllAsync();
        Task<Maquina?> GetByArticuloAsync(string articulo);
        Task<IEnumerable<Maquina>> GetByNumeroMaquinaAsync(int numeroMaquina);
        Task<IEnumerable<Maquina>> GetByEstadoAsync(string estado);
        Task<Maquina> CreateAsync(Maquina maquina);
        Task<Maquina> UpdateAsync(Maquina maquina);
        Task<bool> DeleteAsync(string articulo);
        Task<bool> ExistsByArticuloAsync(string articulo);
    }
}

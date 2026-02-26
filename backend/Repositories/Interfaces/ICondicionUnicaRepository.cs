



using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Repositories
{




    public interface ICondicionUnicaRepository
    {




        Task<IEnumerable<CondicionUnica>> GetAllAsync();






        Task<CondicionUnica?> GetByIdAsync(int id);






        Task<IEnumerable<CondicionUnica>> SearchByFArticuloAsync(string fArticulo);






        Task<CondicionUnica> CreateAsync(CondicionUnica condicion);






        Task<CondicionUnica> UpdateAsync(CondicionUnica condicion);






        Task<bool> DeleteAsync(int id);







        Task<bool> ExistsByFArticuloAsync(string fArticulo, int? excludeId = null);
    }
}

using HorizonTravel.Model;

namespace HorizonTravel.Repositories
{
    public interface ITripRepository
    {
        Task<IEnumerable<Trip>> GetAllAsync();
        Task<Trip?> GetByIdAsync(int id);
        Task AddAsync(Trip trip);
        Task UpdateAsync(Trip trip);
        Task DeleteAsync(Trip trip);
        Task SaveChangesAsync();
    }
}
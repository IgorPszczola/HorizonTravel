using HorizonTravel.Model;

namespace HorizonTravel.Repositories
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Review>> GetByTripIdAsync(int tripId);
        Task AddAsync(Review review);
        Task SaveChangesAsync();
    }
}
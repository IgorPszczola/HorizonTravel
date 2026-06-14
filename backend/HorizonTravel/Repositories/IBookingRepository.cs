using HorizonTravel.Model;

namespace HorizonTravel.Repositories
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(int id);
        Task<IEnumerable<Booking>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Booking>> GetActiveBookingsByTripIdAsync(int tripId);
        Task AddAsync(Booking booking);
        Task UpdateAsync(Booking booking);
        Task SaveChangesAsync();
    }
}
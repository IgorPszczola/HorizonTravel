using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;
using HorizonTravel.Model;

namespace HorizonTravel.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly HorizonTravelDbContext _context;

        public BookingRepository(HorizonTravelDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Wycieczka)
                .Include(b => b.Uzytkownik)
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetByUserIdAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.Wycieczka)
                .Where(b => b.UzytkownikId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetActiveBookingsByTripIdAsync(int tripId)
        {
            return await _context.Bookings
                .Where(b => b.WycieczkaId == tripId && b.Status != "Anulowana")
                .ToListAsync();
        }

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
        }

        public async Task UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

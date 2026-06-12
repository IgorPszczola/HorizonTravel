using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;
using HorizonTravel.Model;

namespace HorizonTravel.Repositories
{
    public class TripRepository : ITripRepository
    {
        private readonly HorizonTravelDbContext _context;

        public TripRepository(HorizonTravelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Trip>> GetAllAsync()
        {
            return await _context.Trips.ToListAsync();
        }

        public async Task<Trip?> GetByIdAsync(int id)
        {
            return await _context.Trips.FindAsync(id);
        }

        public async Task AddAsync(Trip trip)
        {
            await _context.Trips.AddAsync(trip);
        }

        public async Task UpdateAsync(Trip trip)
        {
            _context.Trips.Update(trip);
        }

        public async Task DeleteAsync(Trip trip)
        {
            _context.Trips.Remove(trip);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

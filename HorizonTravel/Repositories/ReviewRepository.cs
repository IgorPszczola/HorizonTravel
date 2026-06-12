using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;
using HorizonTravel.Model;

namespace HorizonTravel.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly HorizonTravelDbContext _context;

        public ReviewRepository(HorizonTravelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Review>> GetByTripIdAsync(int tripId)
        {
            return await _context.Reviews
                .Include(r => r.Uzytkownik)
                .Where(r => r.WycieczkaId == tripId)
                .OrderByDescending(r => r.DataDodania)
                .ToListAsync();
        }

        public async Task AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

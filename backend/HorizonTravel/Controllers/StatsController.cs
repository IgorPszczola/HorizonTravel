using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;

using Microsoft.AspNetCore.Authorization;

namespace HorizonTravel.Controllers
{
    // [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/stats")]
    public class StatsController : ControllerBase
    {
        private readonly HorizonTravelDbContext _context;

        public StatsController(HorizonTravelDbContext context)
        {
            _context = context;
        }

        [HttpGet("popular-trips")]
        public async Task<IActionResult> GetPopularityStats()
        {
            // Odpytanie widoku v_TripPopularityAndRevenue
            var stats = await _context.Database
                .SqlQuery<TripPopularityStat>($"SELECT * FROM v_TripPopularityAndRevenue")
                .ToListAsync();

            var result = stats.Select(s => new
            {
                tripId = s.TripId,
                title = s.Tytul,
                bookingsCount = s.LiczbaRezerwacji,
                totalParticipants = s.SumaUczestnikow
            });

            return Ok(result);
        }

        // GET: api/stats/monthly-revenue?rok=2026
        [HttpGet("monthly-revenue")]
        public async Task<IActionResult> GetMonthlySalesStats([FromQuery] int rok)
        {
            if (rok <= 0)
            {
                rok = DateTime.Now.Year;
            }

            // Wywołanie procedury składowanej sp_GetMonthlySalesReport
            var report = await _context.Database
                .SqlQuery<MonthlySalesReport>($"EXEC sp_GetMonthlySalesReport @Rok = {rok}")
                .ToListAsync();

            var result = report.Select(r => new
            {
                month = r.Miesiac,
                revenue = r.Przychod
            });

            return Ok(result);
        }
    }

    public class TripPopularityStat
    {
        public int TripId { get; set; }
        public string Tytul { get; set; } = string.Empty;
        public int LiczbaRezerwacji { get; set; }
        public int SumaUczestnikow { get; set; }
        public decimal CalkowityPrzychod { get; set; }
    }

    public class MonthlySalesReport
    {
        public int Miesiac { get; set; }
        public decimal Przychod { get; set; }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;

using Microsoft.AspNetCore.Authorization;

namespace HorizonTravel.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/stats")]
    public class StatsController : ControllerBase
    {
        private readonly HorizonTravelDbContext _context;

        public StatsController(HorizonTravelDbContext context)
        {
            _context = context;
        }

        [HttpGet("popularity")]
        public async Task<IActionResult> GetPopularityStats()
        {
            // Odpytanie widoku v_TripPopularityAndRevenue
            var stats = await _context.Database
                .SqlQuery<TripPopularityStat>($"SELECT * FROM v_TripPopularityAndRevenue")
                .ToListAsync();

            return Ok(stats);
        }

        // GET: api/stats/monthly-sales?rok=2026
        [HttpGet("monthly-sales")]
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

            return Ok(report);
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

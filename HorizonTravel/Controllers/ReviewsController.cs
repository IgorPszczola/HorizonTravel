using Microsoft.AspNetCore.Mvc;
using HorizonTravel.Dto;
using HorizonTravel.Model;
using HorizonTravel.Repositories;

namespace HorizonTravel.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewsController(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetByTrip(int tripId)
        {
            var reviews = await _reviewRepository.GetByTripIdAsync(tripId);

            var result = reviews.Select(r => new
            {
                r.Id,
                r.WycieczkaId,
                r.UzytkownikId,
                r.Ocena,
                r.Komentarz,
                r.DataDodania,
                uzytkownik = r.Uzytkownik != null ? new
                {
                    r.Uzytkownik.Id,
                    r.Uzytkownik.Imie,
                    r.Uzytkownik.Nazwisko
                } : null
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReviewDto dto)
        {
            if (dto.Ocena < 1 || dto.Ocena > 5)
            {
                return BadRequest(new { message = "Ocena musi być w przedziale od 1 do 5." });
            }

            var review = new Review
            {
                WycieczkaId = dto.WycieczkaId,
                UzytkownikId = dto.UzytkownikId,
                Ocena = dto.Ocena,
                Komentarz = dto.Komentarz,
                DataDodania = DateTime.Now
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();

            return Created(string.Empty, new
            {
                review.Id,
                review.WycieczkaId,
                review.UzytkownikId,
                review.Ocena,
                review.Komentarz,
                review.DataDodania
            });
        }
    }
}

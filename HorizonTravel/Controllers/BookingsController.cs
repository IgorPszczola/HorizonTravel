using Microsoft.AspNetCore.Mvc;
using HorizonTravel.Dto;
using HorizonTravel.Repositories;
using HorizonTravel.Services;

namespace HorizonTravel.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IBookingRepository _bookingRepository;

        public BookingsController(IBookingService bookingService, IBookingRepository bookingRepository)
        {
            _bookingService = bookingService;
            _bookingRepository = bookingRepository;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookingDto dto)
        {
            var booking = await _bookingService.CreateBookingAsync(
                dto.WycieczkaId,
                dto.UzytkownikId,
                dto.LiczbaUczestnikow);

            return Created(string.Empty, new
            {
                id = booking.Id,
                wycieczkaId = booking.WycieczkaId,
                uzytkownikId = booking.UzytkownikId,
                liczbaUczestnikow = booking.LiczbaUczestnikow,
                sumarycznaCena = booking.SumarycznaCena,
                dataRezerwacji = booking.DataRezerwacji,
                status = booking.Status
            });
        }

        [HttpGet("my/{userId}")]
        public async Task<IActionResult> GetMyBookings(int userId)
        {
            var bookings = await _bookingRepository.GetByUserIdAsync(userId);
            
            var result = bookings.Select(b => new
            {
                b.Id,
                b.DataRezerwacji,
                b.LiczbaUczestnikow,
                b.SumarycznaCena,
                b.Status,
                wycieczka = b.Wycieczka != null ? new
                {
                    b.Wycieczka.Id,
                    b.Wycieczka.Tytul,
                    b.Wycieczka.Kraj,
                    b.Wycieczka.Miasto,
                    b.Wycieczka.DataRozpoczecia,
                    b.Wycieczka.DataZakonczenia
                } : null
            });

            return Ok(result);
        }
    }
}

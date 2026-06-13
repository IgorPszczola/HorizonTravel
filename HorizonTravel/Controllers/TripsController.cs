using Microsoft.AspNetCore.Mvc;
using HorizonTravel.Dto;
using HorizonTravel.Model;
using HorizonTravel.Repositories;

namespace HorizonTravel.Controllers
{
    [ApiController]
    [Route("api/trips")]
    public class TripsController : ControllerBase
    {
        private readonly ITripRepository _tripRepository;

        public TripsController(ITripRepository tripRepository)
        {
            _tripRepository = tripRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? kraj)
        {
            var trips = await _tripRepository.GetAllAsync();

            if (!string.IsNullOrWhiteSpace(kraj))
            {
                trips = trips.Where(t => t.Kraj.Contains(kraj, StringComparison.OrdinalIgnoreCase));
            }

            var result = trips.Select(t => new
            {
                t.Id,
                t.Tytul,
                t.Kraj,
                t.Miasto,
                t.Opis,
                t.MaksymalnaLiczbaMiejsc,
                t.AktualnaCena,
                t.DataRozpoczecia,
                t.DataZakonczenia,
                zdjecieGlowne = t.ZdjecieGlowne != null ? Convert.ToBase64String(t.ZdjecieGlowne) : null
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var trip = await _tripRepository.GetByIdAsync(id);
            if (trip == null)
            {
                return NotFound(new { message = "Wycieczka nie została znaleziona." });
            }

            return Ok(new
            {
                trip.Id,
                trip.Tytul,
                trip.Kraj,
                trip.Miasto,
                trip.Opis,
                trip.MaksymalnaLiczbaMiejsc,
                trip.AktualnaCena,
                trip.DataRozpoczecia,
                trip.DataZakonczenia,
                zdjecieGlowne = trip.ZdjecieGlowne != null ? Convert.ToBase64String(trip.ZdjecieGlowne) : null
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] TripCreateDto dto)
        {
            byte[]? imageBytes = null;
            if (dto.ZdjecieGlowne != null && dto.ZdjecieGlowne.Length > 0)
            {
                using var ms = new MemoryStream();
                await dto.ZdjecieGlowne.CopyToAsync(ms);
                imageBytes = ms.ToArray();
            }

            var newTrip = new Trip
            {
                Tytul = dto.Tytul,
                Kraj = dto.Kraj,
                Miasto = dto.Miasto,
                Opis = dto.Opis,
                MaksymalnaLiczbaMiejsc = dto.MaksymalnaLiczbaMiejsc,
                AktualnaCena = dto.AktualnaCena,
                DataRozpoczecia = dto.DataRozpoczecia,
                DataZakonczenia = dto.DataZakonczenia,
                ZdjecieGlowne = imageBytes
            };

            await _tripRepository.AddAsync(newTrip);
            await _tripRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = newTrip.Id }, new
            {
                newTrip.Id,
                newTrip.Tytul,
                newTrip.Kraj,
                newTrip.Miasto
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] TripUpdateDto dto)
        {
            var trip = await _tripRepository.GetByIdAsync(id);
            if (trip == null)
            {
                return NotFound(new { message = "Wycieczka nie istnieje." });
            }

            trip.Tytul = dto.Tytul;
            trip.Kraj = dto.Kraj;
            trip.Miasto = dto.Miasto;
            trip.Opis = dto.Opis;
            trip.MaksymalnaLiczbaMiejsc = dto.MaksymalnaLiczbaMiejsc;
            trip.AktualnaCena = dto.AktualnaCena;
            trip.DataRozpoczecia = dto.DataRozpoczecia;
            trip.DataZakonczenia = dto.DataZakonczenia;

            if (dto.ZdjecieGlowne != null && dto.ZdjecieGlowne.Length > 0)
            {
                using var ms = new MemoryStream();
                await dto.ZdjecieGlowne.CopyToAsync(ms);
                trip.ZdjecieGlowne = ms.ToArray();
            }

            await _tripRepository.UpdateAsync(trip);
            await _tripRepository.SaveChangesAsync();

            return Ok(new { message = "Wycieczka została zaktualizowana." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var trip = await _tripRepository.GetByIdAsync(id);
            if (trip == null)
            {
                return NotFound(new { message = "Wycieczka nie istnieje." });
            }

            await _tripRepository.DeleteAsync(trip);
            await _tripRepository.SaveChangesAsync();

            return Ok(new { message = "Wycieczka została usunięta." });
        }
    }
}

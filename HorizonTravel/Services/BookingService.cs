using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;
using HorizonTravel.Model;
using HorizonTravel.Repositories;

namespace HorizonTravel.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ITripRepository _tripRepository;
        private readonly HorizonTravelDbContext _context;

        public BookingService(
            IBookingRepository bookingRepository,
            ITripRepository tripRepository,
            HorizonTravelDbContext context)
        {
            _bookingRepository = bookingRepository;
            _tripRepository = tripRepository;
            _context = context;
        }

        public async Task<Booking> CreateBookingAsync(int wycieczkaId, int uzytkownikId, int liczbaUczestnikow)
        {

            var wycieczka = await _tripRepository.GetByIdAsync(wycieczkaId);
            if (wycieczka == null)
            {
                throw new KeyNotFoundException("Wycieczka o podanym identyfikatorze nie istnieje.");
            }

            var aktywneRezerwacje = await _bookingRepository.GetActiveBookingsByTripIdAsync(wycieczkaId);
            int zajeteMiejsca = aktywneRezerwacje.Sum(b => b.LiczbaUczestnikow);
            int wolneMiejsca = wycieczka.MaksymalnaLiczbaMiejsc - zajeteMiejsca;

            if (liczbaUczestnikow > wolneMiejsca)
            {
                throw new InvalidOperationException($"Brak wystarczającej liczby wolnych miejsc. Dostępne miejsca: {wolneMiejsca}. Próba rezerwacji dla: {liczbaUczestnikow}.");
            }

            var rabat = await _context.Database
                .SqlQuery<decimal>($"SELECT dbo.fn_CalculateLoyaltyDiscount({uzytkownikId}) AS Value")
                .FirstOrDefaultAsync();

            decimal cenaBazowa = wycieczka.AktualnaCena * liczbaUczestnikow;
            decimal ostatecznaCena = cenaBazowa * (1 - rabat);

            var nowaRezerwacja = new Booking
            {
                WycieczkaId = wycieczkaId,
                UzytkownikId = uzytkownikId,
                LiczbaUczestnikow = liczbaUczestnikow,
                SumarycznaCena = ostatecznaCena,
                DataRezerwacji = DateTime.Now,
                Status = "Oczekująca"
            };

            await _bookingRepository.AddAsync(nowaRezerwacja);
            await _bookingRepository.SaveChangesAsync();

            return nowaRezerwacja;
        }
    }
}

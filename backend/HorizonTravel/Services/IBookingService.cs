using HorizonTravel.Model;

namespace HorizonTravel.Services
{
    public interface IBookingService
    {
        Task<Booking> CreateBookingAsync(int wycieczkaId, int uzytkownikId, int liczbaUczestnikow);
    }
}
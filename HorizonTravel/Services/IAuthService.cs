using HorizonTravel.Model;

namespace HorizonTravel.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(string email, string password, string imie, string nazwisko);
        Task<User?> LoginAsync(string email, string password);
    }
}

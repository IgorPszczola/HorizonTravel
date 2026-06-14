using HorizonTravel.Model;
using HorizonTravel.Dto;

namespace HorizonTravel.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(string email, string password, string imie, string nazwisko);
        Task<LoginResponseDto?> LoginAsync(string email, string password);
    }
}
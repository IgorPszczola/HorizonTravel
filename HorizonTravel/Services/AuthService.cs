using HorizonTravel.Model;
using HorizonTravel.Repositories;

namespace HorizonTravel.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;

        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User?> RegisterAsync(string email, string password, string imie, string nazwisko)
        {
            var existingUser = await _userRepository.GetByEmailAsync(email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Użytkownik o podanym adresie email już istnieje.");
            }

            string hasloHash = BCrypt.Net.BCrypt.HashPassword(password);

            var newUser = new User
            {
                Email = email,
                HasloHash = hasloHash,
                Imie = imie,
                Nazwisko = nazwisko,
                RolaId = 2
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveChangesAsync();

            return newUser;
        }

        public async Task<User?> LoginAsync(string email, string password)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return null;
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.HasloHash);
            if (!isPasswordValid)
            {
                return null;
            }

            return user;
        }
    }
}

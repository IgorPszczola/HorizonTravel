using Microsoft.AspNetCore.Mvc;
using HorizonTravel.Dto;
using HorizonTravel.Services;

namespace HorizonTravel.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (string.IsNullOrWhiteSpace(registerDto.Email) || string.IsNullOrWhiteSpace(registerDto.Password))
            {
                return BadRequest(new { message = "Email i hasło są wymagane." });
            }

            var user = await _authService.RegisterAsync(
                registerDto.Email,
                registerDto.Password,
                registerDto.Imie,
                registerDto.Nazwisko);

            return Created(string.Empty, new
            {
                id = user!.Id,
                email = user.Email,
                imie = user.Imie,
                nazwisko = user.Nazwisko
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest(new { message = "Email i hasło są wymagane." });
            }

            var user = await _authService.LoginAsync(loginDto.Email, loginDto.Password);
            if (user == null)
            {
                return Unauthorized(new { message = "Niepoprawny e-mail lub hasło." });
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                imie = user.Imie,
                nazwisko = user.Nazwisko,
                rola = user.Rola?.NazwaRoli ?? "Klient"
            });
        }
    }
}

namespace HorizonTravel.Dto
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Imie { get; set; } = string.Empty;
        public string Nazwisko { get; set; } = string.Empty;
        public string Rola { get; set; } = string.Empty;
    }
}
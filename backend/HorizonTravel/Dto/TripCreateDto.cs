using Microsoft.AspNetCore.Http;

namespace HorizonTravel.Dto
{
    public class TripCreateDto
    {
        public string Tytul { get; set; } = string.Empty;
        public string Kraj { get; set; } = string.Empty;
        public string Miasto { get; set; } = string.Empty;
        public string Opis { get; set; } = string.Empty;
        public int MaksymalnaLiczbaMiejsc { get; set; }
        public decimal AktualnaCena { get; set; }
        public DateTime DataRozpoczecia { get; set; }
        public DateTime DataZakonczenia { get; set; }
        public IFormFile? ZdjecieGlowne { get; set; }
    }
}
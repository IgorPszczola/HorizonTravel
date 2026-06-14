using Microsoft.AspNetCore.Http;

namespace HorizonTravel.Dto
{
    public class TripUpdateDto
    {
        public string Tytul { get; set; } = string.Empty;
        public string Kraj { get; set; } = string.Empty;
        public string Miasto { get; set; } = string.Empty;
        public string Opis { get; set; } = string.Empty;
        public int MaksymalnaLiczbaMiejsc { get; set; }
        public decimal AktualnaCena { get; set; }
        public DateTime DataRozpoczecia { get; set; }
        public DateTime DataZakonczenia { get; set; }
        
        // ZdjecieGlowne jest opcjonalne - jeśli admin nie prześle nowego pliku, zachowamy poprzednie zdjęcie
        public IFormFile? ZdjecieGlowne { get; set; }
    }
}

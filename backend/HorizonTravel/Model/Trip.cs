namespace HorizonTravel.Model
{
    public class Trip
    {
        public int Id { get; set; }
        public string Tytul { get; set; } = string.Empty;
        public string Kraj { get; set; } = string.Empty;
        public string Miasto { get; set; } = string.Empty;
        public string Opis { get; set; } = string.Empty;
        public int MaksymalnaLiczbaMiejsc { get; set; }
        public decimal AktualnaCena { get; set; }
        public byte[]? ZdjecieGlowne { get; set; }
        public DateTime DataRozpoczecia { get; set; }
        public DateTime DataZakonczenia { get; set; }

        // Właściwości nawigacyjne
        public virtual ICollection<PriceHistory> PriceHistories { get; set; } = new List<PriceHistory>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
namespace HorizonTravel.Model
{
    public class Payment
    {
        public int Id { get; set; }

        public int RezerwacjaId { get; set; }
        public virtual Booking? Rezerwacja { get; set; }

        public decimal Kwota { get; set; }
        public DateTime DataPlatnosci { get; set; }
        public string MetodaPlatnosci { get; set; } = string.Empty;
    }
}

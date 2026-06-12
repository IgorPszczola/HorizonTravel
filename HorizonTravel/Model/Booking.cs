namespace HorizonTravel.Model
{
    public class Booking
    {
        public int Id { get; set; }

        public int WycieczkaId { get; set; }
        public virtual Trip? Wycieczka { get; set; }

        public int UzytkownikId { get; set; }
        public virtual User? Uzytkownik { get; set; }

        public DateTime DataRezerwacji { get; set; }
        public int LiczbaUczestnikow { get; set; }
        public decimal SumarycznaCena { get; set; }
        public string Status { get; set; } = string.Empty;

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}

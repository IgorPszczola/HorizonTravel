namespace HorizonTravel.Model
{
    public class PriceHistory
    {
        public int Id { get; set; }
        
        public int WycieczkaId { get; set; }
        public virtual Trip? Wycieczka { get; set; }

        public decimal Cena { get; set; }
        public DateTime DataOd { get; set; }
        public DateTime? DataDo { get; set; }
    }
}

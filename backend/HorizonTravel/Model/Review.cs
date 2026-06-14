namespace HorizonTravel.Model
{
    public class Review
    {
        public int Id { get; set; }

        public int WycieczkaId { get; set; }
        public virtual Trip? Wycieczka { get; set; }

        public int UzytkownikId { get; set; }
        public virtual User? Uzytkownik { get; set; }

        public int Ocena { get; set; } // np. od 1 do 5
        public string Komentarz { get; set; } = string.Empty;
        public DateTime DataDodania { get; set; }
    }
}
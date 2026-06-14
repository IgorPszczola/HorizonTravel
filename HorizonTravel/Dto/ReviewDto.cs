namespace HorizonTravel.Dto
{
    public class ReviewDto
    {
        public int WycieczkaId { get; set; }
        public int UzytkownikId { get; set; }
        public int Ocena { get; set; } // np. od 1 do 5
        public string Komentarz { get; set; } = string.Empty;
    }
}

using HorizonTravel.Model;

namespace HorizonTravel.Data
{
    public static class DataSeeder
    {
        public static void Seed(HorizonTravelDbContext context)
        {
            // 1. Zasilenie Ról (Admin, Klient)
            if (!context.Roles.Any(r => r.NazwaRoli == "Admin"))
            {
                context.Roles.Add(new Role { NazwaRoli = "Admin" });
            }
            if (!context.Roles.Any(r => r.NazwaRoli == "Klient"))
            {
                context.Roles.Add(new Role { NazwaRoli = "Klient" });
            }
            context.SaveChanges();

            var rolaAdmin = context.Roles.First(r => r.NazwaRoli == "Admin");
            var rolaKlient = context.Roles.First(r => r.NazwaRoli == "Klient");

            // 2. Zasilenie Użytkowników
            if (!context.Users.Any(u => u.Email == "admin@travel.com"))
            {
                string adminHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                context.Users.Add(new User
                {
                    Email = "admin@travel.com",
                    HasloHash = adminHash,
                    Imie = "Tomasz",
                    Nazwisko = "Admin",
                    RolaId = rolaAdmin.Id
                });
            }

            if (!context.Users.Any(u => u.Email == "client@travel.com"))
            {
                string clientHash = BCrypt.Net.BCrypt.HashPassword("client123");
                context.Users.Add(new User
                {
                    Email = "client@travel.com",
                    HasloHash = clientHash,
                    Imie = "Jan",
                    Nazwisko = "Kowalski",
                    RolaId = rolaKlient.Id
                });
            }
            context.SaveChanges();

            // 3. Zasilenie Wycieczek
            if (!context.Trips.Any(t => t.Tytul == "Słoneczna Grecja"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Słoneczna Grecja",
                    Kraj = "Grecja",
                    Miasto = "Ateny",
                    Opis = "Wspaniała wycieczka objazdowa po antycznej Grecji. Zwiedzanie Akropolu i odpoczynek na plaży.",
                    MaksymalnaLiczbaMiejsc = 20,
                    AktualnaCena = 2500.00m,
                    DataRozpoczecia = new DateTime(2026, 07, 01),
                    DataZakonczenia = new DateTime(2026, 07, 10),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Rzymskie Wakacje"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Rzymskie Wakacje",
                    Kraj = "Włochy",
                    Miasto = "Rzym",
                    Opis = "Weekend w Wiecznym Mieście. Koloseum, Watykan, pyszna pizza i włoskie espresso.",
                    MaksymalnaLiczbaMiejsc = 15,
                    AktualnaCena = 1800.00m,
                    DataRozpoczecia = new DateTime(2026, 08, 10),
                    DataZakonczenia = new DateTime(2026, 08, 17),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Egzotyczny Bali"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Egzotyczny Bali",
                    Kraj = "Indonezja",
                    Miasto = "Ubud",
                    Opis = "Poczuj magię wyspy Bali. Tropikalne lasy, tarasy ryżowe i relaks w luksusowym resorcie.",
                    MaksymalnaLiczbaMiejsc = 10,
                    AktualnaCena = 6000.00m,
                    DataRozpoczecia = new DateTime(2026, 09, 05),
                    DataZakonczenia = new DateTime(2026, 09, 19),
                    ZdjecieGlowne = null
                });
            }
            context.SaveChanges();

            // Pobieramy wygenerowane obiekty
            var client = context.Users.First(u => u.Email == "client@travel.com");
            var grecja = context.Trips.First(t => t.Tytul == "Słoneczna Grecja");
            var rzym = context.Trips.First(t => t.Tytul == "Rzymskie Wakacje");
            var bali = context.Trips.First(t => t.Tytul == "Egzotyczny Bali");

            // 4. Zasilenie Rezerwacji i Płatności (tylko dla nowo dodanego client@travel.com)
            if (!context.Bookings.Any(b => b.UzytkownikId == client.Id))
            {
                // 1. Styczeń 2026
                var b1 = new Booking
                {
                    WycieczkaId = grecja.Id,
                    UzytkownikId = client.Id,
                    LiczbaUczestnikow = 2,
                    SumarycznaCena = 5000.00m,
                    DataRezerwacji = new DateTime(2026, 01, 15),
                    Status = "Opłacona"
                };
                context.Bookings.Add(b1);
                context.SaveChanges();
                context.Payments.Add(new Payment { RezerwacjaId = b1.Id, Kwota = 5000.00m, DataPlatnosci = new DateTime(2026, 01, 16), MetodaPlatnosci = "Karta" });

                // 2. Luty 2026
                var b2 = new Booking
                {
                    WycieczkaId = rzym.Id,
                    UzytkownikId = client.Id,
                    LiczbaUczestnikow = 1,
                    SumarycznaCena = 1800.00m,
                    DataRezerwacji = new DateTime(2026, 02, 10),
                    Status = "Opłacona"
                };
                context.Bookings.Add(b2);
                context.SaveChanges();
                context.Payments.Add(new Payment { RezerwacjaId = b2.Id, Kwota = 1800.00m, DataPlatnosci = new DateTime(2026, 02, 11), MetodaPlatnosci = "PayPal" });

                // 3. Marzec 2026
                var b3 = new Booking
                {
                    WycieczkaId = bali.Id,
                    UzytkownikId = client.Id,
                    LiczbaUczestnikow = 1,
                    SumarycznaCena = 6000.00m,
                    DataRezerwacji = new DateTime(2026, 03, 05),
                    Status = "Opłacona"
                };
                context.Bookings.Add(b3);
                context.SaveChanges();
                context.Payments.Add(new Payment { RezerwacjaId = b3.Id, Kwota = 6000.00m, DataPlatnosci = new DateTime(2026, 03, 06), MetodaPlatnosci = "Przelew" });

                // 4. Kwiecień 2026
                var b4 = new Booking
                {
                    WycieczkaId = grecja.Id,
                    UzytkownikId = client.Id,
                    LiczbaUczestnikow = 1,
                    SumarycznaCena = 2500.00m,
                    DataRezerwacji = new DateTime(2026, 04, 20),
                    Status = "Opłacona"
                };
                context.Bookings.Add(b4);
                context.SaveChanges();
                context.Payments.Add(new Payment { RezerwacjaId = b4.Id, Kwota = 2500.00m, DataPlatnosci = new DateTime(2026, 04, 21), MetodaPlatnosci = "Karta" });

                // 5. Maj 2026
                var b5 = new Booking
                {
                    WycieczkaId = rzym.Id,
                    UzytkownikId = client.Id,
                    LiczbaUczestnikow = 2,
                    SumarycznaCena = 3600.00m,
                    DataRezerwacji = new DateTime(2026, 05, 12),
                    Status = "Opłacona"
                };
                context.Bookings.Add(b5);
                context.SaveChanges();
                context.Payments.Add(new Payment { RezerwacjaId = b5.Id, Kwota = 3600.00m, DataPlatnosci = new DateTime(2026, 05, 13), MetodaPlatnosci = "Karta" });
            }

            // 5. Zasilenie Opinii
            if (!context.Reviews.Any(r => r.WycieczkaId == grecja.Id && r.UzytkownikId == client.Id))
            {
                context.Reviews.Add(new Review
                {
                    WycieczkaId = grecja.Id,
                    UzytkownikId = client.Id,
                    Ocena = 5,
                    Komentarz = "Cudowna wycieczka! Ateny są wspaniałe, a organizacja była na najwyższym poziomie.",
                    DataDodania = DateTime.Now.AddDays(-10)
                });
            }

            if (!context.Reviews.Any(r => r.WycieczkaId == rzym.Id && r.UzytkownikId == client.Id))
            {
                context.Reviews.Add(new Review
                {
                    WycieczkaId = rzym.Id,
                    UzytkownikId = client.Id,
                    Ocena = 4,
                    Komentarz = "Rzym urzeka klimatem, pyszne jedzenie! Jeden punkt mniej za duże tłumy pod fontanną di Trevi.",
                    DataDodania = DateTime.Now.AddDays(-2)
                });
            }

            context.SaveChanges();
        }
    }
}

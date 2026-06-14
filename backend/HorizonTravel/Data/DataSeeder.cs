using HorizonTravel.Model;
using Microsoft.EntityFrameworkCore;

namespace HorizonTravel.Data
{
    public static class DataSeeder
    {
        public static void Seed(HorizonTravelDbContext context)
        {
            // Zapewniamy stworzenie bazy i tabel
            context.Database.EnsureCreated();

            // Tworzenie Funkcji (UDF): fn_CalculateLoyaltyDiscount
            context.Database.ExecuteSqlRaw(@"
                IF OBJECT_ID('dbo.fn_CalculateLoyaltyDiscount', 'FN') IS NOT NULL
                    DROP FUNCTION dbo.fn_CalculateLoyaltyDiscount;
            ");
            context.Database.ExecuteSqlRaw(@"
                EXEC('
                    CREATE FUNCTION dbo.fn_CalculateLoyaltyDiscount (@UzytkownikId INT)
                    RETURNS DECIMAL(18,2)
                    AS
                    BEGIN
                        DECLARE @LiczbaRezerwacji INT;
                        DECLARE @Rabat DECIMAL(18,2) = 0.0;

                        SELECT @LiczbaRezerwacji = COUNT(*) 
                        FROM Bookings 
                        WHERE UzytkownikId = @UzytkownikId AND Status = N''Opłacona'';

                        IF @LiczbaRezerwacji >= 5
                            SET @Rabat = 0.10;
                        ELSE IF @LiczbaRezerwacji >= 2
                            SET @Rabat = 0.05;

                        RETURN @Rabat;
                    END
                ');
            ");

            // Tworzenie Widoku: v_TripPopularityAndRevenue
            context.Database.ExecuteSqlRaw(@"
                IF OBJECT_ID('dbo.v_TripPopularityAndRevenue', 'V') IS NOT NULL
                    DROP VIEW dbo.v_TripPopularityAndRevenue;
            ");
            context.Database.ExecuteSqlRaw(@"
                EXEC('
                    CREATE VIEW dbo.v_TripPopularityAndRevenue AS
                    SELECT 
                        t.Id AS TripId,
                        t.Tytul,
                        COUNT(b.Id) AS LiczbaRezerwacji,
                        ISNULL(SUM(b.LiczbaUczestnikow), 0) AS SumaUczestnikow,
                        ISNULL(SUM(p.Kwota), 0) AS CalkowityPrzychod
                    FROM Trips t
                    LEFT JOIN Bookings b ON t.Id = b.WycieczkaId AND b.Status = N''Opłacona''
                    LEFT JOIN Payments p ON b.Id = p.RezerwacjaId
                    GROUP BY t.Id, t.Tytul
                ');
            ");

            // Tworzenie Procedury Składowanej: sp_GetMonthlySalesReport
            context.Database.ExecuteSqlRaw(@"
                IF OBJECT_ID('dbo.sp_GetMonthlySalesReport', 'P') IS NOT NULL
                    DROP PROCEDURE dbo.sp_GetMonthlySalesReport;
            ");
            context.Database.ExecuteSqlRaw(@"
                EXEC('
                    CREATE PROCEDURE dbo.sp_GetMonthlySalesReport
                        @Rok INT
                    AS
                    BEGIN
                        SELECT 
                            m.Miesiac,
                            ISNULL(SUM(bp.Kwota), 0) AS Przychod
                        FROM (
                            SELECT 1 AS Miesiac UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
                            UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 
                            UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
                        ) m
                        LEFT JOIN (
                            SELECT b.Id, t.DataRozpoczecia, p.Kwota
                            FROM Bookings b
                            JOIN Trips t ON b.WycieczkaId = t.Id
                            JOIN Payments p ON b.Id = p.RezerwacjaId
                            WHERE b.Status = N''Opłacona''
                        ) bp ON MONTH(bp.DataRozpoczecia) = m.Miesiac AND YEAR(bp.DataRozpoczecia) = @Rok
                        GROUP BY m.Miesiac
                        ORDER BY m.Miesiac;
                    END
                ');
            ");

            // Tworzenie Wyzwalacza (Trigger): tr_ArchivePriceOnUpdate
            context.Database.ExecuteSqlRaw(@"
                IF OBJECT_ID('dbo.tr_ArchivePriceOnUpdate', 'TR') IS NOT NULL
                    DROP TRIGGER dbo.tr_ArchivePriceOnUpdate;
            ");
            context.Database.ExecuteSqlRaw(@"
                EXEC('
                    CREATE TRIGGER dbo.tr_ArchivePriceOnUpdate
                    ON Trips
                    AFTER UPDATE
                    AS
                    BEGIN
                        SET NOCOUNT ON;
                        IF UPDATE(AktualnaCena)
                        BEGIN
                            INSERT INTO PriceHistories (WycieczkaId, Cena, DataOd, DataDo)
                            SELECT 
                                d.Id, 
                                d.AktualnaCena, 
                                ISNULL((SELECT MAX(DataDo) FROM PriceHistories WHERE WycieczkaId = d.Id), DATEADD(day, -30, GETDATE())), 
                                GETDATE()
                            FROM deleted d
                            JOIN inserted i ON d.Id = i.Id
                            WHERE d.AktualnaCena <> i.AktualnaCena;
                        END
                    END
                ');
            ");

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

            if (!context.Trips.Any(t => t.Tytul == "Paryski Szyk"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Paryski Szyk",
                    Kraj = "Francja",
                    Miasto = "Paryż",
                    Opis = "Romantyczny wyjazd do stolicy mody i miłości. Zwiedzanie wieży Eiffla, Luwru i rejs po Sekwanie.",
                    MaksymalnaLiczbaMiejsc = 12,
                    AktualnaCena = 3200.00m,
                    DataRozpoczecia = new DateTime(2026, 07, 05),
                    DataZakonczenia = new DateTime(2026, 07, 12),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Tajemnicza Japonia"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Tajemnicza Japonia",
                    Kraj = "Japonia",
                    Miasto = "Tokio",
                    Opis = "Fascynujące zderzenie tradycji z nowoczesnością. Odkryj świątynie w Kioto i neonowe ulice Tokio.",
                    MaksymalnaLiczbaMiejsc = 10,
                    AktualnaCena = 7500.00m,
                    DataRozpoczecia = new DateTime(2026, 10, 15),
                    DataZakonczenia = new DateTime(2026, 10, 25),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Alpejska Przygoda"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Alpejska Przygoda",
                    Kraj = "Szwajcaria",
                    Miasto = "Zurych",
                    Opis = "Górski trekking, zapierające dech w piersiach alpejskie widoki i degustacja szwajcarskiej czekolady.",
                    MaksymalnaLiczbaMiejsc = 14,
                    AktualnaCena = 4500.00m,
                    DataRozpoczecia = new DateTime(2026, 08, 20),
                    DataZakonczenia = new DateTime(2026, 08, 27),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Magiczny Egipt"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Magiczny Egipt",
                    Kraj = "Egipt",
                    Miasto = "Kair",
                    Opis = "Podróż śladami Faraonów. Piramidy w Gizie, Sfinks, rejs po Nilu i zwiedzanie Luksoru.",
                    MaksymalnaLiczbaMiejsc = 25,
                    AktualnaCena = 2900.00m,
                    DataRozpoczecia = new DateTime(2026, 11, 12),
                    DataZakonczenia = new DateTime(2026, 11, 19),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Fiordy Norwegii"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Fiordy Norwegii",
                    Kraj = "Norwegia",
                    Miasto = "Bergen",
                    Opis = "Niezapomniane widoki norweskich fiordów, dziewicza przyroda i malownicze miasteczko Bergen.",
                    MaksymalnaLiczbaMiejsc = 8,
                    AktualnaCena = 5200.00m,
                    DataRozpoczecia = new DateTime(2026, 07, 10),
                    DataZakonczenia = new DateTime(2026, 07, 17),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Safari w Kenii"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Safari w Kenii",
                    Kraj = "Kenia",
                    Miasto = "Nairobi",
                    Opis = "Stań oko w oko z dziką naturą. Obserwacja Wielkiej Piątki w rezerwacie Masai Mara.",
                    MaksymalnaLiczbaMiejsc = 12,
                    AktualnaCena = 6800.00m,
                    DataRozpoczecia = new DateTime(2026, 09, 05),
                    DataZakonczenia = new DateTime(2026, 09, 15),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Nowojorski Sen"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Nowojorski Sen",
                    Kraj = "USA",
                    Miasto = "Nowy Jork",
                    Opis = "Odkryj Manhattan, zobacz Statuę Wolności, przejdź się po Central Parku i poczuj energię Times Square.",
                    MaksymalnaLiczbaMiejsc = 15,
                    AktualnaCena = 8900.00m,
                    DataRozpoczecia = new DateTime(2026, 12, 10),
                    DataZakonczenia = new DateTime(2026, 12, 18),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Kolorowe Maroko"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Kolorowe Maroko",
                    Kraj = "Maroko",
                    Miasto = "Marrakesz",
                    Opis = "Magia tętniących życiem arabskich targów, noc spędzona na pustyni i orientalne zapachy Marrakeszu.",
                    MaksymalnaLiczbaMiejsc = 20,
                    AktualnaCena = 3400.00m,
                    DataRozpoczecia = new DateTime(2026, 09, 22),
                    DataZakonczenia = new DateTime(2026, 09, 29),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Rajskie Malediwy"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Rajskie Malediwy",
                    Kraj = "Malediwy",
                    Miasto = "Male",
                    Opis = "Luksusowy relaks w domkach na wodzie, krystalicznie czysta woda i nurkowanie wśród raf koralowych.",
                    MaksymalnaLiczbaMiejsc = 6,
                    AktualnaCena = 9500.00m,
                    DataRozpoczecia = new DateTime(2026, 11, 15),
                    DataZakonczenia = new DateTime(2026, 11, 25),
                    ZdjecieGlowne = null
                });
            }

            if (!context.Trips.Any(t => t.Tytul == "Urokliwa Islandia"))
            {
                context.Trips.Add(new Trip
                {
                    Tytul = "Urokliwa Islandia",
                    Kraj = "Islandia",
                    Miasto = "Reykjavik",
                    Opis = "Kraina lodu i ognia. Wulkaniczne plaże, wodospady, gorące źródła Blue Lagoon i gejzery.",
                    MaksymalnaLiczbaMiejsc = 10,
                    AktualnaCena = 5900.00m,
                    DataRozpoczecia = new DateTime(2026, 06, 18),
                    DataZakonczenia = new DateTime(2026, 06, 25),
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
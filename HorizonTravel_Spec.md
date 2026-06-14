# HorizonTravel - Specyfikacja Projektu (.NET + SQL Server)

Niniejszy plik stanowi kontekst i instrukcję dla Agenta AI (Antigravity CLI) w celu automatyzacji prac nad projektem akademickim.

## 1. Cel i Założenia Projektu
- **Temat:** System rezerwacji wycieczek i zarządzania ofertą biura podróży "HorizonTravel".
- **Architektura:** Klient-Serwer (Backend: ASP.NET Core Web API, Frontend: React.js/Blazor).
- **Baza danych:** SQL Server (Zewnętrzny/Lokalny), String połączeniowy: `Data Source=.;Initial Catalog=HorizonTravelDB;Integrated Security=True; Encrypt=False;`
- **Podejście do bazy:** Entity Framework Core Migrations (Code-First).

## 2. Struktura Bazy Danych (Wymagane min. 6 tabel + Dane Historyczne)
System musi implementować i mapować następujące tabele:

1. **Users** (Id, Email, HasloHash, Imie, Nazwisko, RolaId)
2. **Roles** (Id, NazwaRoli: Admin, Klient)
3. **Trips** (Id, Tytul, Kraj, Miasto, Opis, MaksymalnaLiczbaMiejsc, AktualnaCena, ZdjecieGlowne [VARBINARY(MAX)])
4. **PriceHistory** (Id, WycieczkaId, Cena, DataOd, DataDo) -> *Dane historyczne*
5. **Bookings** (Id, WycieczkaId, UzytkownikId, DataRezerwacji, LiczbaUczestnikow, SumarycznaCena, Status)
6. **Payments** (Id, RezerwacjaId, Kwota, DataPlatnosci, MetodaPlatnosci) -> *Dane historyczne*
7. **Reviews** (Id, WycieczkaId, UzytkownikId, Ocena, Komentarz, DataDodania)

## 3. Obiekty Bazodanowe do Implementacji (Wymóg przedmiotu)
Podczas generowania skryptów SQL lub konfiguracji EF Core, uwzględnij:
- **Indeks:** Nieklastrowany na `Trips(Kraj, AktualnaCena)`.
- **Widok:** `v_TripPopularityAndRevenue` (Trips + Bookings + Payments) podsumowujący sprzedaż i zyski.
- **Procedura składowana:** `sp_GetMonthlySalesReport(Rok)` zwracająca przychody w rozbiciu na 12 miesięcy.
- **Wyzwalacz (Trigger):** `tr_ArchivePriceOnUpdate` na tabeli `Trips`. Po zmianie ceny aktualnej, zapisuje starą cenę do `PriceHistory`.
- **Funkcja użytkownika (UDF):** `fn_CalculateLoyaltyDiscount(UzytkownikId)` wyliczająca rabat (5% lub 10%) na podstawie historycznej liczby rezerwacji.

## 4. Role i Wymagania Funkcjonalne
- **Administrator:** Zarządzanie wycieczkami (CRUD + upload zdjęć), modyfikacja cen, podgląd statystyk i wykresów finansowych.
- **Klient (Użytkownik):** Rejestracja, logowanie (haszowanie haseł za pomocą BCrypt), przeglądanie, filtrowanie (po kraju) i sortowanie wycieczek (po cenie), rezerwacja miejsc, wgląd w historię swoich podróży i dodawanie opinii.
- **Obsługa błędów:** Globalne logowanie błędów (Middleware), zabezpieczenie przed overbookingiem (brak wolnych miejsc).
- **Prezentacja danych w formie graficznej:** API musi wystawiać dane agregowane z widoku i procedury pod wykresy liniowe (przychody) oraz kołowe (popularność kierunków).

## 5. Instrukcje dla Antigravity CLI (agy)
- Przy generowaniu kodu .NET używaj wzorca architektonicznego Clean Architecture / Repository Pattern.
- Wszystkie zapytania do bazy optymalizuj za pomocą LINQ.
- Pamiętaj o obsłudze kolumny binarnej `ZdjecieGlowne` jako `byte[]` w encjach C#.

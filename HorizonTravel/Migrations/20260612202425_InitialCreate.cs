using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HorizonTravel.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NazwaRoli = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Tytul = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kraj = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Miasto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Opis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaksymalnaLiczbaMiejsc = table.Column<int>(type: "int", nullable: false),
                    AktualnaCena = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ZdjecieGlowne = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    DataRozpoczecia = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataZakonczenia = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HasloHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Imie = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nazwisko = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RolaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RolaId",
                        column: x => x.RolaId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PriceHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WycieczkaId = table.Column<int>(type: "int", nullable: false),
                    Cena = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DataOd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataDo = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriceHistories_Trips_WycieczkaId",
                        column: x => x.WycieczkaId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WycieczkaId = table.Column<int>(type: "int", nullable: false),
                    UzytkownikId = table.Column<int>(type: "int", nullable: false),
                    DataRezerwacji = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LiczbaUczestnikow = table.Column<int>(type: "int", nullable: false),
                    SumarycznaCena = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Trips_WycieczkaId",
                        column: x => x.WycieczkaId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_UzytkownikId",
                        column: x => x.UzytkownikId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WycieczkaId = table.Column<int>(type: "int", nullable: false),
                    UzytkownikId = table.Column<int>(type: "int", nullable: false),
                    Ocena = table.Column<int>(type: "int", nullable: false),
                    Komentarz = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataDodania = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Trips_WycieczkaId",
                        column: x => x.WycieczkaId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UzytkownikId",
                        column: x => x.UzytkownikId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RezerwacjaId = table.Column<int>(type: "int", nullable: false),
                    Kwota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DataPlatnosci = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MetodaPlatnosci = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Bookings_RezerwacjaId",
                        column: x => x.RezerwacjaId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UzytkownikId",
                table: "Bookings",
                column: "UzytkownikId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_WycieczkaId",
                table: "Bookings",
                column: "WycieczkaId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_RezerwacjaId",
                table: "Payments",
                column: "RezerwacjaId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceHistories_WycieczkaId",
                table: "PriceHistories",
                column: "WycieczkaId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UzytkownikId",
                table: "Reviews",
                column: "UzytkownikId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_WycieczkaId",
                table: "Reviews",
                column: "WycieczkaId");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_Kraj_AktualnaCena",
                table: "Trips",
                columns: new[] { "Kraj", "AktualnaCena" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_RolaId",
                table: "Users",
                column: "RolaId");

            // 1. Widok v_TripPopularityAndRevenue
            migrationBuilder.Sql(@"
                CREATE VIEW v_TripPopularityAndRevenue AS
                SELECT 
                    t.Id AS TripId,
                    t.Tytul,
                    COUNT(DISTINCT b.Id) AS LiczbaRezerwacji,
                    ISNULL(SUM(b.LiczbaUczestnikow), 0) AS SumaUczestnikow,
                    ISNULL(SUM(p.Kwota), 0) AS CalkowityPrzychod
                FROM Trips t
                LEFT JOIN Bookings b ON t.Id = b.WycieczkaId
                LEFT JOIN Payments p ON b.Id = p.RezerwacjaId
                GROUP BY t.Id, t.Tytul;
            ");

            // 2. Procedura składowana sp_GetMonthlySalesReport
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetMonthlySalesReport
                    @Rok INT
                AS
                BEGIN
                    SELECT 
                        m.Miesiac,
                        ISNULL(SUM(p.Kwota), 0) AS Przychod
                    FROM (
                        VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11), (12)
                    ) AS m(Miesiac)
                    LEFT JOIN Payments p ON MONTH(p.DataPlatnosci) = m.Miesiac AND YEAR(p.DataPlatnosci) = @Rok
                    GROUP BY m.Miesiac;
                END;
            ");

            // 3. Wyzwalacz tr_ArchivePriceOnUpdate
            migrationBuilder.Sql(@"
                CREATE TRIGGER tr_ArchivePriceOnUpdate
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
                            ISNULL((SELECT MAX(DataDo) FROM PriceHistories WHERE WycieczkaId = d.Id), GETDATE()), 
                            GETDATE()
                        FROM deleted d
                        JOIN inserted i ON d.Id = i.Id
                        WHERE d.AktualnaCena <> i.AktualnaCena;
                    END
                END;
            ");

            // 4. Funkcja fn_CalculateLoyaltyDiscount
            migrationBuilder.Sql(@"
                CREATE FUNCTION fn_CalculateLoyaltyDiscount
                (
                    @UzytkownikId INT
                )
                RETURNS DECIMAL(5, 2)
                AS
                BEGIN
                    DECLARE @LiczbaRezerwacji INT;
                    DECLARE @Discount DECIMAL(5, 2) = 0.00;

                    SELECT @LiczbaRezerwacji = COUNT(*) 
                    FROM Bookings 
                    WHERE UzytkownikId = @UzytkownikId AND Status = N'Opłacona';

                    IF @LiczbaRezerwacji >= 10
                        SET @Discount = 0.10;
                    ELSE IF @LiczbaRezerwacji >= 5
                        SET @Discount = 0.05;

                    RETURN @Discount;
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS fn_CalculateLoyaltyDiscount;");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS tr_ArchivePriceOnUpdate;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetMonthlySalesReport;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_TripPopularityAndRevenue;");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "PriceHistories");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}

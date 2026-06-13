using Microsoft.EntityFrameworkCore;
using HorizonTravel.Model;

namespace HorizonTravel.Data
{
    public class HorizonTravelDbContext : DbContext
    {
        public HorizonTravelDbContext(DbContextOptions<HorizonTravelDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<PriceHistory> PriceHistories { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relacja User -> Role (Wielu użytkowników ma jedną rolę)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Rola)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RolaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacja PriceHistory -> Trip (Wiele cen historycznych dla jednej wycieczki)
            modelBuilder.Entity<PriceHistory>()
                .HasOne(ph => ph.Wycieczka)
                .WithMany(t => t.PriceHistories)
                .HasForeignKey(ph => ph.WycieczkaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relacja Booking -> Trip (Wiele rezerwacji dla jednej wycieczki)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Wycieczka)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.WycieczkaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacja Booking -> User (Wiele rezerwacji dla jednego użytkownika)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Uzytkownik)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UzytkownikId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacja Payment -> Booking (Wiele płatności dla jednej rezerwacji)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Rezerwacja)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.RezerwacjaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relacja Review -> Trip (Wiele opinii dla jednej wycieczki)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Wycieczka)
                .WithMany(t => t.Reviews)
                .HasForeignKey(r => r.WycieczkaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relacja Review -> User (Wiele opinii dla jednego użytkownika)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Uzytkownik)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UzytkownikId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Trip>()
                .HasIndex(t => new { t.Kraj, t.AktualnaCena })
                .HasDatabaseName("IX_Trips_Kraj_AktualnaCena")
                .IsUnique(false);

            modelBuilder.Entity<Trip>()
                .ToTable(tb => tb.HasTrigger("tr_ArchivePriceOnUpdate"));

            modelBuilder.Entity<Trip>()
                .Property(t => t.AktualnaCena)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PriceHistory>()
                .Property(ph => ph.Cena)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Booking>()
                .Property(b => b.SumarycznaCena)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Kwota)
                .HasPrecision(18, 2);
        }
    }
}

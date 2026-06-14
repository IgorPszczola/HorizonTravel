using Microsoft.EntityFrameworkCore;
using HorizonTravel.Data;
using HorizonTravel.Model;
using HorizonTravel.Repositories;
using HorizonTravel.Services;
using HorizonTravel.Middleware;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<HorizonTravelDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Włączenie CORS dla frontendu
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Konfiguracja JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Brak klucza JWT w konfiguracji.");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddScoped<ITripRepository, TripRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookingService, BookingService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Rejestracja globalnej obsługi błędów
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs", options =>
    {
        options.WithTitle("HorizonTravel API")
               .WithTheme(ScalarTheme.Purple);
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication(); // Włączamy uwierzytelnianie tokenem JWT
app.UseAuthorization(); // Włączamy autoryzację ról

app.MapControllers();

// Automatyczne zasilenie (seed) bazy danych danymi testowymi z obsługą czasu uruchamiania bazy (np. w Dockerze)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HorizonTravelDbContext>();
    
    int maxRetries = 15;
    int delaySeconds = 4;
    for (int i = 1; i <= maxRetries; i++)
    {
        try
        {
            Console.WriteLine($"Próba połączenia z bazą danych ({i}/{maxRetries})...");
            DataSeeder.Seed(context);
            Console.WriteLine("Baza danych została pomyślnie zainicjalizowana i zasilona.");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Nie udało się połączyć z bazą danych: {ex.Message}");
            if (i == maxRetries)
            {
                Console.WriteLine("Osiągnięto limit prób połączenia z bazą danych. Aplikacja kończy działanie.");
                throw;
            }
            Console.WriteLine($"Oczekiwanie {delaySeconds}s przed kolejną próbą...");
            Thread.Sleep(TimeSpan.FromSeconds(delaySeconds));
        }
    }
}

app.Run();
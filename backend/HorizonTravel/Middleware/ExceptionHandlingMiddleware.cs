using System.Net;
using System.Text.Json;

namespace HorizonTravel.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Wystąpił nieobsługiwany wyjątek w aplikacji.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError; // Domyślnie status 500
            var message = "Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie później.";

            // Filtrujemy wyjątki pod kątem odpowiednich kodów HTTP i komunikatów
            switch (exception)
            {
                case KeyNotFoundException:
                    code = HttpStatusCode.NotFound; // 404
                    message = exception.Message;
                    break;
                case InvalidOperationException:
                case ArgumentException:
                    code = HttpStatusCode.BadRequest; // 400
                    message = exception.Message;
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            var responsePayload = new
            {
                statusCode = (int)code,
                message = message
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            return context.Response.WriteAsync(JsonSerializer.Serialize(responsePayload, options));
        }
    }
}
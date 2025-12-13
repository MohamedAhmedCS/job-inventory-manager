using System.Collections.Concurrent;

namespace server.Middleware;

public class RateLimitingMiddleware : IMiddleware
{
    private static readonly ConcurrentDictionary<string, RateLimitBucket> _buckets = new();

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var clientId = GetClientIdentifier(context);
        var bucket = _buckets.GetOrAdd(clientId, _ => new RateLimitBucket());

        if (!bucket.AllowRequest())
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = "Rate limit exceeded. Max 100 requests per minute." });
            return;
        }

        await next(context);
    }

    private static string GetClientIdentifier(HttpContext context)
    {
        // Use IP address for rate limiting
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private class RateLimitBucket
    {
        private DateTime _windowStart = DateTime.UtcNow;
        private int _requestCount = 0;
        private const int RequestLimit = 100;
        private const int WindowSizeSeconds = 60;

        public bool AllowRequest()
        {
            var now = DateTime.UtcNow;
            var windowAge = (now - _windowStart).TotalSeconds;

            if (windowAge >= WindowSizeSeconds)
            {
                _windowStart = now;
                _requestCount = 0;
            }

            if (_requestCount >= RequestLimit)
            {
                return false;
            }

            _requestCount++;
            return true;
        }
    }
}

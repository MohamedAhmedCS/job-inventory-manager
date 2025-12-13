using System;

namespace server.Utils
{
    public class LoggingHelper
    {
        private readonly ILogger<LoggingHelper> _logger;

        public LoggingHelper(ILogger<LoggingHelper> logger)
        {
            _logger = logger;
        }

        public void LogAction(string action, string username, string details = "")
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            var message = $"[{timestamp}] Action: {action} | User: {username} | Details: {details}";
            _logger.LogInformation(message);
        }

        public void LogError(string action, string username, Exception exception)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            var message = $"[{timestamp}] ERROR in {action} | User: {username} | Exception: {exception.Message}";
            _logger.LogError(exception, message);
        }

        public void LogJobOperation(string operation, int jobId, string username)
        {
            LogAction($"JobApplication_{operation}", username, $"JobId: {jobId}");
        }

        public void LogAuthOperation(string operation, string username, bool success)
        {
            var details = $"Success: {success}";
            LogAction($"Auth_{operation}", username, details);
        }
    }
}

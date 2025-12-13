namespace server.Models
{
    public class SharedLink
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Token { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "job_packet" or "profile"
        public int? JobId { get; set; }
        public Job? Job { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
    }
}

namespace server.Models
{
    public class ApplicationAsset
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public Job Job { get; set; } = null!;

        public ApplicationAssetType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

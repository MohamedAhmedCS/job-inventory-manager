namespace server.Models
{
    public class JobAiAnalysis
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public Job Job { get; set; } = null!;

        public int MatchScore { get; set; } // 0-100
        public string StrengthsSummary { get; set; } = string.Empty;
        public string GapsSummary { get; set; } = string.Empty;
        public string RecommendedHighlights { get; set; } = string.Empty; // JSON or comma-separated
        public string SkillGapsAndIdeas { get; set; } = string.Empty; // JSON or text

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

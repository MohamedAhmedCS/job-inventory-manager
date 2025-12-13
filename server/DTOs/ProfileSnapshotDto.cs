namespace server.DTOs
{
    /// <summary>
    /// Compact representation of a user's profile for AI processing.
    /// Used by AI services to analyze fit, generate assets, etc.
    /// </summary>
    public class ProfileSnapshotDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;

        public List<ExperienceSummaryDto> Experiences { get; set; } = [];
        public List<ProjectSummaryDto> Projects { get; set; } = [];
        public List<SkillSummaryDto> Skills { get; set; } = [];
        public List<StorySummaryDto> Stories { get; set; } = [];
    }

    public class ExperienceSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string BulletPoints { get; set; } = string.Empty;
        public List<string> Skills { get; set; } = [];
    }

    public class ProjectSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public List<string> Skills { get; set; } = [];
    }

    public class SkillSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
    }

    public class StorySummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Competency { get; set; } = string.Empty;
        public int StrengthRating { get; set; }
        // Full STAR content available if needed
        public string Situation { get; set; } = string.Empty;
        public string Task { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
    }
}

namespace server.Models
{
    public class Skill
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // "language", "cloud", "os", "soft_skill", etc.
        public string Level { get; set; } = "intermediate"; // "beginner", "intermediate", "advanced"
        public int? YearsOfExperience { get; set; }

        // Relationships
        public ICollection<ExperienceSkill> ExperienceSkills { get; set; } = [];
        public ICollection<ProjectSkill> ProjectSkills { get; set; } = [];
        public ICollection<StorySkill> StorySkills { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

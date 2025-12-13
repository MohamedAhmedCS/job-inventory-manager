namespace server.Models
{
    public class Experience
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string BulletPoints { get; set; } = string.Empty; // JSON array of strings
        public string Technologies { get; set; } = string.Empty; // comma-separated or JSON

        // Relationships
        public ICollection<ExperienceSkill> ExperienceSkills { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // Join table
    public class ExperienceSkill
    {
        public int ExperienceId { get; set; }
        public Experience Experience { get; set; } = null!;

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;
    }
}

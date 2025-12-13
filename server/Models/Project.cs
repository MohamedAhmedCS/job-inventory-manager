namespace server.Models
{
    public class Project
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty; // comma-separated or JSON
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string RepositoryUrl { get; set; } = string.Empty;
        public string LiveUrl { get; set; } = string.Empty;

        // Relationships
        public ICollection<ProjectSkill> ProjectSkills { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // Join table
    public class ProjectSkill
    {
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;
    }
}

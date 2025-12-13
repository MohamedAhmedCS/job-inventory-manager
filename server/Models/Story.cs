namespace server.Models
{
    public class Story
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // STAR fields
        public string Title { get; set; } = string.Empty;
        public string Situation { get; set; } = string.Empty;
        public string Task { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;

        // Context
        public int? LinkedExperienceId { get; set; }
        public Experience? LinkedExperience { get; set; }

        public int? LinkedProjectId { get; set; }
        public Project? LinkedProject { get; set; }

        public string Tags { get; set; } = string.Empty; // comma-separated
        public string Competency { get; set; } = string.Empty; // e.g. "communication", "leadership", "problem_solving"
        public string PrimarySkills { get; set; } = string.Empty; // comma-separated

        // Metrics
        public int StrengthRating { get; set; } = 3; // 1-5
        public int UsageCount { get; set; }
        public DateTime? LastUsedDate { get; set; }

        // Relationships
        public ICollection<StorySkill> StorySkills { get; set; } = [];
        public ICollection<InterviewQuestionStory> InterviewQuestionStories { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // Join table
    public class StorySkill
    {
        public int StoryId { get; set; }
        public Story Story { get; set; } = null!;

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;
    }
}

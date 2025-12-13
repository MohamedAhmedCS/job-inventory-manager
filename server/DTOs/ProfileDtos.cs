namespace server.DTOs
{
    // Profile entity DTOs
    public class SkillDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public int? YearsOfExperience { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SkillCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Level { get; set; } = "intermediate";
        public int? YearsOfExperience { get; set; }
    }

    public class ExperienceDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string BulletPoints { get; set; } = string.Empty;
        public string Technologies { get; set; } = string.Empty;
        public List<SkillDto> Skills { get; set; } = [];
        public DateTime CreatedAt { get; set; }
    }

    public class ExperienceCreateUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string BulletPoints { get; set; } = string.Empty;
        public string Technologies { get; set; } = string.Empty;
        public List<int> SkillIds { get; set; } = [];
    }

    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string RepositoryUrl { get; set; } = string.Empty;
        public string LiveUrl { get; set; } = string.Empty;
        public List<SkillDto> Skills { get; set; } = [];
        public DateTime CreatedAt { get; set; }
    }

    public class ProjectCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string RepositoryUrl { get; set; } = string.Empty;
        public string LiveUrl { get; set; } = string.Empty;
        public List<int> SkillIds { get; set; } = [];
    }

    public class StoryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Situation { get; set; } = string.Empty;
        public string Task { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public int? LinkedExperienceId { get; set; }
        public int? LinkedProjectId { get; set; }
        public string Tags { get; set; } = string.Empty;
        public string Competency { get; set; } = string.Empty;
        public string PrimarySkills { get; set; } = string.Empty;
        public int StrengthRating { get; set; }
        public int UsageCount { get; set; }
        public DateTime? LastUsedDate { get; set; }
        public List<SkillDto> Skills { get; set; } = [];
        public DateTime CreatedAt { get; set; }
    }

    public class StoryCreateUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Situation { get; set; } = string.Empty;
        public string Task { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public int? LinkedExperienceId { get; set; }
        public int? LinkedProjectId { get; set; }
        public string Tags { get; set; } = string.Empty;
        public string Competency { get; set; } = string.Empty;
        public string PrimarySkills { get; set; } = string.Empty;
        public int StrengthRating { get; set; } = 3;
        public List<int> SkillIds { get; set; } = [];
    }

    public class ResumeTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ResumeTemplateCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }

    public class InterviewQuestionDto
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string SourceType { get; set; } = string.Empty;
        public int Difficulty { get; set; }
        public bool NeedsPractice { get; set; }
        public int OrderIndex { get; set; }
        public List<InterviewQuestionStoryDto> LinkedStories { get; set; } = [];
        public List<InterviewQuestionStoryDto> Stories { get; set; } = [];
        public DateTime CreatedAt { get; set; }
    }

    public class InterviewQuestionStoryDto
    {
        public int StoryId { get; set; }
        public string StoryTitle { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class InterviewQuestionUpdateDto
    {
        public bool NeedsPractice { get; set; }
        public int Difficulty { get; set; }
        public int? PrimaryStoryId { get; set; }
    }
}

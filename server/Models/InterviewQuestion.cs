namespace server.Models
{
    public enum QuestionCategory
    {
        Behavioral,
        Technical,
        Mixed
    }

    public enum QuestionSource
    {
        DutyStatement,
        Internet
    }

    public class InterviewQuestion
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public Job Job { get; set; } = null!;

        public string QuestionText { get; set; } = string.Empty;
        public InterviewQuestionCategory Category { get; set; }
        public InterviewQuestionSourceType SourceType { get; set; }
        public int Difficulty { get; set; } = 3; // 1-5
        public bool NeedsPractice { get; set; }
        public int OrderIndex { get; set; }

        // Relationships - collection of stories linked to this question
        public ICollection<InterviewQuestionStory> Stories { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // Join table with primary flag
    public class InterviewQuestionStory
    {
        public int InterviewQuestionId { get; set; }
        public InterviewQuestion InterviewQuestion { get; set; } = null!;

        public int StoryId { get; set; }
        public Story Story { get; set; } = null!;

        public bool IsPrimary { get; set; }
    }
}

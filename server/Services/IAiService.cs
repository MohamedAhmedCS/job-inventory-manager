using server.DTOs;
using server.Models;

namespace server.Services
{
    /// <summary>
    /// Interface for AI-powered features.
    /// Implementations can be swapped (dummy for now, real APIs later).
    /// </summary>
    public interface IAiService
    {
        /// <summary>
        /// Analyze how well a user fits a specific job.
        /// </summary>
        Task<JobFitAnalysisResult> AnalyzeJobFitAsync(
            ProfileSnapshotDto profile,
            Job job,
            string apiKey);

        /// <summary>
        /// Generate application assets (resume, SOQ, cover letter, etc.).
        /// </summary>
        Task<string> GenerateApplicationAssetAsync(
            ProfileSnapshotDto profile,
            Job job,
            string assetType, // "resume", "soq", "cover_letter"
            string templateContent,
            string? extraInstructions,
            string apiKey);

        /// <summary>
        /// Generate interview questions based on job duty statement.
        /// </summary>
        Task<List<GeneratedQuestion>> GenerateDutyStatementQuestionsAsync(
            ProfileSnapshotDto profile,
            Job job,
            string apiKey);

        /// <summary>
        /// Generate common interview questions for this role (from internet patterns).
        /// </summary>
        Task<List<GeneratedQuestion>> GenerateInternetPatternQuestionsAsync(
            ProfileSnapshotDto profile,
            Job job,
            string apiKey);

        /// <summary>
        /// Match user's stories to interview questions.
        /// </summary>
        Task<Dictionary<int, StoryMatchResult>> MatchStoriesToQuestionsAsync(
            ProfileSnapshotDto profile,
            IEnumerable<string> questionTexts,
            string apiKey);

        /// <summary>
        /// Parse and summarize a job posting.
        /// </summary>
        Task<JobParseResult> ParseJobDescriptionAsync(
            Job job,
            string apiKey);
    }

    // Result types
    public class JobFitAnalysisResult
    {
        public int MatchScore { get; set; } // 0-100
        public string StrengthsSummary { get; set; } = string.Empty;
        public string GapsSummary { get; set; } = string.Empty;
        public List<string> RecommendedHighlights { get; set; } = [];
        public List<SkillGapSuggestion> SkillGapIdeas { get; set; } = [];
    }

    public class SkillGapSuggestion
    {
        public string Skill { get; set; } = string.Empty;
        public string LearningIdea { get; set; } = string.Empty;
    }

    public class GeneratedQuestion
    {
        public string Text { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // "behavioral", "technical", "mixed"
        public int Difficulty { get; set; } = 3;
    }

    public class StoryMatchResult
    {
        public int StoryId { get; set; }
        public string StoryTitle { get; set; } = string.Empty;
        public double MatchScore { get; set; } // 0-1
        public string Reasoning { get; set; } = string.Empty;
    }

    public class JobParseResult
    {
        public string Summary { get; set; } = string.Empty;
        public List<string> KeyResponsibilities { get; set; } = [];
        public List<string> ExtractedSkills { get; set; } = [];
        public List<string> KsaPatterns { get; set; } = []; // State jobs
    }
}

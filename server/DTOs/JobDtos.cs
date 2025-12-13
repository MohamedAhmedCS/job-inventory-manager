namespace server.DTOs
{
    // Job DTOs
    public class JobCreateUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string PostingUrl { get; set; } = string.Empty;
        public string RawDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SalaryRange { get; set; } = string.Empty;
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public DateTime? ClosingDate { get; set; }
        public string Status { get; set; } = "Planned";
        public string JobType { get; set; } = "Private"; // "State" or "Private"
        public string Notes { get; set; } = string.Empty;

        // State fields
        public string? Department { get; set; }
        public string? Classification { get; set; }
        public string? JcNumber { get; set; }
        public string? ExamType { get; set; }
        public bool SoqRequired { get; set; }

        // Private fields
        public string? CompanyName { get; set; }
        public string? TeamName { get; set; }
        public string? JobBoard { get; set; }
    }

    public class JobDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string PostingUrl { get; set; } = string.Empty;
        public string RawDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SalaryRange { get; set; } = string.Empty;
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string KsaPatterns { get; set; } = string.Empty;
        public DateTime? ClosingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public DateTime AppliedDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int InterviewQuestionsCount { get; set; }

        // State fields
        public string? Department { get; set; }
        public string? Classification { get; set; }
        public string? JcNumber { get; set; }
        public string? ExamType { get; set; }
        public bool SoqRequired { get; set; }

        // Private fields
        public string? CompanyName { get; set; }
        public string? TeamName { get; set; }
        public string? JobBoard { get; set; }

        // Parsed AI data
        public string? ParsedSummary { get; set; }
        public string? KeyResponsibilities { get; set; }
        public string? ExtractedSkills { get; set; }

        // Related
        public JobAiAnalysisDto? AiAnalysis { get; set; }
        public List<ApplicationAssetDto> Assets { get; set; } = [];
        public List<InterviewQuestionDto> InterviewQuestions { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class JobListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CompanyNameOrDepartment { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? Department { get; set; }
        public string Status { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public DateTime AppliedDate { get; set; }
        public string? Classification { get; set; } // State jobs
        public int AssetCount { get; set; }
        public int? MatchScore { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class JobAiAnalysisDto
    {
        public int Id { get; set; }
        public int MatchScore { get; set; }
        public string StrengthsSummary { get; set; } = string.Empty;
        public string GapsSummary { get; set; } = string.Empty;
        public string RecommendedHighlights { get; set; } = string.Empty;
        public string SkillGapsAndIdeas { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApplicationAssetDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApplicationAssetCreateUpdateDto
    {
        public string Type { get; set; } = string.Empty; // "Resume", "Soq", "CoverLetter", "Notes"
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}

using System;
using System.Collections.Generic;

namespace server.Models;

public class Job
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string JobUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RawContent { get; set; } = string.Empty;
    public string ParsedSummary { get; set; } = string.Empty;
    public string ParsedResponsibilities { get; set; } = string.Empty;
    public string ParsedRequirements { get; set; } = string.Empty;
    public string ParsedPreferred { get; set; } = string.Empty;
    public string ParsedBenefits { get; set; } = string.Empty;
    
    public JobType JobType { get; set; }
    public JobStatus Status { get; set; }
    
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    
    public string KsaPatterns { get; set; } = string.Empty;
    public string KeyResponsibilities { get; set; } = string.Empty;
    public string ExtractedSkills { get; set; } = string.Empty;
    
    // Federal job-specific properties
    public string? Classification { get; set; }
    public string? JcNumber { get; set; }
    public string? ExamType { get; set; }
    public bool SoqRequired { get; set; }
    public string? TeamName { get; set; }
    public string? JobBoard { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public JobAiAnalysis? AiAnalysis { get; set; }
    public List<InterviewQuestion> InterviewQuestions { get; set; } = new();
    public List<ApplicationAsset> ApplicationAssets { get; set; } = new();
    public List<SharedLink> SharedLinks { get; set; } = new();
}

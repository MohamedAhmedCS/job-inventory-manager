using server.DTOs;
using server.Models;

namespace server.Services
{
    /// <summary>
    /// Dummy implementation of IAiService.
    /// Returns realistic placeholder data with no external API calls.
    /// Ready to be swapped for real AI implementations later.
    /// </summary>
    public class DummyAiService : IAiService
    {
        private readonly ILogger<DummyAiService> _logger;

        public DummyAiService(ILogger<DummyAiService> logger)
        {
            _logger = logger;
        }

        public async Task<JobFitAnalysisResult> AnalyzeJobFitAsync(
            ProfileSnapshotDto profile,
            Job job,
            string apiKey)
        {
            _logger.LogInformation($"[DUMMY] AnalyzeJobFit for user {profile.UserId}, job {job.Id}");

            // Simulate processing time
            await Task.Delay(500);

            // Simulate a realistic fit analysis
            int matchScore = GenerateMatchScore(profile, job);
            
            return new JobFitAnalysisResult
            {
                MatchScore = matchScore,
                StrengthsSummary = $"Your experience with {GetTopSkillName(profile)} aligns well with this {job.JobType} role. " +
                    "Your background demonstrates the core competencies needed.",
                GapsSummary = $"Consider strengthening your {GetGapSkillName(job)} knowledge. " +
                    "Additional certification or hands-on project experience would be beneficial.",
                RecommendedHighlights = new List<string>
                {
                    profile.Experiences.FirstOrDefault()?.Title ?? "Professional experience",
                    profile.Projects.FirstOrDefault()?.Name ?? "Technical project",
                    GetMostRelevantStory(profile, job)
                },
                SkillGapIdeas = new List<SkillGapSuggestion>
                {
                    new() 
                    { 
                        Skill = "Advanced configuration management", 
                        LearningIdea = "Complete a hands-on Terraform or Ansible project" 
                    },
                    new() 
                    { 
                        Skill = "Cloud security practices", 
                        LearningIdea = "Study AWS/Azure security best practices and pursue relevant certification" 
                    }
                }
            };
        }

        public async Task<string> GenerateApplicationAssetAsync(
            ProfileSnapshotDto profile,
            Job job,
            string assetType,
            string templateContent,
            string? extraInstructions,
            string apiKey)
        {
            _logger.LogInformation($"[DUMMY] GenerateApplicationAsset type={assetType} for user {profile.UserId}, job {job.Id}");

            await Task.Delay(800);

            return assetType.ToLower() switch
            {
                "resume" => GenerateDummyResume(profile, job, templateContent),
                "soq" => GenerateDummySoq(profile, job),
                "cover_letter" => GenerateDummyCoverLetter(profile, job),
                _ => "Asset generation not supported for this type."
            };
        }

        public async Task<List<GeneratedQuestion>> GenerateDutyStatementQuestionsAsync(
            ProfileSnapshotDto profile,
            Job job,
            string apiKey)
        {
            _logger.LogInformation($"[DUMMY] GenerateDutyStatementQuestions for job {job.Id}");

            await Task.Delay(600);

            return new List<GeneratedQuestion>
            {
                new() 
                { 
                    Text = "Describe your experience managing infrastructure similar to what this role involves.",
                    Category = "behavioral",
                    Difficulty = 2
                },
                new() 
                { 
                    Text = "How would you approach troubleshooting a critical system failure in this environment?",
                    Category = "technical",
                    Difficulty = 4
                },
                new() 
                { 
                    Text = "Tell us about a time you implemented a significant system improvement.",
                    Category = "behavioral",
                    Difficulty = 3
                }
            };
        }

        public async Task<List<GeneratedQuestion>> GenerateInternetPatternQuestionsAsync(
            ProfileSnapshotDto profile,
            Job job,
            string apiKey)
        {
            _logger.LogInformation($"[DUMMY] GenerateInternetPatternQuestions for job {job.Id}");

            await Task.Delay(600);

            return new List<GeneratedQuestion>
            {
                new() 
                { 
                    Text = "What are your career goals and how does this role fit into them?",
                    Category = "behavioral",
                    Difficulty = 1
                },
                new() 
                { 
                    Text = "Tell us about a challenge you faced and how you overcame it.",
                    Category = "behavioral",
                    Difficulty = 2
                },
                new() 
                { 
                    Text = "Why are you interested in this position and our organization?",
                    Category = "mixed",
                    Difficulty = 1
                },
                new() 
                { 
                    Text = "Describe a project you're proud of and your specific contributions.",
                    Category = "behavioral",
                    Difficulty = 3
                }
            };
        }

        public async Task<Dictionary<int, StoryMatchResult>> MatchStoriesToQuestionsAsync(
            ProfileSnapshotDto profile,
            IEnumerable<string> questionTexts,
            string apiKey)
        {
            _logger.LogInformation($"[DUMMY] MatchStoriesToQuestions for user {profile.UserId}");

            await Task.Delay(700);

            var results = new Dictionary<int, StoryMatchResult>();
            int questionIndex = 0;

            foreach (var questionText in questionTexts)
            {
                if (profile.Stories.Count > 0)
                {
                    var story = profile.Stories[questionIndex % profile.Stories.Count];
                    results[questionIndex] = new StoryMatchResult
                    {
                        StoryId = story.Id,
                        StoryTitle = story.Title,
                        MatchScore = 0.75 + (Random.Shared.NextDouble() * 0.2), // 0.75-0.95
                        Reasoning = $"This story effectively demonstrates the {story.Competency} competency."
                    };
                }

                questionIndex++;
            }

            return results;
        }

        public async Task<JobParseResult> ParseJobDescriptionAsync(
            Job job,
            string apiKey)
        {
            _logger.LogInformation($"[DUMMY] ParseJobDescription for job {job.Id}");

            await Task.Delay(500);

            var isStateJob = job.JobType == JobType.State;

            return new JobParseResult
            {
                Summary = $"This is a {job.JobType} position for {job.Title}. " +
                    "The role focuses on technical infrastructure and system management.",
                KeyResponsibilities = new List<string>
                {
                    "Manage and maintain critical systems",
                    "Troubleshoot and resolve technical issues",
                    "Implement system improvements and optimizations",
                    "Collaborate with team members on projects",
                    "Document processes and procedures"
                },
                ExtractedSkills = new List<string>
                {
                    "Linux/Unix",
                    "Cloud platforms (AWS/Azure/GCP)",
                    "Scripting and automation",
                    "Problem-solving",
                    "Communication"
                },
                KsaPatterns = isStateJob ? new List<string>
                {
                    "Knowledge of cloud infrastructure design",
                    "Ability to diagnose complex system problems",
                    "Skill in automation and scripting"
                } : []
            };
        }

        // Private helpers
        private int GenerateMatchScore(ProfileSnapshotDto profile, Job job)
        {
            // Simple heuristic: more experiences and skills = higher match
            int baseScore = 50;
            baseScore += Math.Min(profile.Experiences.Count * 5, 20);
            baseScore += Math.Min(profile.Skills.Count * 2, 20);
            baseScore += Random.Shared.Next(-10, 11); // Add some variance

            return Math.Min(Math.Max(baseScore, 0), 100);
        }

        private string GetTopSkillName(ProfileSnapshotDto profile)
        {
            return profile.Skills.FirstOrDefault()?.Name ?? "technical expertise";
        }

        private string GetGapSkillName(Job job)
        {
            return job.JobType == JobType.State ? "cloud infrastructure" : "specific domain knowledge";
        }

        private string GetMostRelevantStory(ProfileSnapshotDto profile, Job job)
        {
            return profile.Stories.FirstOrDefault()?.Title ?? "relevant achievement";
        }

        private string GenerateDummyResume(ProfileSnapshotDto profile, Job job, string templateContent)
        {
            // In a real implementation, this would use the template structure and tailor each bullet.
            // For now, return a realistic placeholder.
            return $"""
                RESUME FOR: {profile.Username}
                ════════════════════════════════════════

                PROFESSIONAL SUMMARY
                Experienced professional with expertise in {(profile.Skills.FirstOrDefault()?.Name ?? "technical domains")}.
                Proven track record in {job.Title} related roles and technologies.

                EXPERIENCE
                {string.Join("\n", profile.Experiences.Select(e => $"""
                {e.Title}
                {e.Organization}
                {e.Summary}
                """))}

                SKILLS
                {string.Join(", ", profile.Skills.Select(s => s.Name))}

                PROJECTS
                {string.Join("\n", profile.Projects.Select(p => $"""
                {p.Name} - {p.Role}
                {p.Description}
                """))}

                ════════════════════════════════════════
                [This resume was tailored for: {job.Title}]
                [Match Score: {Random.Shared.Next(65, 95)}%]
                """;
        }

        private string GenerateDummySoq(ProfileSnapshotDto profile, Job job)
        {
            return $"""
                STATEMENT OF QUALIFICATIONS
                For: {job.Title}
                Department: {job.Department}
                ════════════════════════════════════════

                KNOWLEDGE

                Knowledge of cloud infrastructure and system administration:
                {string.Join("\n", profile.Experiences.Take(3).Select(e => $"• {e.Title} at {e.Organization}"))}

                ABILITIES

                Ability to manage and troubleshoot complex systems:
                {string.Join("\n", profile.Skills.Take(3).Select(s => $"• {s.Name} ({s.Level})"))}

                SKILLS

                Skilled in automation and infrastructure management:
                {string.Join("\n", profile.Projects.Take(2).Select(p => $"• {p.Name}: {p.Description}"))}

                ════════════════════════════════════════
                [This SOQ addresses the job requirements and demonstrates relevant qualifications]
                """;
        }

        private string GenerateDummyCoverLetter(ProfileSnapshotDto profile, Job job)
        {
            return $"""
                Dear Hiring Manager,

                I am writing to express my strong interest in the {job.Title} position at {job.CompanyName ?? "your organization"}.

                With my background in {GetTopSkillName(profile)} and proven track record in similar roles, I am confident I can make immediate contributions to your team.

                Throughout my career, I have:
                {string.Join("\n", profile.Experiences.Take(2).Select(e => $"• {e.Summary}"))}

                I am particularly drawn to this opportunity because of your organization's commitment to excellence and innovation. I am excited about the possibility of contributing my skills and experience to your team.

                Thank you for considering my application. I look forward to discussing how I can add value to {job.CompanyName ?? "your team"}.

                Sincerely,
                {profile.Username}

                ════════════════════════════════════════
                [This cover letter was generated for: {job.CompanyName ?? "the organization"}]
                """;
        }
    }
}

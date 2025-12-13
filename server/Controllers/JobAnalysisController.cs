using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/jobs/{jobId}/analysis")]
[Authorize]
public class JobAnalysisController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAiService _aiService;
    private readonly IProfileService _profileService;
    private readonly ILogger<JobAnalysisController> _logger;

    public JobAnalysisController(
        AppDbContext context,
        IAiService aiService,
        IProfileService profileService,
        ILogger<JobAnalysisController> logger)
    {
        _context = context;
        _aiService = aiService;
        _profileService = profileService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value 
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("userId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    [HttpGet]
    public async Task<ActionResult<JobAiAnalysisDto>> GetAnalysis(int jobId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .Include(j => j.AiAnalysis)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (job.AiAnalysis == null)
            return NotFound("No analysis available. Run analysis first.");

        var dto = new JobAiAnalysisDto
        {
            Id = job.AiAnalysis.Id,
            MatchScore = job.AiAnalysis.MatchScore,
            StrengthsSummary = job.AiAnalysis.StrengthsSummary,
            GapsSummary = job.AiAnalysis.GapsSummary,
            RecommendedHighlights = job.AiAnalysis.RecommendedHighlights,
            SkillGapsAndIdeas = job.AiAnalysis.SkillGapsAndIdeas,
            CreatedAt = job.AiAnalysis.CreatedAt,
            UpdatedAt = job.AiAnalysis.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost("run")]
    public async Task<ActionResult<JobAiAnalysisDto>> RunAnalysis(int jobId, [FromBody] AnalysisRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .Include(j => j.AiAnalysis)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (string.IsNullOrEmpty(job.Description))
            return BadRequest("Job description is required before analysis");

        try
        {
            // Get user's profile snapshot
            var profile = await _profileService.GetProfileSnapshotAsync(userId);

            // Run AI analysis
            var result = await _aiService.AnalyzeJobFitAsync(
                profile,
                job,
                request.ApiKey ?? string.Empty);

            // Create or update analysis record
            if (job.AiAnalysis == null)
            {
                job.AiAnalysis = new JobAiAnalysis
                {
                    JobId = job.Id,
                    MatchScore = result.MatchScore,
                    StrengthsSummary = result.StrengthsSummary,
                    GapsSummary = result.GapsSummary,
                    RecommendedHighlights = string.Join(", ", result.RecommendedHighlights),
                    SkillGapsAndIdeas = string.Join("; ", result.SkillGapIdeas.Select(s => $"{s.Skill}: {s.LearningIdea}"))
                };
            }
            else
            {
                job.AiAnalysis.MatchScore = result.MatchScore;
                job.AiAnalysis.StrengthsSummary = result.StrengthsSummary;
                job.AiAnalysis.GapsSummary = result.GapsSummary;
                job.AiAnalysis.RecommendedHighlights = string.Join(", ", result.RecommendedHighlights);
                job.AiAnalysis.SkillGapsAndIdeas = string.Join("; ", result.SkillGapIdeas.Select(s => $"{s.Skill}: {s.LearningIdea}"));
                job.AiAnalysis.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Job {JobId} analysis completed for user {UserId}: Match score {MatchScore}",
                jobId, userId, result.MatchScore);

            var dto = new JobAiAnalysisDto
            {
                Id = job.AiAnalysis.Id,
                MatchScore = job.AiAnalysis.MatchScore,
                StrengthsSummary = job.AiAnalysis.StrengthsSummary,
                GapsSummary = job.AiAnalysis.GapsSummary,
                RecommendedHighlights = job.AiAnalysis.RecommendedHighlights,
                SkillGapsAndIdeas = job.AiAnalysis.SkillGapsAndIdeas,
                CreatedAt = job.AiAnalysis.CreatedAt,
                UpdatedAt = job.AiAnalysis.UpdatedAt
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis failed for job {JobId}", jobId);
            return StatusCode(500, new { error = "Analysis failed", message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAnalysis(int jobId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .Include(j => j.AiAnalysis)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (job.AiAnalysis != null)
        {
            _context.JobAiAnalyses.Remove(job.AiAnalysis);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Analysis deleted for job {JobId} by user {UserId}", jobId, userId);
        }

        return NoContent();
    }
}

public class AnalysisRequest
{
    public string? ApiKey { get; set; }
}

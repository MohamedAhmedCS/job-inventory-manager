using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<JobsController> _logger;

    public JobsController(AppDbContext context, ILogger<JobsController> logger)
    {
        _context = context;
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
    public async Task<ActionResult<List<JobListItemDto>>> GetJobs(
        [FromQuery] string? jobType,
        [FromQuery] string? status,
        [FromQuery] string? searchTerm,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        var query = _context.Jobs
            .Where(j => j.UserId == userId)
            .AsQueryable();

        // Filters
        if (!string.IsNullOrEmpty(jobType) && Enum.TryParse<JobType>(jobType, true, out var parsedJobType))
            query = query.Where(j => j.JobType == parsedJobType);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<JobStatus>(status, true, out var parsedStatus))
            query = query.Where(j => j.Status == parsedStatus);

        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(j =>
                (j.Title ?? "").Contains(searchTerm) ||
                (j.CompanyName ?? "").Contains(searchTerm) ||
                (j.ParsedSummary ?? "").Contains(searchTerm));

        var total = await query.CountAsync();
        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = jobs.Select(j => new JobListItemDto
        {
            Id = j.Id,
            Title = j.Title,
            JobType = j.JobType.ToString(),
            Status = j.Status.ToString(),
            CompanyName = j.CompanyName,
            Department = j.Department,
            MatchScore = j.AiAnalysis?.MatchScore,
            CreatedAt = j.CreatedAt,
            UpdatedAt = j.UpdatedAt
        }).ToList();

        Response.Headers["X-Total-Count"] = total.ToString();
        Response.Headers["X-Page-Number"] = pageNumber.ToString();
        Response.Headers["X-Page-Size"] = pageSize.ToString();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobDetailDto>> GetJob(int id)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == id && j.UserId == userId)
            .Include(j => j.AiAnalysis)
            .Include(j => j.ApplicationAssets)
            .Include(j => j.InterviewQuestions)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound();

        var dto = new JobDetailDto
        {
            Id = job.Id,
            Title = job.Title,
            JobType = job.JobType.ToString(),
            Status = job.Status.ToString(),
            Description = job.Description,
            CompanyName = job.CompanyName,
            Department = job.Department,
            Classification = job.Classification,
            JcNumber = job.JcNumber,
            ExamType = job.ExamType,
            SoqRequired = job.SoqRequired,
            TeamName = job.TeamName,
            JobBoard = job.JobBoard,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            ParsedSummary = job.ParsedSummary,
            KeyResponsibilities = job.KeyResponsibilities,
            ExtractedSkills = job.ExtractedSkills,
            KsaPatterns = job.KsaPatterns,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt,
            AiAnalysis = job.AiAnalysis != null ? new JobAiAnalysisDto
            {
                Id = job.AiAnalysis.Id,
                MatchScore = job.AiAnalysis.MatchScore,
                StrengthsSummary = job.AiAnalysis.StrengthsSummary,
                GapsSummary = job.AiAnalysis.GapsSummary,
                RecommendedHighlights = job.AiAnalysis.RecommendedHighlights,
                SkillGapsAndIdeas = job.AiAnalysis.SkillGapsAndIdeas,
                CreatedAt = job.AiAnalysis.CreatedAt,
                UpdatedAt = job.AiAnalysis.UpdatedAt
            } : null,
            Assets = job.ApplicationAssets.Select(a => new ApplicationAssetDto
            {
                Id = a.Id,
                Type = a.Type.ToString(),
                Title = a.Title,
                Content = a.Content,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            }).ToList(),
            InterviewQuestionsCount = job.InterviewQuestions.Count
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<JobDetailDto>> CreateJob([FromBody] JobCreateUpdateDto createDto)
    {
        var userId = GetUserId();

        if (!Enum.TryParse<JobType>(createDto.JobType, true, out var jobType))
            return BadRequest("Invalid JobType. Must be 'State' or 'Private'");

        if (!Enum.TryParse<JobStatus>(createDto.Status, true, out var status))
            return BadRequest("Invalid Status. Must be 'Planned', 'Applied', 'Interview', 'Offer', or 'Rejected'");

        var job = new Job
        {
            UserId = userId,
            Title = createDto.Title,
            JobType = jobType,
            Status = status,
            Description = createDto.Description ?? string.Empty,
            CompanyName = createDto.CompanyName ?? string.Empty,
            Department = createDto.Department ?? string.Empty,
            Classification = createDto.Classification,
            JcNumber = createDto.JcNumber,
            ExamType = createDto.ExamType,
            SoqRequired = createDto.SoqRequired,
            TeamName = createDto.TeamName,
            JobBoard = createDto.JobBoard,
            SalaryMin = createDto.SalaryMin,
            SalaryMax = createDto.SalaryMax
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Job {JobId} created by user {UserId}: {JobTitle}", job.Id, userId, job.Title);

        var dto = new JobDetailDto
        {
            Id = job.Id,
            Title = job.Title,
            JobType = job.JobType.ToString(),
            Status = job.Status.ToString(),
            Description = job.Description,
            CompanyName = job.CompanyName,
            Department = job.Department,
            Classification = job.Classification,
            JcNumber = job.JcNumber,
            ExamType = job.ExamType,
            SoqRequired = job.SoqRequired,
            TeamName = job.TeamName,
            JobBoard = job.JobBoard,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt,
            Assets = new List<ApplicationAssetDto>(),
            InterviewQuestionsCount = 0
        };

        return CreatedAtAction(nameof(GetJob), new { id = job.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateJob(int id, [FromBody] JobCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (job == null)
            return NotFound();

        if (!Enum.TryParse<JobStatus>(updateDto.Status, true, out var status))
            return BadRequest("Invalid Status");

        job.Title = updateDto.Title;
        job.Status = status;
        job.Description = updateDto.Description ?? string.Empty;
        job.CompanyName = updateDto.CompanyName ?? string.Empty;
        job.Department = updateDto.Department ?? string.Empty;
        job.Classification = updateDto.Classification;
        job.JcNumber = updateDto.JcNumber;
        job.ExamType = updateDto.ExamType;
        job.SoqRequired = updateDto.SoqRequired;
        job.TeamName = updateDto.TeamName;
        job.JobBoard = updateDto.JobBoard;
        job.SalaryMin = updateDto.SalaryMin;
        job.SalaryMax = updateDto.SalaryMax;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Job {JobId} updated by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (job == null)
            return NotFound();

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Job {JobId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpPost("{id}/parse")]
    public async Task<IActionResult> ParseJobDescription(int id, [FromBody] ParseJobRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (job == null)
            return NotFound();

        if (string.IsNullOrEmpty(request.JobDescription))
            return BadRequest("Job description is required");

        job.Description = request.JobDescription;

        // Placeholder parsing (AI service would do this)
        job.ParsedSummary = request.JobDescription.Substring(0, Math.Min(200, request.JobDescription.Length)) + "...";
        job.KeyResponsibilities = "Extracted from AI analysis";
        job.ExtractedSkills = "AI, Communication, Problem Solving";

        await _context.SaveChangesAsync();
        _logger.LogInformation("Job {JobId} parsed by user {UserId}", id, userId);

        return NoContent();
    }
}

public class ParseJobRequest
{
    public string JobDescription { get; set; } = string.Empty;
}

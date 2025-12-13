using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/share")]
[Authorize]
public class ShareController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ShareController> _logger;

    public ShareController(AppDbContext context, ILogger<ShareController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    [HttpPost("job/{jobId}")]
    public async Task<ActionResult<SharedLinkDto>> CreateJobShareLink(int jobId, [FromBody] CreateShareLinkRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);

        if (job == null)
            return NotFound("Job not found");

        var token = Guid.NewGuid().ToString("N").Substring(0, 16).ToLower();
        var expiresAt = request.ExpiresInDays.HasValue
            ? DateTime.UtcNow.AddDays(request.ExpiresInDays.Value)
            : (DateTime?)null;

        var link = new SharedLink
        {
            UserId = userId,
            Token = token,
            Type = "job_packet",
            JobId = jobId,
            IsActive = true,
            ExpiresAt = expiresAt
        };

        _context.SharedLinks.Add(link);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Job share link created: {Token} for job {JobId} by user {UserId}",
            token, jobId, userId);

        var dto = new SharedLinkDto
        {
            Token = token,
            Type = "job_packet",
            JobId = jobId,
            IsActive = true,
            CreatedAt = link.CreatedAt,
            ExpiresAt = expiresAt,
            Url = $"/public/job/{token}"
        };

        return Ok(dto);
    }

    [HttpPost("profile")]
    public async Task<ActionResult<SharedLinkDto>> CreateProfileShareLink([FromBody] CreateShareLinkRequest request)
    {
        var userId = GetUserId();

        var token = Guid.NewGuid().ToString("N").Substring(0, 16).ToLower();
        var expiresAt = request.ExpiresInDays.HasValue
            ? DateTime.UtcNow.AddDays(request.ExpiresInDays.Value)
            : (DateTime?)null;

        var link = new SharedLink
        {
            UserId = userId,
            Token = token,
            Type = "profile",
            IsActive = true,
            ExpiresAt = expiresAt
        };

        _context.SharedLinks.Add(link);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Profile share link created: {Token} by user {UserId}",
            token, userId);

        var dto = new SharedLinkDto
        {
            Token = token,
            Type = "profile",
            IsActive = true,
            CreatedAt = link.CreatedAt,
            ExpiresAt = expiresAt,
            Url = $"/public/profile/{token}"
        };

        return Ok(dto);
    }

    [HttpGet("links")]
    public async Task<ActionResult<List<SharedLinkDto>>> GetMyShareLinks()
    {
        var userId = GetUserId();

        var links = await _context.SharedLinks
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        var dtos = links.Select(l => new SharedLinkDto
        {
            Token = l.Token,
            Type = l.Type,
            JobId = l.JobId,
            IsActive = l.IsActive,
            CreatedAt = l.CreatedAt,
            ExpiresAt = l.ExpiresAt,
            Url = l.Type == "job_packet" ? $"/public/job/{l.Token}" : $"/public/profile/{l.Token}"
        }).ToList();

        return Ok(dtos);
    }

    [HttpPut("links/{token}")]
    public async Task<IActionResult> UpdateShareLink(string token, [FromBody] UpdateShareLinkRequest request)
    {
        var userId = GetUserId();

        var link = await _context.SharedLinks
            .FirstOrDefaultAsync(l => l.Token == token && l.UserId == userId);

        if (link == null)
            return NotFound();

        link.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Share link {Token} updated by user {UserId}", token, userId);

        return NoContent();
    }

    [HttpDelete("links/{token}")]
    public async Task<IActionResult> DeleteShareLink(string token)
    {
        var userId = GetUserId();

        var link = await _context.SharedLinks
            .FirstOrDefaultAsync(l => l.Token == token && l.UserId == userId);

        if (link == null)
            return NotFound();

        _context.SharedLinks.Remove(link);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Share link {Token} deleted by user {UserId}", token, userId);

        return NoContent();
    }

    // Public endpoints (no auth required)
    [AllowAnonymous]
    [HttpGet("public/job/{token}")]
    public async Task<IActionResult> GetPublicJobPacket(string token)
    {
        var link = await _context.SharedLinks
            .Where(l => l.Token == token && l.Type == "job_packet" && l.IsActive)
            .Include(l => l.Job)
            .ThenInclude(j => j!.AiAnalysis)
            .Include(l => l.Job)
            .ThenInclude(j => j!.ApplicationAssets)
            .FirstOrDefaultAsync();

        if (link == null)
            return NotFound();

        if (link.ExpiresAt.HasValue && link.ExpiresAt < DateTime.UtcNow)
            return StatusCode(410, "This link has expired");

        var job = link.Job;
        if (job == null)
            return NotFound();

        var dto = new
        {
            job.Id,
            job.Title,
            JobType = job.JobType.ToString(),
            job.Description,
            job.CompanyName,
            job.Department,
            job.Classification,
            job.SalaryMin,
            job.SalaryMax,
            Analysis = job.AiAnalysis != null ? new
            {
                job.AiAnalysis.MatchScore,
                job.AiAnalysis.StrengthsSummary,
                job.AiAnalysis.GapsSummary,
                job.AiAnalysis.RecommendedHighlights
            } : null,
            Assets = job.ApplicationAssets.Select(a => new
            {
                a.Id,
                Type = a.Type.ToString(),
                a.Title,
                a.Content
            }).ToList(),
            ExpiresAt = link.ExpiresAt,
            SharedAt = link.CreatedAt
        };

        return Ok(dto);
    }

    [AllowAnonymous]
    [HttpGet("public/profile/{token}")]
    public async Task<IActionResult> GetPublicProfile(string token)
    {
        var link = await _context.SharedLinks
            .Where(l => l.Token == token && l.Type == "profile" && l.IsActive)
            .Include(l => l.User)
            .FirstOrDefaultAsync();

        if (link == null)
            return NotFound();

        if (link.ExpiresAt.HasValue && link.ExpiresAt < DateTime.UtcNow)
            return StatusCode(410, "This link has expired");

        var userId = link.UserId;

        var experiences = await _context.Experiences
            .Where(e => e.UserId == userId)
            .Include(e => e.ExperienceSkills)
            .ThenInclude(es => es.Skill)
            .OrderByDescending(e => e.EndDate)
            .ToListAsync();

        var projects = await _context.Projects
            .Where(p => p.UserId == userId)
            .Include(p => p.ProjectSkills)
            .ThenInclude(ps => ps.Skill)
            .OrderByDescending(p => p.EndDate)
            .ToListAsync();

        var skills = await _context.Skills
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .ToListAsync();

        var dto = new
        {
            User = new { link.User!.Name, link.User.Email },
            Experiences = experiences.Select(e => new
            {
                e.Title,
                e.Organization,
                e.Location,
                e.StartDate,
                e.EndDate,
                e.Summary,
                Skills = e.ExperienceSkills.Select(es => es.Skill.Name).ToList()
            }).ToList(),
            Projects = projects.Select(p => new
            {
                p.Name,
                p.Role,
                p.Description,
                p.TechStack,
                p.StartDate,
                p.EndDate,
                Skills = p.ProjectSkills.Select(ps => ps.Skill.Name).ToList()
            }).ToList(),
            Skills = skills.Select(s => new
            {
                s.Name,
                s.Category,
                s.Level,
                s.YearsOfExperience
            }).ToList(),
            ExpiresAt = link.ExpiresAt,
            SharedAt = link.CreatedAt
        };

        return Ok(dto);
    }
}

public class CreateShareLinkRequest
{
    public int? ExpiresInDays { get; set; }
}

public class UpdateShareLinkRequest
{
    public bool IsActive { get; set; }
}

public class SharedLinkDto
{
    public string Token { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int? JobId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Url { get; set; } = string.Empty;
}

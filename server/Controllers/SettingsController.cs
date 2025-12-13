using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(AppDbContext context, ILogger<SettingsController> logger)
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

    [HttpGet("profile")]
    public async Task<ActionResult<UserSettingsDto>> GetProfileSettings()
    {
        var userId = GetUserId();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        var dto = new UserSettingsDto
        {
            Id = user.Id,
            Name = user.Name ?? string.Empty,
            Email = user.Email ?? string.Empty,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfileSettings([FromBody] UpdateUserSettingsRequest request)
    {
        var userId = GetUserId();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        if (!string.IsNullOrEmpty(request.Name))
            user.Name = request.Name;

        await _context.SaveChangesAsync();
        _logger.LogInformation("User profile settings updated for user {UserId}", userId);

        return NoContent();
    }

    [HttpGet("ai-settings")]
    public ActionResult<AiSettingsDto> GetAiSettings()
    {
        var userId = GetUserId();
        
        // Placeholder for future AI settings storage
        // For now, return a basic response indicating that settings should be stored client-side
        var dto = new AiSettingsDto
        {
            UserId = userId,
            ApiKeyConfigured = false,
            Message = "AI API keys are managed client-side. Configure in the AI settings page.",
            SupportedProviders = new List<string>
            {
                "OpenAI",
                "Claude",
                "Google Gemini",
                "Local (Ollama)"
            }
        };

        return Ok(dto);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats()
    {
        var userId = GetUserId();

        var jobsCount = await _context.Jobs
            .CountAsync(j => j.UserId == userId);

        var jobsByStatus = await _context.Jobs
            .Where(j => j.UserId == userId)
            .GroupBy(j => j.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var experiencesCount = await _context.Experiences
            .CountAsync(e => e.UserId == userId);

        var projectsCount = await _context.Projects
            .CountAsync(p => p.UserId == userId);

        var skillsCount = await _context.Skills
            .CountAsync(s => s.UserId == userId);

        var storiesCount = await _context.Stories
            .CountAsync(s => s.UserId == userId);

        var interviewQuestionsCount = await _context.InterviewQuestions
            .Join(_context.Jobs.Where(j => j.UserId == userId),
                q => q.JobId,
                j => j.Id,
                (q, j) => q)
            .CountAsync();

        var templatesCount = await _context.ResumeTemplates
            .CountAsync(t => t.UserId == userId);

        var dto = new UserStatsDto
        {
            JobsCount = jobsCount,
            JobsByStatus = jobsByStatus.ToDictionary(x => x.Status, x => x.Count),
            ExperiencesCount = experiencesCount,
            ProjectsCount = projectsCount,
            SkillsCount = skillsCount,
            StoriesCount = storiesCount,
            InterviewQuestionsCount = interviewQuestionsCount,
            TemplatesCount = templatesCount
        };

        return Ok(dto);
    }

    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = GetUserId();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        // Cascade delete: All user data will be deleted due to foreign key constraints
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        _logger.LogWarning("User account {UserId} has been deleted", userId);

        return NoContent();
    }
}

public class UserSettingsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateUserSettingsRequest
{
    public string? Name { get; set; }
}

public class AiSettingsDto
{
    public int UserId { get; set; }
    public bool ApiKeyConfigured { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> SupportedProviders { get; set; } = new();
}

public class UserStatsDto
{
    public int JobsCount { get; set; }
    public Dictionary<string, int> JobsByStatus { get; set; } = new();
    public int ExperiencesCount { get; set; }
    public int ProjectsCount { get; set; }
    public int SkillsCount { get; set; }
    public int StoriesCount { get; set; }
    public int InterviewQuestionsCount { get; set; }
    public int TemplatesCount { get; set; }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/jobs/{jobId}/interview-prep")]
[Authorize]
public class InterviewPrepController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAiService _aiService;
    private readonly IProfileService _profileService;
    private readonly ILogger<InterviewPrepController> _logger;

    public InterviewPrepController(
        AppDbContext context,
        IAiService aiService,
        IProfileService profileService,
        ILogger<InterviewPrepController> logger)
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

    [HttpGet("questions")]
    public async Task<ActionResult<List<InterviewQuestionDto>>> GetQuestions(int jobId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var questions = await _context.InterviewQuestions
            .Where(q => q.JobId == jobId)
            .Include(q => q.Stories)
            .ThenInclude(iqs => iqs.Story)
            .OrderBy(q => q.OrderIndex)
            .ToListAsync();

        var dtos = questions.Select(q => new InterviewQuestionDto
        {
            Id = q.Id,
            QuestionText = q.QuestionText,
            Category = q.Category.ToString(),
            SourceType = q.SourceType.ToString(),
            Difficulty = q.Difficulty,
            NeedsPractice = q.NeedsPractice,
            OrderIndex = q.OrderIndex,
            Stories = q.Stories
                .OrderByDescending(iqs => iqs.IsPrimary)
                .Select(iqs => new InterviewQuestionStoryDto
                {
                    StoryId = iqs.StoryId,
                    StoryTitle = iqs.Story.Competency,
                    IsPrimary = iqs.IsPrimary
                }).ToList()
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("questions/{questionId}")]
    public async Task<ActionResult<InterviewQuestionDto>> GetQuestion(int jobId, int questionId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var question = await _context.InterviewQuestions
            .Where(q => q.Id == questionId && q.JobId == jobId)
            .Include(q => q.Stories)
            .ThenInclude(iqs => iqs.Story)
            .FirstOrDefaultAsync();

        if (question == null)
            return NotFound("Question not found");

        var dto = new InterviewQuestionDto
        {
            Id = question.Id,
            QuestionText = question.QuestionText,
            Category = question.Category.ToString(),
            SourceType = question.SourceType.ToString(),
            Difficulty = question.Difficulty,
            NeedsPractice = question.NeedsPractice,
            OrderIndex = question.OrderIndex,
            Stories = question.Stories
                .OrderByDescending(iqs => iqs.IsPrimary)
                .Select(iqs => new InterviewQuestionStoryDto
                {
                    StoryId = iqs.StoryId,
                    StoryTitle = iqs.Story.Competency,
                    IsPrimary = iqs.IsPrimary
                }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("questions")]
    public async Task<ActionResult<InterviewQuestionDto>> CreateQuestion(
        int jobId,
        [FromBody] CreateInterviewQuestionRequest createDto)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (!Enum.TryParse<InterviewQuestionCategory>(createDto.Category, true, out var category))
            return BadRequest("Invalid category");

        if (!Enum.TryParse<InterviewQuestionSourceType>(createDto.SourceType, true, out var sourceType))
            return BadRequest("Invalid source type");

        var question = new InterviewQuestion
        {
            JobId = jobId,
            QuestionText = createDto.QuestionText,
            Category = category,
            SourceType = sourceType,
            Difficulty = createDto.Difficulty ?? 3,
            NeedsPractice = createDto.NeedsPractice ?? false,
            OrderIndex = createDto.OrderIndex ?? 0
        };

        _context.InterviewQuestions.Add(question);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Interview question {QuestionId} created for job {JobId} by user {UserId}",
            question.Id, jobId, userId);

        var dto = new InterviewQuestionDto
        {
            Id = question.Id,
            QuestionText = question.QuestionText,
            Category = question.Category.ToString(),
            SourceType = question.SourceType.ToString(),
            Difficulty = question.Difficulty,
            NeedsPractice = question.NeedsPractice,
            OrderIndex = question.OrderIndex,
            Stories = new List<InterviewQuestionStoryDto>()
        };

        return CreatedAtAction(nameof(GetQuestion), new { jobId, questionId = question.Id }, dto);
    }

    [HttpPut("questions/{questionId}")]
    public async Task<IActionResult> UpdateQuestion(
        int jobId,
        int questionId,
        [FromBody] InterviewQuestionUpdateDto updateDto)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var question = await _context.InterviewQuestions
            .FirstOrDefaultAsync(q => q.Id == questionId && q.JobId == jobId);

        if (question == null)
            return NotFound("Question not found");

        question.QuestionText = updateDto.QuestionText ?? question.QuestionText;
        question.Difficulty = updateDto.Difficulty ?? question.Difficulty;
        question.NeedsPractice = updateDto.NeedsPractice ?? question.NeedsPractice;
        question.OrderIndex = updateDto.OrderIndex ?? question.OrderIndex;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Question {QuestionId} updated by user {UserId}", questionId, userId);

        return NoContent();
    }

    [HttpDelete("questions/{questionId}")]
    public async Task<IActionResult> DeleteQuestion(int jobId, int questionId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var question = await _context.InterviewQuestions
            .FirstOrDefaultAsync(q => q.Id == questionId && q.JobId == jobId);

        if (question == null)
            return NotFound("Question not found");

        _context.InterviewQuestions.Remove(question);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Question {QuestionId} deleted by user {UserId}", questionId, userId);

        return NoContent();
    }

    [HttpPost("questions/{questionId}/stories/{storyId}")]
    public async Task<IActionResult> LinkStoryToQuestion(int jobId, int questionId, int storyId, [FromBody] LinkStoryRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var question = await _context.InterviewQuestions
            .FirstOrDefaultAsync(q => q.Id == questionId && q.JobId == jobId);

        if (question == null)
            return NotFound("Question not found");

        var story = await _context.Stories
            .FirstOrDefaultAsync(s => s.Id == storyId && s.UserId == userId);

        if (story == null)
            return NotFound("Story not found");

        var existingLink = await _context.InterviewQuestionStories
            .FirstOrDefaultAsync(iqs => iqs.InterviewQuestionId == questionId && iqs.StoryId == storyId);

        if (existingLink != null)
            return BadRequest("Story already linked to question");

        // If this is the primary story, unset other primary stories
        if (request.IsPrimary)
        {
            var otherPrimary = await _context.InterviewQuestionStories
                .FirstOrDefaultAsync(iqs => iqs.InterviewQuestionId == questionId && iqs.IsPrimary);
            if (otherPrimary != null)
                otherPrimary.IsPrimary = false;
        }

        _context.InterviewQuestionStories.Add(new InterviewQuestionStory
        {
            InterviewQuestionId = questionId,
            StoryId = storyId,
            IsPrimary = request.IsPrimary
        });

        await _context.SaveChangesAsync();
        _logger.LogInformation("Story {StoryId} linked to question {QuestionId} by user {UserId}", storyId, questionId, userId);

        return NoContent();
    }

    [HttpDelete("questions/{questionId}/stories/{storyId}")]
    public async Task<IActionResult> UnlinkStoryFromQuestion(int jobId, int questionId, int storyId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var link = await _context.InterviewQuestionStories
            .FirstOrDefaultAsync(iqs => iqs.InterviewQuestionId == questionId && iqs.StoryId == storyId);

        if (link == null)
            return NotFound("Link not found");

        _context.InterviewQuestionStories.Remove(link);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Story {StoryId} unlinked from question {QuestionId} by user {UserId}", storyId, questionId, userId);

        return NoContent();
    }

    [HttpPost("generate-duty-statements")]
    public async Task<ActionResult<GeneratedQuestionsResult>> GenerateDutyStatementQuestions(
        int jobId,
        [FromBody] GenerateQuestionsRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (string.IsNullOrEmpty(job.Description))
            return BadRequest("Job description required for question generation");

        try
        {
            var profile = await _profileService.GetProfileSnapshotAsync(userId);

            var generated = await _aiService.GenerateDutyStatementQuestionsAsync(
                profile,
                job,
                request.ApiKey ?? string.Empty);

            var questions = new List<InterviewQuestion>();
            int orderIndex = 0;

            foreach (var gen in generated)
            {
                var question = new InterviewQuestion
                {
                    JobId = jobId,
                    QuestionText = gen.Text,
                    Category = Enum.Parse<InterviewQuestionCategory>(gen.Category),
                    SourceType = InterviewQuestionSourceType.DutyStatement,
                    Difficulty = gen.Difficulty,
                    OrderIndex = orderIndex++
                };

                _context.InterviewQuestions.Add(question);
                questions.Add(question);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Generated {Count} duty statement questions for job {JobId} by user {UserId}",
                questions.Count, jobId, userId);

            var dtos = questions.Select(q => new InterviewQuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                Category = q.Category.ToString(),
                SourceType = q.SourceType.ToString(),
                Difficulty = q.Difficulty,
                NeedsPractice = q.NeedsPractice,
                OrderIndex = q.OrderIndex,
                Stories = new List<InterviewQuestionStoryDto>()
            }).ToList();

            return Ok(new GeneratedQuestionsResult { Questions = dtos, Count = dtos.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Question generation failed for job {JobId}", jobId);
            return StatusCode(500, new { error = "Generation failed", message = ex.Message });
        }
    }

    [HttpPost("generate-internet-patterns")]
    public async Task<ActionResult<GeneratedQuestionsResult>> GenerateInternetPatternQuestions(
        int jobId,
        [FromBody] GenerateQuestionsRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (string.IsNullOrEmpty(job.Description))
            return BadRequest("Job description required for question generation");

        try
        {
            var profile = await _profileService.GetProfileSnapshotAsync(userId);

            var generated = await _aiService.GenerateInternetPatternQuestionsAsync(
                profile,
                job,
                request.ApiKey ?? string.Empty);

            var questions = new List<InterviewQuestion>();
            int orderIndex = await _context.InterviewQuestions
                .Where(q => q.JobId == jobId)
                .MaxAsync(q => (int?)q.OrderIndex) ?? -1;
            orderIndex++;

            foreach (var gen in generated)
            {
                var question = new InterviewQuestion
                {
                    JobId = jobId,
                    QuestionText = gen.Text,
                    Category = Enum.Parse<InterviewQuestionCategory>(gen.Category),
                    SourceType = InterviewQuestionSourceType.Internet,
                    Difficulty = gen.Difficulty,
                    OrderIndex = orderIndex++
                };

                _context.InterviewQuestions.Add(question);
                questions.Add(question);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Generated {Count} internet pattern questions for job {JobId} by user {UserId}",
                questions.Count, jobId, userId);

            var dtos = questions.Select(q => new InterviewQuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                Category = q.Category.ToString(),
                SourceType = q.SourceType.ToString(),
                Difficulty = q.Difficulty,
                NeedsPractice = q.NeedsPractice,
                OrderIndex = q.OrderIndex,
                Stories = new List<InterviewQuestionStoryDto>()
            }).ToList();

            return Ok(new GeneratedQuestionsResult { Questions = dtos, Count = dtos.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Internet pattern question generation failed for job {JobId}", jobId);
            return StatusCode(500, new { error = "Generation failed", message = ex.Message });
        }
    }
}

public class CreateInterviewQuestionRequest
{
    public string QuestionText { get; set; } = string.Empty;
    public string Category { get; set; } = "Behavioral";
    public string SourceType { get; set; } = "DutyStatement";
    public int? Difficulty { get; set; }
    public bool? NeedsPractice { get; set; }
    public int? OrderIndex { get; set; }
}

public class InterviewQuestionUpdateDto
{
    public string? QuestionText { get; set; }
    public int? Difficulty { get; set; }
    public bool? NeedsPractice { get; set; }
    public int? OrderIndex { get; set; }
}

public class LinkStoryRequest
{
    public bool IsPrimary { get; set; } = false;
}

public class GenerateQuestionsRequest
{
    public string? ApiKey { get; set; }
}

public class GeneratedQuestionsResult
{
    public List<InterviewQuestionDto> Questions { get; set; } = new();
    public int Count { get; set; }
}

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
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(AppDbContext context, ILogger<ProfileController> logger)
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

    // EXPERIENCES
    [HttpGet("experiences")]
    public async Task<ActionResult<List<ExperienceDto>>> GetExperiences()
    {
        var userId = GetUserId();
        var experiences = await _context.Experiences
            .Where(e => e.UserId == userId)
            .Include(e => e.ExperienceSkills)
            .ThenInclude(es => es.Skill)
            .OrderByDescending(e => e.EndDate)
            .ToListAsync();

        var dtos = experiences.Select(e => new ExperienceDto
        {
            Id = e.Id,
            Title = e.Title,
            Organization = e.Organization,
            Location = e.Location,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            IsCurrent = e.IsCurrent,
            Summary = e.Summary,
            BulletPoints = e.BulletPoints,
            Technologies = e.Technologies,
            Skills = e.ExperienceSkills.Select(es => new SkillDto
            {
                Id = es.Skill.Id,
                Name = es.Skill.Name,
                Category = es.Skill.Category,
                Level = es.Skill.Level,
                YearsOfExperience = es.Skill.YearsOfExperience
            }).ToList()
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("experiences/{id}")]
    public async Task<ActionResult<ExperienceDto>> GetExperience(int id)
    {
        var userId = GetUserId();
        var experience = await _context.Experiences
            .Where(e => e.Id == id && e.UserId == userId)
            .Include(e => e.ExperienceSkills)
            .ThenInclude(es => es.Skill)
            .FirstOrDefaultAsync();

        if (experience == null)
            return NotFound();

        var dto = new ExperienceDto
        {
            Id = experience.Id,
            Title = experience.Title,
            Organization = experience.Organization,
            Location = experience.Location,
            StartDate = experience.StartDate,
            EndDate = experience.EndDate,
            IsCurrent = experience.IsCurrent,
            Summary = experience.Summary,
            BulletPoints = experience.BulletPoints,
            Technologies = experience.Technologies,
            Skills = experience.ExperienceSkills.Select(es => new SkillDto
            {
                Id = es.Skill.Id,
                Name = es.Skill.Name,
                Category = es.Skill.Category,
                Level = es.Skill.Level,
                YearsOfExperience = es.Skill.YearsOfExperience
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("experiences")]
    public async Task<ActionResult<ExperienceDto>> CreateExperience([FromBody] ExperienceCreateUpdateDto createDto)
    {
        var userId = GetUserId();

        var experience = new Experience
        {
            UserId = userId,
            Title = createDto.Title,
            Organization = createDto.Organization,
            Location = createDto.Location,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            IsCurrent = createDto.IsCurrent,
            Summary = createDto.Summary,
            BulletPoints = createDto.BulletPoints,
            Technologies = createDto.Technologies
        };

        _context.Experiences.Add(experience);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Experience {ExperienceId} created by user {UserId}", experience.Id, userId);

        var dto = new ExperienceDto
        {
            Id = experience.Id,
            Title = experience.Title,
            Organization = experience.Organization,
            Location = experience.Location,
            StartDate = experience.StartDate,
            EndDate = experience.EndDate,
            IsCurrent = experience.IsCurrent,
            Summary = experience.Summary,
            BulletPoints = experience.BulletPoints,
            Technologies = experience.Technologies,
            Skills = new List<SkillDto>()
        };

        return CreatedAtAction(nameof(GetExperience), new { id = experience.Id }, dto);
    }

    [HttpPut("experiences/{id}")]
    public async Task<IActionResult> UpdateExperience(int id, [FromBody] ExperienceCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var experience = await _context.Experiences
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (experience == null)
            return NotFound();

        experience.Title = updateDto.Title;
        experience.Organization = updateDto.Organization;
        experience.Location = updateDto.Location;
        experience.StartDate = updateDto.StartDate;
        experience.EndDate = updateDto.EndDate;
        experience.IsCurrent = updateDto.IsCurrent;
        experience.Summary = updateDto.Summary;
        experience.BulletPoints = updateDto.BulletPoints;
        experience.Technologies = updateDto.Technologies;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Experience {ExperienceId} updated by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpDelete("experiences/{id}")]
    public async Task<IActionResult> DeleteExperience(int id)
    {
        var userId = GetUserId();
        var experience = await _context.Experiences
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (experience == null)
            return NotFound();

        _context.Experiences.Remove(experience);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Experience {ExperienceId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpPost("experiences/{id}/skills/{skillId}")]
    public async Task<IActionResult> AddSkillToExperience(int id, int skillId)
    {
        var userId = GetUserId();
        var experience = await _context.Experiences
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (experience == null)
            return NotFound("Experience not found");

        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

        if (skill == null)
            return NotFound("Skill not found");

        var existingLink = await _context.ExperienceSkills
            .FirstOrDefaultAsync(es => es.ExperienceId == id && es.SkillId == skillId);

        if (existingLink != null)
            return BadRequest("Skill already linked to experience");

        _context.ExperienceSkills.Add(new ExperienceSkill { ExperienceId = id, SkillId = skillId });
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("experiences/{id}/skills/{skillId}")]
    public async Task<IActionResult> RemoveSkillFromExperience(int id, int skillId)
    {
        var userId = GetUserId();
        var experience = await _context.Experiences
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (experience == null)
            return NotFound();

        var link = await _context.ExperienceSkills
            .FirstOrDefaultAsync(es => es.ExperienceId == id && es.SkillId == skillId);

        if (link == null)
            return NotFound();

        _context.ExperienceSkills.Remove(link);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PROJECTS
    [HttpGet("projects")]
    public async Task<ActionResult<List<ProjectDto>>> GetProjects()
    {
        var userId = GetUserId();
        var projects = await _context.Projects
            .Where(p => p.UserId == userId)
            .Include(p => p.ProjectSkills)
            .ThenInclude(ps => ps.Skill)
            .OrderByDescending(p => p.EndDate)
            .ToListAsync();

        var dtos = projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Role = p.Role,
            Description = p.Description,
            TechStack = p.TechStack,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            RepositoryUrl = p.RepositoryUrl,
            LiveUrl = p.LiveUrl,
            Skills = p.ProjectSkills.Select(ps => new SkillDto
            {
                Id = ps.Skill.Id,
                Name = ps.Skill.Name,
                Category = ps.Skill.Category,
                Level = ps.Skill.Level,
                YearsOfExperience = ps.Skill.YearsOfExperience
            }).ToList()
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("projects/{id}")]
    public async Task<ActionResult<ProjectDto>> GetProject(int id)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .Where(p => p.Id == id && p.UserId == userId)
            .Include(p => p.ProjectSkills)
            .ThenInclude(ps => ps.Skill)
            .FirstOrDefaultAsync();

        if (project == null)
            return NotFound();

        var dto = new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Role = project.Role,
            Description = project.Description,
            TechStack = project.TechStack,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            RepositoryUrl = project.RepositoryUrl,
            LiveUrl = project.LiveUrl,
            Skills = project.ProjectSkills.Select(ps => new SkillDto
            {
                Id = ps.Skill.Id,
                Name = ps.Skill.Name,
                Category = ps.Skill.Category,
                Level = ps.Skill.Level,
                YearsOfExperience = ps.Skill.YearsOfExperience
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("projects")]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] ProjectCreateUpdateDto createDto)
    {
        var userId = GetUserId();

        var project = new Project
        {
            UserId = userId,
            Name = createDto.Name,
            Role = createDto.Role,
            Description = createDto.Description,
            TechStack = createDto.TechStack,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            RepositoryUrl = createDto.RepositoryUrl,
            LiveUrl = createDto.LiveUrl
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Project {ProjectId} created by user {UserId}", project.Id, userId);

        var dto = new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Role = project.Role,
            Description = project.Description,
            TechStack = project.TechStack,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            RepositoryUrl = project.RepositoryUrl,
            LiveUrl = project.LiveUrl,
            Skills = new List<SkillDto>()
        };

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, dto);
    }

    [HttpPut("projects/{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (project == null)
            return NotFound();

        project.Name = updateDto.Name;
        project.Role = updateDto.Role;
        project.Description = updateDto.Description;
        project.TechStack = updateDto.TechStack;
        project.StartDate = updateDto.StartDate;
        project.EndDate = updateDto.EndDate;
        project.RepositoryUrl = updateDto.RepositoryUrl;
        project.LiveUrl = updateDto.LiveUrl;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Project {ProjectId} updated by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpDelete("projects/{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (project == null)
            return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Project {ProjectId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpPost("projects/{id}/skills/{skillId}")]
    public async Task<IActionResult> AddSkillToProject(int id, int skillId)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (project == null)
            return NotFound("Project not found");

        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

        if (skill == null)
            return NotFound("Skill not found");

        var existingLink = await _context.ProjectSkills
            .FirstOrDefaultAsync(ps => ps.ProjectId == id && ps.SkillId == skillId);

        if (existingLink != null)
            return BadRequest("Skill already linked to project");

        _context.ProjectSkills.Add(new ProjectSkill { ProjectId = id, SkillId = skillId });
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("projects/{id}/skills/{skillId}")]
    public async Task<IActionResult> RemoveSkillFromProject(int id, int skillId)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (project == null)
            return NotFound();

        var link = await _context.ProjectSkills
            .FirstOrDefaultAsync(ps => ps.ProjectId == id && ps.SkillId == skillId);

        if (link == null)
            return NotFound();

        _context.ProjectSkills.Remove(link);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // SKILLS
    [HttpGet("skills")]
    public async Task<ActionResult<List<SkillDto>>> GetSkills()
    {
        var userId = GetUserId();
        var skills = await _context.Skills
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .ToListAsync();

        var dtos = skills.Select(s => new SkillDto
        {
            Id = s.Id,
            Name = s.Name,
            Category = s.Category,
            Level = s.Level,
            YearsOfExperience = s.YearsOfExperience
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("skills")]
    public async Task<ActionResult<SkillDto>> CreateSkill([FromBody] SkillCreateUpdateDto createDto)
    {
        var userId = GetUserId();

        var skill = new Skill
        {
            UserId = userId,
            Name = createDto.Name,
            Category = createDto.Category,
            Level = createDto.Level,
            YearsOfExperience = createDto.YearsOfExperience
        };

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Skill {SkillId} created by user {UserId}", skill.Id, userId);

        var dto = new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Category = skill.Category,
            Level = skill.Level,
            YearsOfExperience = skill.YearsOfExperience
        };

        return CreatedAtAction(nameof(GetSkills), dto);
    }

    [HttpPut("skills/{id}")]
    public async Task<IActionResult> UpdateSkill(int id, [FromBody] SkillCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (skill == null)
            return NotFound();

        skill.Name = updateDto.Name;
        skill.Category = updateDto.Category;
        skill.Level = updateDto.Level;
        skill.YearsOfExperience = updateDto.YearsOfExperience;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Skill {SkillId} updated by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpDelete("skills/{id}")]
    public async Task<IActionResult> DeleteSkill(int id)
    {
        var userId = GetUserId();
        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (skill == null)
            return NotFound();

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Skill {SkillId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    // STORIES (STAR format)
    [HttpGet("stories")]
    public async Task<ActionResult<List<StoryDto>>> GetStories()
    {
        var userId = GetUserId();
        var stories = await _context.Stories
            .Where(s => s.UserId == userId)
            .Include(s => s.StorySkills)
            .ThenInclude(ss => ss.Skill)
            .OrderByDescending(s => s.LastUsedDate)
            .ToListAsync();

        var dtos = stories.Select(s => new StoryDto
        {
            Id = s.Id,
            Situation = s.Situation,
            Task = s.Task,
            Action = s.Action,
            Result = s.Result,
            LinkedExperienceId = s.LinkedExperienceId,
            LinkedProjectId = s.LinkedProjectId,
            Tags = s.Tags,
            Competency = s.Competency,
            PrimarySkills = s.PrimarySkills,
            StrengthRating = s.StrengthRating,
            UsageCount = s.UsageCount,
            LastUsedDate = s.LastUsedDate,
            Skills = s.StorySkills.Select(ss => new SkillDto
            {
                Id = ss.Skill.Id,
                Name = ss.Skill.Name,
                Category = ss.Skill.Category,
                Level = ss.Skill.Level,
                YearsOfExperience = ss.Skill.YearsOfExperience
            }).ToList()
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("stories/{id}")]
    public async Task<ActionResult<StoryDto>> GetStory(int id)
    {
        var userId = GetUserId();
        var story = await _context.Stories
            .Where(s => s.Id == id && s.UserId == userId)
            .Include(s => s.StorySkills)
            .ThenInclude(ss => ss.Skill)
            .FirstOrDefaultAsync();

        if (story == null)
            return NotFound();

        var dto = new StoryDto
        {
            Id = story.Id,
            Situation = story.Situation,
            Task = story.Task,
            Action = story.Action,
            Result = story.Result,
            LinkedExperienceId = story.LinkedExperienceId,
            LinkedProjectId = story.LinkedProjectId,
            Tags = story.Tags,
            Competency = story.Competency,
            PrimarySkills = story.PrimarySkills,
            StrengthRating = story.StrengthRating,
            UsageCount = story.UsageCount,
            LastUsedDate = story.LastUsedDate,
            Skills = story.StorySkills.Select(ss => new SkillDto
            {
                Id = ss.Skill.Id,
                Name = ss.Skill.Name,
                Category = ss.Skill.Category,
                Level = ss.Skill.Level,
                YearsOfExperience = ss.Skill.YearsOfExperience
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("stories")]
    public async Task<ActionResult<StoryDto>> CreateStory([FromBody] StoryCreateUpdateDto createDto)
    {
        var userId = GetUserId();

        var story = new Story
        {
            UserId = userId,
            Situation = createDto.Situation,
            Task = createDto.Task,
            Action = createDto.Action,
            Result = createDto.Result,
            LinkedExperienceId = createDto.LinkedExperienceId,
            LinkedProjectId = createDto.LinkedProjectId,
            Tags = createDto.Tags,
            Competency = createDto.Competency,
            PrimarySkills = createDto.PrimarySkills,
            StrengthRating = createDto.StrengthRating
        };

        _context.Stories.Add(story);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Story {StoryId} created by user {UserId}", story.Id, userId);

        var dto = new StoryDto
        {
            Id = story.Id,
            Situation = story.Situation,
            Task = story.Task,
            Action = story.Action,
            Result = story.Result,
            LinkedExperienceId = story.LinkedExperienceId,
            LinkedProjectId = story.LinkedProjectId,
            Tags = story.Tags,
            Competency = story.Competency,
            PrimarySkills = story.PrimarySkills,
            StrengthRating = story.StrengthRating,
            UsageCount = story.UsageCount,
            LastUsedDate = story.LastUsedDate,
            Skills = new List<SkillDto>()
        };

        return CreatedAtAction(nameof(GetStory), new { id = story.Id }, dto);
    }

    [HttpPut("stories/{id}")]
    public async Task<IActionResult> UpdateStory(int id, [FromBody] StoryCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var story = await _context.Stories
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (story == null)
            return NotFound();

        story.Situation = updateDto.Situation;
        story.Task = updateDto.Task;
        story.Action = updateDto.Action;
        story.Result = updateDto.Result;
        story.LinkedExperienceId = updateDto.LinkedExperienceId;
        story.LinkedProjectId = updateDto.LinkedProjectId;
        story.Tags = updateDto.Tags;
        story.Competency = updateDto.Competency;
        story.PrimarySkills = updateDto.PrimarySkills;
        story.StrengthRating = updateDto.StrengthRating;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Story {StoryId} updated by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpDelete("stories/{id}")]
    public async Task<IActionResult> DeleteStory(int id)
    {
        var userId = GetUserId();
        var story = await _context.Stories
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (story == null)
            return NotFound();

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Story {StoryId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpPost("stories/{id}/skills/{skillId}")]
    public async Task<IActionResult> AddSkillToStory(int id, int skillId)
    {
        var userId = GetUserId();
        var story = await _context.Stories
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (story == null)
            return NotFound("Story not found");

        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == skillId && s.UserId == userId);

        if (skill == null)
            return NotFound("Skill not found");

        var existingLink = await _context.StorySkills
            .FirstOrDefaultAsync(ss => ss.StoryId == id && ss.SkillId == skillId);

        if (existingLink != null)
            return BadRequest("Skill already linked to story");

        _context.StorySkills.Add(new StorySkill { StoryId = id, SkillId = skillId });
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("stories/{id}/skills/{skillId}")]
    public async Task<IActionResult> RemoveSkillFromStory(int id, int skillId)
    {
        var userId = GetUserId();
        var story = await _context.Stories
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (story == null)
            return NotFound();

        var link = await _context.StorySkills
            .FirstOrDefaultAsync(ss => ss.StoryId == id && ss.SkillId == skillId);

        if (link == null)
            return NotFound();

        _context.StorySkills.Remove(link);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // RESUME TEMPLATES
    [HttpGet("templates")]
    public async Task<ActionResult<List<ResumeTemplateDto>>> GetResumeTemplates()
    {
        var userId = GetUserId();
        var templates = await _context.ResumeTemplates
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();

        var dtos = templates.Select(t => new ResumeTemplateDto
        {
            Id = t.Id,
            Name = t.Name,
            Content = t.Content,
            IsDefault = t.IsDefault,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("templates/{id}")]
    public async Task<ActionResult<ResumeTemplateDto>> GetResumeTemplate(int id)
    {
        var userId = GetUserId();
        var template = await _context.ResumeTemplates
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (template == null)
            return NotFound();

        var dto = new ResumeTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Content = template.Content,
            IsDefault = template.IsDefault,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost("templates")]
    public async Task<ActionResult<ResumeTemplateDto>> CreateResumeTemplate([FromBody] ResumeTemplateCreateUpdateDto createDto)
    {
        var userId = GetUserId();

        var template = new ResumeTemplate
        {
            UserId = userId,
            Name = createDto.Name,
            Content = createDto.Content,
            IsDefault = createDto.IsDefault
        };

        if (createDto.IsDefault)
        {
            var currentDefault = await _context.ResumeTemplates
                .FirstOrDefaultAsync(t => t.UserId == userId && t.IsDefault);
            if (currentDefault != null)
                currentDefault.IsDefault = false;
        }

        _context.ResumeTemplates.Add(template);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Resume template {TemplateId} created by user {UserId}", template.Id, userId);

        var dto = new ResumeTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Content = template.Content,
            IsDefault = template.IsDefault,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };

        return CreatedAtAction(nameof(GetResumeTemplate), new { id = template.Id }, dto);
    }

    [HttpPut("templates/{id}")]
    public async Task<IActionResult> UpdateResumeTemplate(int id, [FromBody] ResumeTemplateCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var template = await _context.ResumeTemplates
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (template == null)
            return NotFound();

        template.Name = updateDto.Name;
        template.Content = updateDto.Content;

        if (updateDto.IsDefault && !template.IsDefault)
        {
            var currentDefault = await _context.ResumeTemplates
                .FirstOrDefaultAsync(t => t.UserId == userId && t.IsDefault && t.Id != id);
            if (currentDefault != null)
                currentDefault.IsDefault = false;
        }

        template.IsDefault = updateDto.IsDefault;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Resume template {TemplateId} updated by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpDelete("templates/{id}")]
    public async Task<IActionResult> DeleteResumeTemplate(int id)
    {
        var userId = GetUserId();
        var template = await _context.ResumeTemplates
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (template == null)
            return NotFound();

        _context.ResumeTemplates.Remove(template);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Resume template {TemplateId} deleted by user {UserId}", id, userId);

        return NoContent();
    }
}

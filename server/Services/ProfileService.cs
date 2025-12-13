using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;

namespace server.Services
{
    /// <summary>
    /// Service for working with user profile data.
    /// Provides snapshot generation for AI services.
    /// </summary>
    public interface IProfileService
    {
        Task<ProfileSnapshotDto> GetProfileSnapshotAsync(int userId);
    }

    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProfileService> _logger;

        public ProfileService(AppDbContext context, ILogger<ProfileService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ProfileSnapshotDto> GetProfileSnapshotAsync(int userId)
        {
            _logger.LogInformation($"Generating profile snapshot for user {userId}");

            var user = await _context.Users.FindAsync(userId);
            if (user is null)
            {
                throw new InvalidOperationException($"User {userId} not found");
            }

            // Fetch all profile data in parallel
            var experiences = await _context.Experiences
                .Where(e => e.UserId == userId)
                .Include(e => e.ExperienceSkills)
                .ThenInclude(es => es.Skill)
                .ToListAsync();

            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.ProjectSkills)
                .ThenInclude(ps => ps.Skill)
                .ToListAsync();

            var skills = await _context.Skills
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var stories = await _context.Stories
                .Where(s => s.UserId == userId)
                .Include(s => s.StorySkills)
                .ThenInclude(ss => ss.Skill)
                .ToListAsync();

            return new ProfileSnapshotDto
            {
                UserId = userId,
                Username = user.Username,
                Experiences = experiences.Select(e => new ExperienceSummaryDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Organization = e.Organization,
                    Summary = e.Summary,
                    BulletPoints = e.BulletPoints,
                    Skills = e.ExperienceSkills.Select(es => es.Skill.Name).ToList()
                }).ToList(),
                Projects = projects.Select(p => new ProjectSummaryDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Role = p.Role,
                    Description = p.Description,
                    TechStack = p.TechStack,
                    Skills = p.ProjectSkills.Select(ps => ps.Skill.Name).ToList()
                }).ToList(),
                Skills = skills.Select(s => new SkillSummaryDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Category = s.Category,
                    Level = s.Level
                }).ToList(),
                Stories = stories.Select(s => new StorySummaryDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Competency = s.Competency,
                    StrengthRating = s.StrengthRating,
                    Situation = s.Situation,
                    Task = s.Task,
                    Action = s.Action,
                    Result = s.Result
                }).ToList()
            };
        }
    }
}

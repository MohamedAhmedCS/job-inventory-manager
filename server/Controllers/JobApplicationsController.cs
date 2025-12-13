using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Utils;
using System.Security.Claims;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JobApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<JobApplicationsController> _logger;

        public JobApplicationsController(AppDbContext context, ILogger<JobApplicationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private string GetCurrentUsername()
        {
            return User.FindFirst(ClaimTypes.Name)?.Value ?? "unknown";
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("sub")?.Value 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobApplication>>> GetAll()
        {
            var username = GetCurrentUsername();
            _logger.LogInformation($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] User '{username}' retrieved all job applications");
            // Return empty list for now - this controller is deprecated
            // Use /api/jobs instead for the new Job model with user filtering
            return Ok(new List<JobApplication>());
        }

        [HttpPost]
        public async Task<ActionResult<JobApplication>> Create(JobApplication job)
        {
            var username = GetCurrentUsername();
            try
            {
                _context.JobApplications.Add(job);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] User '{username}' created job application: {job.Title} at {job.Company}");
                return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Error creating job for user '{username}'");
                throw;
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobApplication>> GetById(int id)
        {
            var job = await _context.JobApplications.FindAsync(id);
            if (job is null)
            {
                return NotFound();
            }
            return job;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, JobApplication job)
        {
            var username = GetCurrentUsername();
            if (id != job.Id)
                return BadRequest();

            _context.Entry(job).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] User '{username}' updated job application ID: {id}");
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.JobApplications.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var username = GetCurrentUsername();
            var job = await _context.JobApplications.FindAsync(id);
            if (job is null)
                return NotFound();

            try
            {
                _context.JobApplications.Remove(job);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] User '{username}' deleted job application: {job.Title} (ID: {id})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Error deleting job {id} for user '{username}'");
                throw;
            }
            return NoContent();
        }
    }
}

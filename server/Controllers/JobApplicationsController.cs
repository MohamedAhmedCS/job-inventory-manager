using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JobApplicationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobApplication>>> GetAll() =>
            await _context.JobApplications.ToListAsync();

        [HttpPost]
        public async Task<ActionResult<JobApplication>> Create(JobApplication job)
        {
            _context.JobApplications.Add(job);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobApplication>> GetById(int id)
        {
            var job = await _context.JobApplications.FindAsync(id);
            return job is null ? NotFound() : job;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, JobApplication job)
        {
            if (id != job.Id) return BadRequest();
            _context.Entry(job).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var job = await _context.JobApplications.FindAsync(id);
            if (job is null) return NotFound();
            _context.JobApplications.Remove(job);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

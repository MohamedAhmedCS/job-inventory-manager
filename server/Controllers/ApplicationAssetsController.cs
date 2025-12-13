using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/jobs/{jobId}/assets")]
[Authorize]
public class ApplicationAssetsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAiService _aiService;
    private readonly IProfileService _profileService;
    private readonly ILogger<ApplicationAssetsController> _logger;

    public ApplicationAssetsController(
        AppDbContext context,
        IAiService aiService,
        IProfileService profileService,
        ILogger<ApplicationAssetsController> logger)
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
    public async Task<ActionResult<List<ApplicationAssetDto>>> GetAssets(int jobId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var assets = await _context.ApplicationAssets
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync();

        var dtos = assets.Select(a => new ApplicationAssetDto
        {
            Id = a.Id,
            Type = a.Type.ToString(),
            Title = a.Title,
            Content = a.Content,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{assetId}")]
    public async Task<ActionResult<ApplicationAssetDto>> GetAsset(int jobId, int assetId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var asset = await _context.ApplicationAssets
            .FirstOrDefaultAsync(a => a.Id == assetId && a.JobId == jobId);

        if (asset == null)
            return NotFound("Asset not found");

        var dto = new ApplicationAssetDto
        {
            Id = asset.Id,
            Type = asset.Type.ToString(),
            Title = asset.Title,
            Content = asset.Content,
            CreatedAt = asset.CreatedAt,
            UpdatedAt = asset.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationAssetDto>> CreateAsset(
        int jobId,
        [FromBody] ApplicationAssetCreateUpdateDto createDto)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        if (!Enum.TryParse<ApplicationAssetType>(createDto.Type, true, out var assetType))
            return BadRequest("Invalid asset type. Must be 'Resume', 'Soq', 'CoverLetter', or 'Notes'");

        var asset = new ApplicationAsset
        {
            JobId = jobId,
            Type = assetType,
            Title = createDto.Title,
            Content = createDto.Content
        };

        _context.ApplicationAssets.Add(asset);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Asset {AssetId} ({AssetType}) created for job {JobId} by user {UserId}",
            asset.Id, assetType, jobId, userId);

        var dto = new ApplicationAssetDto
        {
            Id = asset.Id,
            Type = asset.Type.ToString(),
            Title = asset.Title,
            Content = asset.Content,
            CreatedAt = asset.CreatedAt,
            UpdatedAt = asset.UpdatedAt
        };

        return CreatedAtAction(nameof(GetAsset), new { jobId, assetId = asset.Id }, dto);
    }

    [HttpPut("{assetId}")]
    public async Task<IActionResult> UpdateAsset(
        int jobId,
        int assetId,
        [FromBody] ApplicationAssetCreateUpdateDto updateDto)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var asset = await _context.ApplicationAssets
            .FirstOrDefaultAsync(a => a.Id == assetId && a.JobId == jobId);

        if (asset == null)
            return NotFound("Asset not found");

        asset.Title = updateDto.Title;
        asset.Content = updateDto.Content;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Asset {AssetId} updated by user {UserId}", assetId, userId);

        return NoContent();
    }

    [HttpDelete("{assetId}")]
    public async Task<IActionResult> DeleteAsset(int jobId, int assetId)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var asset = await _context.ApplicationAssets
            .FirstOrDefaultAsync(a => a.Id == assetId && a.JobId == jobId);

        if (asset == null)
            return NotFound("Asset not found");

        _context.ApplicationAssets.Remove(asset);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Asset {AssetId} deleted by user {UserId}", assetId, userId);

        return NoContent();
    }

    [HttpPost("{assetId}/generate")]
    public async Task<IActionResult> GenerateAsset(
        int jobId,
        int assetId,
        [FromBody] GenerateAssetRequest request)
    {
        var userId = GetUserId();
        var job = await _context.Jobs
            .Where(j => j.Id == jobId && j.UserId == userId)
            .Include(j => j.ApplicationAssets)
            .FirstOrDefaultAsync();

        if (job == null)
            return NotFound("Job not found");

        var asset = job.ApplicationAssets.FirstOrDefault(a => a.Id == assetId);
        if (asset == null)
            return NotFound("Asset not found");

        if (string.IsNullOrEmpty(job.Description))
            return BadRequest("Job description required for generation");

        try
        {
            var profile = await _profileService.GetProfileSnapshotAsync(userId);

            var generated = await _aiService.GenerateApplicationAssetAsync(
                profile,
                job,
                asset.Type.ToString(),
                request.TemplateContent ?? string.Empty,
                request.ExtraInstructions,
                request.ApiKey ?? string.Empty);

            asset.Content = generated;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Asset {AssetId} generated for job {JobId} by user {UserId}",
                assetId, jobId, userId);

            var dto = new ApplicationAssetDto
            {
                Id = asset.Id,
                Type = asset.Type.ToString(),
                Title = asset.Title,
                Content = asset.Content,
                CreatedAt = asset.CreatedAt,
                UpdatedAt = asset.UpdatedAt
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Asset generation failed for asset {AssetId}", assetId);
            return StatusCode(500, new { error = "Generation failed", message = ex.Message });
        }
    }
}

public class GenerateAssetRequest
{
    public string? TemplateContent { get; set; }
    public string? ExtraInstructions { get; set; }
    public string? ApiKey { get; set; }
}

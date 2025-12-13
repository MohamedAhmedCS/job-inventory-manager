using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using server.Data;
using server.Models;
using server.Utils;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IConfiguration configuration, AppDbContext context, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            _logger.LogWarning($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Login attempt with missing credentials");
            return BadRequest(new { error = "Username and password are required" });
        }

        // Find user in database
        var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);
        
        if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Failed login attempt for user: {request.Username}");
            return Unauthorized(new { error = "Invalid username or password" });
        }

        var token = GenerateJwtToken(user.Id, user.Username);
        _logger.LogInformation($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] User '{user.Username}' logged in successfully");

        return Ok(new { token, expiresIn = 86400 });
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            _logger.LogWarning($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Registration attempt with missing credentials");
            return BadRequest(new { error = "Username and password are required" });
        }

        if (request.Username.Length < 3)
        {
            return BadRequest(new { error = "Username must be at least 3 characters" });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { error = "Password must be at least 6 characters" });
        }

        // Check if user already exists
        if (_context.Users.Any(u => u.Username == request.Username))
        {
            _logger.LogWarning($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Registration attempt with existing username: {request.Username}");
            return BadRequest(new { error = "Username already exists" });
        }

        // Create new user with hashed password
        var user = new User
        {
            Username = request.Username,
            PasswordHash = PasswordHelper.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        var token = GenerateJwtToken(user.Id, user.Username);
        _logger.LogInformation($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] New user registered: {user.Username}");

        return Ok(new { token, expiresIn = 86400, message = "Registration successful" });
    }

    private string GenerateJwtToken(int userId, string username)
    {
        var jwtSecret = _configuration["Jwt:Secret"] ?? "your-secret-key-change-in-production-at-least-32-characters-long";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "job-inventory-manager";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "job-inventory-app";

        var key = Encoding.ASCII.GetBytes(jwtSecret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("sub", userId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, username),
                new Claim(ClaimTypes.Name, username)
            }),
            Expires = DateTime.UtcNow.AddDays(1),
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

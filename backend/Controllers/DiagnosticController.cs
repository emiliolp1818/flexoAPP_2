using Microsoft.AspNetCore.Mvc;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly IConfiguration _configuration;

        public DiagnosticController(FlexoAPPDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var users = await _context.Users.Select(u => new
                {
                    u.Id,
                    u.UserCode,
                    u.FirstName,
                    u.IsActive,
                    HasPassword = !string.IsNullOrEmpty(u.Password)
                }).ToListAsync();

                return Ok(new
                {
                    success = true,
                    userCount,
                    users
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("test-config")]
        public IActionResult TestConfiguration()
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                
                return Ok(new
                {
                    success = true,
                    hasSecretKey = !string.IsNullOrEmpty(jwtSettings["SecretKey"]),
                    hasIssuer = !string.IsNullOrEmpty(jwtSettings["Issuer"]),
                    hasAudience = !string.IsNullOrEmpty(jwtSettings["Audience"]),
                    hasExpirationMinutes = !string.IsNullOrEmpty(jwtSettings["ExpirationMinutes"]),
                    expirationMinutes = jwtSettings["ExpirationMinutes"]
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpPost("test-login")]
        public async Task<IActionResult> TestLogin([FromBody] TestLoginRequest request)
        {
            try
            {
                Console.WriteLine($"[DIAGNOSTIC] Testing login for: {request.UserCode}");
                
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserCode == request.UserCode);

                if (user == null)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "User not found",
                        userCode = request.UserCode
                    });
                }

                var passwordMatch = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

                return Ok(new
                {
                    success = true,
                    userFound = true,
                    userId = user.Id,
                    userCode = user.UserCode,
                    isActive = user.IsActive,
                    passwordMatch,
                    hasPassword = !string.IsNullOrEmpty(user.Password),
                    passwordLength = user.Password?.Length ?? 0
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }

    public class TestLoginRequest
    {
        public string UserCode { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

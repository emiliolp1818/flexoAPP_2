using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user, int? expiryMinutesOverride = null)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                            ?? jwtSettings["SecretKey"]
                            ?? throw new InvalidOperationException("JWT SecretKey not configured");
            if (secretKey.StartsWith("${") || secretKey.Contains("JWT_SECRET_KEY"))
                throw new InvalidOperationException("JWT SecretKey no resuelta: define la variable de entorno JWT_SECRET_KEY");
            var issuer = jwtSettings["Issuer"] ?? "FlexoAPP";
            var audience = jwtSettings["Audience"] ?? "FlexoAPP-Users";
            // Permite emitir un token de vida corta (p.ej. 10 min) cuando el acceso
            // se concede con la contraseña temporal.
            var expiryMinutes = expiryMinutesOverride ?? int.Parse(jwtSettings["ExpirationMinutes"] ?? "1440");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);


            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserCode),
                new Claim("DisplayName", $"{user.FirstName} {user.LastName}".Trim()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("HasProfileImage", (!string.IsNullOrEmpty(user.ProfileImage)).ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                            ?? jwtSettings["SecretKey"]
                            ?? throw new InvalidOperationException("JWT SecretKey not configured");
            if (secretKey.StartsWith("${") || secretKey.Contains("JWT_SECRET_KEY"))
                throw new InvalidOperationException("JWT SecretKey no resuelta: define la variable de entorno JWT_SECRET_KEY");
                var issuer = jwtSettings["Issuer"] ?? "FlexoAPP";
                var audience = jwtSettings["Audience"] ?? "FlexoAPP-Users";

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero
                };

                tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public int? GetUserIdFromToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadJwtToken(token);
                var userIdClaim = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);

                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}
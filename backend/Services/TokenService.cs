using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<LibraryUser> _userManager;
        private readonly ILogger<TokenService> _logger;

        public TokenService(IConfiguration configuration, UserManager<LibraryUser> userManager, ILogger<TokenService> logger)
        {
            _configuration = configuration;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<string> GenerateTokenAsync(LibraryUser user)
        {
            try
            {
                _logger.LogInformation("Generating JWT token for user {UserId} ({UserName})", user.Id, user.UserName);

                var roles = await _userManager.GetRolesAsync(user);
                _logger.LogDebug("Retrieved {RoleCount} roles for user {UserId}: {Roles}",
                    roles.Count, user.Id, string.Join(", ", roles));

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Email, user.Email)
                };
                claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

                _logger.LogDebug("Created {ClaimCount} claims for user {UserId}", claims.Count, user.Id);

                var jwtKey = _configuration["Jwt:Key"] ??
                    throw new InvalidOperationException("JWT Key is not configured");
                var jwtIssuer = _configuration["Jwt:Issuer"] ??
                    throw new InvalidOperationException("JWT Issuer is not configured");

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtIssuer,
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(3),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                _logger.LogInformation("Successfully generated JWT token for user {UserId}, expiring at {ExpiryTime}",
                    user.Id, token.ValidTo);

                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for user {UserId} ({UserName})", user.Id, user.UserName);
                throw;
            }
        }
    }
}
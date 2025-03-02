using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
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

        public TokenService(IConfiguration configuration, UserManager<LibraryUser> userManager)
        {
            _configuration = configuration;
            _userManager = userManager;
        }

        public async Task<string> GenerateTokenAsync(LibraryUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Email, user.Email)
    };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            // Detailed logging
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];

            Console.WriteLine($"[TOKEN GEN] Key: {jwtKey?.Substring(0, 5)}... (length: {jwtKey?.Length})");
            Console.WriteLine($"[TOKEN GEN] Issuer: {jwtIssuer}");

            var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
            Console.WriteLine($"[TOKEN GEN] Key byte length: {keyBytes.Length}");

            var key = new SymmetricSecurityKey(keyBytes);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expiration = DateTime.UtcNow.AddHours(3);
            Console.WriteLine($"[TOKEN GEN] Expiration: {expiration}");

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtIssuer,
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            Console.WriteLine($"[TOKEN GEN] Generated token (first 20 chars): {tokenString.Substring(0, 20)}...");

            return tokenString;
        }
    }
}

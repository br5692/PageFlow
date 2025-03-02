using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration; // Add this
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<LibraryUser> _userManager;
        private readonly SignInManager<LibraryUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration; // Add this field

        public AuthController(
            UserManager<LibraryUser> userManager,
            SignInManager<LibraryUser> signInManager,
            ITokenService tokenService,
            IConfiguration configuration) // Add this parameter
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _configuration = configuration; // Set the field
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var user = new LibraryUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await _userManager.AddToRoleAsync(user, model.Role);
            return Ok(new { message = "Registration successful!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized(new { message = "Invalid credentials" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded) return Unauthorized(new { message = "Invalid credentials" });

            var token = await _tokenService.GenerateTokenAsync(user);
            return Ok(new AuthResponseDto { Token = token });
        }

        [HttpGet("debug-token")]
        public IActionResult DebugToken()
        {
            // Print out the claims for this user
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            if (identity == null || !identity.IsAuthenticated)
            {
                return Unauthorized(new { message = "No authenticated user" });
            }

            var claims = identity.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(new
            {
                IsAuthenticated = true,
                UserName = identity.Name,
                Claims = claims
            });
        }

        [HttpGet("test-token")]
        public IActionResult GetTestToken()
        {
            // Use same key as in appsettings
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                claims: new[] {
            new Claim(ClaimTypes.Name, "testuser@example.com"),
            new Claim(ClaimTypes.Role, "Customer")
                },
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                message = "Use this test token for debugging"
            });
        }

        [HttpGet("check-key")]
        public IActionResult CheckKey()
        {
            var key = _configuration["Jwt:Key"];
            var keyBytes = Encoding.UTF8.GetBytes(key);

            return Ok(new
            {
                KeyLength = key?.Length,
                KeyBytesLength = keyBytes.Length,
                IsAtLeast32Bytes = keyBytes.Length >= 32,
                FirstFewChars = key?.Substring(0, Math.Min(5, key.Length))
            });
        }

        [HttpGet("simple-token")]
        public IActionResult GetSimpleToken()
        {
            try
            {
                var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found");
                var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not found");

                var keyBytes = Encoding.UTF8.GetBytes(key);
                var securityKey = new SymmetricSecurityKey(keyBytes);
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: issuer,
                    claims: new[]
                    {
                new Claim(ClaimTypes.Name, "test@example.com"),
                new Claim(ClaimTypes.Role, "Customer")
                    },
                    expires: DateTime.UtcNow.AddHours(1),
                    signingCredentials: credentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                // Log everything for debugging
                return Ok(new
                {
                    token = tokenString,
                    keyLength = key.Length,
                    keyBytesLength = keyBytes.Length,
                    issuer = issuer
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("validate/{token}")]
        public IActionResult ValidateToken(string token)
        {
            try
            {
                var key = _configuration["Jwt:Key"];
                var issuer = _configuration["Jwt:Issuer"];

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateIssuer = true,
                    ValidIssuer = issuer,
                    ValidateAudience = true,
                    ValidAudience = issuer,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                SecurityToken validatedToken;
                var principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);

                var claims = principal.Claims.Select(c => new { c.Type, c.Value }).ToList();

                return Ok(new
                {
                    isValid = true,
                    claims = claims,
                    expires = (validatedToken as JwtSecurityToken)?.ValidTo
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    isValid = false,
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("direct-token")]
        public IActionResult GetDirectToken()
        {
            var key = _configuration["Jwt:Key"];
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var securityKey = new SymmetricSecurityKey(keyBytes);

            var secToken = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                new Claim[] { new Claim(ClaimTypes.Name, "direct-test") },
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
            );

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenString = tokenHandler.WriteToken(secToken);

            return Ok(new
            {
                token = tokenString,
                keyBytesLength = keyBytes.Length,
                tokenType = "Bearer"
            });
        }
    }
}

using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<LibraryUser> _userManager;
        private readonly SignInManager<LibraryUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<LibraryUser> userManager,
            SignInManager<LibraryUser> signInManager,
            ITokenService tokenService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            _logger.LogInformation("Registration attempt for email: {Email}", model.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for registration: {Email}, Errors: {@Errors}",
                    model.Email, ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }

            var user = new LibraryUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Failed to create user: {Email}, Errors: {@Errors}",
                    model.Email, result.Errors);
                return BadRequest(result.Errors);
            }

            await _userManager.AddToRoleAsync(user, model.Role);
            _logger.LogInformation("User registered successfully: {Email} with role: {Role}",
                model.Email, model.Role);

            return Ok(new { message = "Registration successful!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            _logger.LogInformation("Login attempt for email: {Email}", model.Email);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed - user not found: {Email}", model.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed - invalid password for user: {Email}", model.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var token = await _tokenService.GenerateTokenAsync(user);
            var roles = await _userManager.GetRolesAsync(user);

            _logger.LogInformation("User logged in successfully: {Email}, Role: {Role}",
                user.Email, roles.FirstOrDefault() ?? "No Role");

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                UserId = user.Id,
                UserName = user.UserName,
                Role = roles.FirstOrDefault() ?? string.Empty,
                Expiration = DateTime.UtcNow.AddHours(3)
            });
        }
    }
}
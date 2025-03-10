using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

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

            try
            {
                var user = new LibraryUser { UserName = model.Email, Email = model.Email };
                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    // Log specific error scenarios
                    var errors = result.Errors.Select(e => e.Description);
                    _logger.LogWarning("User creation failed: {Email}, Errors: {@Errors}",
                        model.Email, errors);

                    // Check for specific error scenarios
                    if (errors.Any(e => e.Contains("already taken") || e.Contains("User name")))
                    {
                        return BadRequest(new { message = "User already exists" });
                    }

                    return BadRequest(result.Errors);
                }

                // Add user to role
                var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
                if (!roleResult.Succeeded)
                {
                    _logger.LogWarning("Failed to assign role {Role} to user: {Email}",
                        model.Role, model.Email);
                    return BadRequest(new { message = "Failed to assign user role" });
                }

                _logger.LogInformation("User registered successfully: {Email} with role: {Role}",
                    model.Email, model.Role);

                return Ok(new { message = "Registration successful!" });
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error during user registration: {Message}", ex.Message);
                return StatusCode(503, new { message = "Service unavailable: Database error" });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error during user registration: {Message}", ex.Message);
                return StatusCode(503, new { message = "Error saving user to database" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during user registration for {Email}", model.Email);
                return StatusCode(500, new { message = "An unexpected error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            _logger.LogInformation("Login attempt for email: {Email}", model.Email);

            try
            {
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
                var primaryRole = roles.FirstOrDefault() ?? string.Empty;

                _logger.LogInformation("User logged in successfully: {Email}, Role: {Role}",
                    user.Email, primaryRole);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    UserId = user.Id,
                    UserName = user.UserName,
                    Role = primaryRole,
                    Expiration = DateTime.UtcNow.AddHours(3)
                });
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error during login: {Message}", ex.Message);
                return StatusCode(503, new { message = "Service unavailable: Database error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for {Email}", model.Email);
                return StatusCode(500, new { message = "An unexpected error occurred during login" });
            }
        }
    }
}
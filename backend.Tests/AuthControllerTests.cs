using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<LibraryUser>> _mockUserManager;
        private readonly Mock<SignInManager<LibraryUser>> _mockSignInManager;
        private readonly Mock<ITokenService> _mockTokenService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;

        public AuthControllerTests()
        {
            // Setup UserManager mock
            var userStoreMock = new Mock<IUserStore<LibraryUser>>();
            _mockUserManager = new Mock<UserManager<LibraryUser>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            // Setup SignInManager mock
            var contextAccessorMock = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
            var userPrincipalFactoryMock = new Mock<IUserClaimsPrincipalFactory<LibraryUser>>();
            _mockSignInManager = new Mock<SignInManager<LibraryUser>>(
                _mockUserManager.Object,
                contextAccessorMock.Object,
                userPrincipalFactoryMock.Object,
                null, null, null, null);

            // Setup TokenService mock
            _mockTokenService = new Mock<ITokenService>();

            // Setup Logger mock
            _mockLogger = new Mock<ILogger<AuthController>>();
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var user = new LibraryUser { Id = "user1", UserName = "test@example.com", Email = "test@example.com" };
            var loginDto = new LoginDto { Email = "test@example.com", Password = "Password123!" };

            _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);
            _mockSignInManager.Setup(x => x.CheckPasswordSignInAsync(user, loginDto.Password, false))
                             .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);
            _mockTokenService.Setup(x => x.GenerateTokenAsync(user)).ReturnsAsync("test-token");
            _mockUserManager.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string> { "Customer" });

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var authResponse = Assert.IsType<AuthResponseDto>(okResult.Value);
            Assert.True(authResponse.Success);
            Assert.Equal("test-token", authResponse.Token);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var email = "test@example.com";
            var password = "WrongPassword";

            var loginDto = new LoginDto { Email = email, Password = password };

            _mockUserManager.Setup(x => x.FindByEmailAsync(email))
                .ReturnsAsync((LibraryUser)null);

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "new@example.com",
                Password = "Password123!",
                Role = "Customer"
            };

            _mockUserManager
                .Setup(x => x.CreateAsync(It.IsAny<LibraryUser>(), registerDto.Password))
                .ReturnsAsync(IdentityResult.Success);

            _mockUserManager
                .Setup(x => x.AddToRoleAsync(It.IsAny<LibraryUser>(), registerDto.Role))
                .ReturnsAsync(IdentityResult.Success);

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Register_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "invalid-email", // Invalid email format
                Password = "short",      // Too short password
                Role = "Customer"
            };

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Add model validation error
            controller.ModelState.AddModelError("Email", "Invalid email format");

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_WithExistingUser_ReturnsBadRequest()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "existing@example.com",
                Password = "Password123!",
                Role = "Customer"
            };

            _mockUserManager
                .Setup(x => x.CreateAsync(It.IsAny<LibraryUser>(), registerDto.Password))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "User already exists" }));

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_WithValidDataAndRoleAssignment_ReturnsOkResult()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "librarian@example.com",
                Password = "Password123!",
                Role = "Librarian"
            };

            _mockUserManager
                .Setup(x => x.CreateAsync(It.IsAny<LibraryUser>(), registerDto.Password))
                .ReturnsAsync(IdentityResult.Success);

            _mockUserManager
                .Setup(x => x.AddToRoleAsync(It.IsAny<LibraryUser>(), "Librarian"))
                .ReturnsAsync(IdentityResult.Success);

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Login_WithValidCredentialsAndRoles_ReturnsTokenWithRoles()
        {
            // Arrange
            var user = new LibraryUser { Id = "user1", UserName = "test@example.com", Email = "test@example.com" };
            var loginDto = new LoginDto { Email = "test@example.com", Password = "Password123!" };

            _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);
            _mockSignInManager.Setup(x => x.CheckPasswordSignInAsync(user, loginDto.Password, false))
                             .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);
            _mockTokenService.Setup(x => x.GenerateTokenAsync(user)).ReturnsAsync("test-token");

            // Setup multiple roles
            _mockUserManager.Setup(x => x.GetRolesAsync(user))
                           .ReturnsAsync(new List<string> { "Customer", "Librarian" });

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object,
                _mockLogger.Object);

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var authResponse = Assert.IsType<AuthResponseDto>(okResult.Value);
            Assert.True(authResponse.Success);
            Assert.Equal("test-token", authResponse.Token);
            Assert.Equal("Customer", authResponse.Role); // Should return the first role
        }
    }
}
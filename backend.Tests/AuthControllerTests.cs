using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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

        public AuthControllerTests()
        {
            // Setup UserManager mock
            var userStoreMock = new Mock<IUserStore<LibraryUser>>();
            _mockUserManager = new Mock<UserManager<LibraryUser>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            // Setup SignInManager mock - this is more complex due to its dependencies
            var contextAccessorMock = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
            var userPrincipalFactoryMock = new Mock<IUserClaimsPrincipalFactory<LibraryUser>>();
            _mockSignInManager = new Mock<SignInManager<LibraryUser>>(
                _mockUserManager.Object,
                contextAccessorMock.Object,
                userPrincipalFactoryMock.Object,
                null, null, null, null);

            // Setup TokenService mock
            _mockTokenService = new Mock<ITokenService>();
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var email = "test@example.com";
            var password = "Password123!";

            var user = new LibraryUser { UserName = email, Email = email };
            var loginDto = new LoginDto { Email = email, Password = password };

            _mockUserManager.Setup(x => x.FindByEmailAsync(email))
                .ReturnsAsync(user);

            _mockSignInManager
                .Setup(x => x.CheckPasswordSignInAsync(user, password, false))
                .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);

            _mockTokenService.Setup(x => x.GenerateTokenAsync(user))
                .ReturnsAsync("test-token");

            var controller = new AuthController(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockTokenService.Object);

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var authResponse = Assert.IsType<AuthResponseDto>(okResult.Value);
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
                _mockTokenService.Object);

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
                _mockTokenService.Object);

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
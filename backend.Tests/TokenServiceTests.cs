using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Tests
{
    public class TokenServiceTests
    {
        private readonly Mock<UserManager<LibraryUser>> _mockUserManager;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<ILogger<TokenService>> _mockLogger;

        public TokenServiceTests()
        {
            // Setup UserManager mock
            var userStoreMock = new Mock<IUserStore<LibraryUser>>();
            _mockUserManager = new Mock<UserManager<LibraryUser>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            // Setup Configuration mock
            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(x => x["Jwt:Key"]).Returns("ThisIsAVeryLongSecretKeyForTestingJwtTokenGenerationInUnitTests12345");
            _mockConfiguration.Setup(x => x["Jwt:Issuer"]).Returns("TestIssuer");

            // Setup Logger mock
            _mockLogger = new Mock<ILogger<TokenService>>();
        }

        [Fact]
        public async Task GenerateTokenAsync_ShouldReturnValidToken()
        {
            // Arrange
            var user = new LibraryUser
            {
                Id = "test-user-id",
                UserName = "testuser@example.com",
                Email = "testuser@example.com"
            };

            _mockUserManager.Setup(x => x.GetRolesAsync(user))
                .ReturnsAsync(new List<string> { "Customer" });

            var tokenService = new TokenService(_mockConfiguration.Object, _mockUserManager.Object, _mockLogger.Object);

            // Act
            var token = await tokenService.GenerateTokenAsync(user);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);

            // Decode token to verify claims
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            // Verify claims
            Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.NameIdentifier && c.Value == user.Id);
            Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.Name && c.Value == user.UserName);
            Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.Email && c.Value == user.Email);
            Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.Role && c.Value == "Customer");

            // Verify logger was called
            VerifyLogger(LogLevel.Information, "Generating JWT token for user");
            VerifyLogger(LogLevel.Debug, "Retrieved 1 roles for user");
            VerifyLogger(LogLevel.Information, "Successfully generated JWT token for user");
        }

        [Fact]
        public async Task GenerateTokenAsync_WithMultipleRoles_ShouldIncludeAllRoles()
        {
            // Arrange
            var user = new LibraryUser
            {
                Id = "multi-role-user",
                UserName = "multirole@example.com",
                Email = "multirole@example.com"
            };

            _mockUserManager.Setup(x => x.GetRolesAsync(user))
                .ReturnsAsync(new List<string> { "Customer", "Librarian" });

            var tokenService = new TokenService(_mockConfiguration.Object, _mockUserManager.Object, _mockLogger.Object);

            // Act
            var token = await tokenService.GenerateTokenAsync(user);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var roles = jwtToken.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
            Assert.Contains("Customer", roles);
            Assert.Contains("Librarian", roles);
            Assert.Equal(2, roles.Count);

            // Verify logger was called with correct role count
            VerifyLogger(LogLevel.Debug, "Retrieved 2 roles for user");
            VerifyLogger(LogLevel.Debug, "Customer, Librarian");
        }

        [Fact]
        public async Task GenerateTokenAsync_WithCustomClaims_ShouldIncludeThoseClaims()
        {
            // Arrange
            var user = new LibraryUser
            {
                Id = "user-with-custom-claims",
                UserName = "custom@example.com",
                Email = "custom@example.com"
            };

            _mockUserManager.Setup(x => x.GetRolesAsync(user))
                .ReturnsAsync(new List<string> { "Customer" });

            var tokenService = new TokenService(_mockConfiguration.Object, _mockUserManager.Object, _mockLogger.Object);

            // Act
            var token = await tokenService.GenerateTokenAsync(user);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.Email && c.Value == user.Email);
            Assert.Contains(jwtToken.Claims, c => c.Type == ClaimTypes.Name && c.Value == user.UserName);

            // Verify logger recorded claims creation
            VerifyLogger(LogLevel.Debug, "Created 4 claims for user");
        }

        [Fact]
        public async Task GenerateTokenAsync_WithMissingJwtKey_ShouldThrowException()
        {
            // Arrange
            var user = new LibraryUser
            {
                Id = "test-user-id",
                UserName = "testuser@example.com",
                Email = "testuser@example.com"
            };

            _mockUserManager.Setup(x => x.GetRolesAsync(user))
                .ReturnsAsync(new List<string> { "Customer" });

            // Setup configuration to return null for JWT key
            var mockEmptyConfig = new Mock<IConfiguration>();
            mockEmptyConfig.Setup(x => x["Jwt:Key"]).Returns((string)null);
            mockEmptyConfig.Setup(x => x["Jwt:Issuer"]).Returns("TestIssuer");

            var tokenService = new TokenService(mockEmptyConfig.Object, _mockUserManager.Object, _mockLogger.Object);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => tokenService.GenerateTokenAsync(user));

            Assert.Equal("JWT Key is not configured", exception.Message);

            // Verify error was logged
            VerifyLogger(LogLevel.Error, "Error generating JWT token for user");
        }

        // Helper method to verify logger calls
        private void VerifyLogger(LogLevel level, string messageContains)
        {
            _mockLogger.Verify(
                x => x.Log(
                    It.Is<LogLevel>(l => l == level),
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((o, t) => o.ToString().Contains(messageContains)),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }
    }
}
using backend.Controllers;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class CheckoutsControllerTests
    {
        private readonly Mock<ICheckoutService> _mockCheckoutService;
        private readonly Mock<ILogger<CheckoutsController>> _mockLogger;

        public CheckoutsControllerTests()
        {
            _mockCheckoutService = new Mock<ICheckoutService>();
            _mockLogger = new Mock<ILogger<CheckoutsController>>();
        }

        [Fact]
        public async Task CheckoutBook_WithValidBook_ShouldReturnCreatedAtAction()
        {
            // Arrange
            var checkoutDto = new CheckoutDto
            {
                Id = 1,
                BookId = 1,
                BookTitle = "Test Book",
                UserId = "test-user-id",
                UserName = "Test User",
                CheckoutDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(5)
            };

            _mockCheckoutService.Setup(x => x.CheckoutBookAsync("test-user-id", 1))
                .ReturnsAsync(checkoutDto);

            var controller = new CheckoutsController(_mockCheckoutService.Object, _mockLogger.Object);

            // Set up User Claims
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CheckoutBook(1);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedCheckout = Assert.IsType<CheckoutDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnedCheckout.Id);
            Assert.Equal(1, returnedCheckout.BookId);
        }

        [Fact]
        public async Task CheckoutBook_WithUnavailableBook_ShouldReturnBadRequest()
        {
            // Arrange
            _mockCheckoutService.Setup(x => x.CheckoutBookAsync("test-user-id", 1))
                .ThrowsAsync(new InvalidOperationException("Book is not available for checkout"));

            var controller = new CheckoutsController(_mockCheckoutService.Object, _mockLogger.Object);

            // Set up User Claims
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CheckoutBook(1);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task ReturnBook_WithValidCheckout_ShouldReturnOkResult()
        {
            // Arrange
            var checkoutDto = new CheckoutDto
            {
                Id = 1,
                BookId = 1,
                BookTitle = "Test Book",
                UserId = "test-user-id",
                UserName = "Test User",
                CheckoutDate = DateTime.UtcNow.AddDays(-3),
                DueDate = DateTime.UtcNow.AddDays(2),
                ReturnDate = DateTime.UtcNow
            };

            _mockCheckoutService.Setup(x => x.ReturnBookAsync(1))
                .ReturnsAsync(checkoutDto);

            var controller = new CheckoutsController(_mockCheckoutService.Object, _mockLogger.Object);

            // Set up User Claims (Librarian)
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "librarian-id"),
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.ReturnBook(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCheckout = Assert.IsType<CheckoutDto>(okResult.Value);
            Assert.Equal(1, returnedCheckout.Id);
            Assert.NotNull(returnedCheckout.ReturnDate);
        }

        [Fact]
        public async Task GetUserCheckouts_ShouldReturnOkResult()
        {
            // Arrange
            var checkouts = new List<CheckoutDto>
            {
                new CheckoutDto
                {
                    Id = 1,
                    BookId = 1,
                    BookTitle = "Test Book 1",
                    UserId = "test-user-id",
                    UserName = "Test User",
                    CheckoutDate = DateTime.UtcNow.AddDays(-5),
                    DueDate = DateTime.UtcNow
                },
                new CheckoutDto
                {
                    Id = 2,
                    BookId = 2,
                    BookTitle = "Test Book 2",
                    UserId = "test-user-id",
                    UserName = "Test User",
                    CheckoutDate = DateTime.UtcNow.AddDays(-2),
                    DueDate = DateTime.UtcNow.AddDays(3)
                }
            };

            _mockCheckoutService.Setup(x => x.GetUserCheckoutsAsync("test-user-id"))
                .ReturnsAsync(checkouts);

            var controller = new CheckoutsController(_mockCheckoutService.Object, _mockLogger.Object);

            // Set up User Claims
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.GetUserCheckouts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCheckouts = Assert.IsAssignableFrom<IEnumerable<CheckoutDto>>(okResult.Value);
            Assert.Equal(2, returnedCheckouts.Count());
        }

        [Fact]
        public async Task GetAllActiveCheckouts_ShouldReturnOkResult()
        {
            // Arrange
            var checkouts = new List<CheckoutDto>
            {
                new CheckoutDto
                {
                    Id = 1,
                    BookId = 1,
                    BookTitle = "Test Book 1",
                    UserId = "user1",
                    UserName = "User 1",
                    CheckoutDate = DateTime.UtcNow.AddDays(-5),
                    DueDate = DateTime.UtcNow
                },
                new CheckoutDto
                {
                    Id = 2,
                    BookId = 2,
                    BookTitle = "Test Book 2",
                    UserId = "user2",
                    UserName = "User 2",
                    CheckoutDate = DateTime.UtcNow.AddDays(-2),
                    DueDate = DateTime.UtcNow.AddDays(3)
                }
            };

            _mockCheckoutService.Setup(x => x.GetAllActiveCheckoutsAsync())
                .ReturnsAsync(checkouts);

            var controller = new CheckoutsController(_mockCheckoutService.Object, _mockLogger.Object);

            // Set up User Claims (Librarian)
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "librarian-id"),
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.GetAllActiveCheckouts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCheckouts = Assert.IsAssignableFrom<IEnumerable<CheckoutDto>>(okResult.Value);
            Assert.Equal(2, returnedCheckouts.Count());
        }
    }
}
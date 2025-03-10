using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Controllers;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace backend.Tests.Controllers
{
    public class CheckoutsControllerTests
    {
        private readonly Mock<ICheckoutService> _mockCheckoutService;
        private readonly Mock<ILogger<CheckoutsController>> _mockLogger;
        private readonly CheckoutsController _controller;
        private readonly string _testUserId = "user123";

        public CheckoutsControllerTests()
        {
            _mockCheckoutService = new Mock<ICheckoutService>();
            _mockLogger = new Mock<ILogger<CheckoutsController>>();
            _controller = new CheckoutsController(_mockCheckoutService.Object, _mockLogger.Object);

            // Setup ClaimsPrincipal for the controller
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _testUserId)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Set the user for the controller
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = claimsPrincipal
                }
            };
        }

        [Fact]
        public async Task CheckoutBook_ValidRequest_ReturnsCreatedResult()
        {
            // Arrange
            int bookId = 1;
            var checkoutDto = new CheckoutDto
            {
                Id = 1,
                BookId = bookId,
                BookTitle = "Test Book",
                UserId = _testUserId,
                UserName = "Test User",
                CheckoutDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(5)
            };

            _mockCheckoutService.Setup(s => s.CheckoutBookAsync(_testUserId, bookId))
                .ReturnsAsync(checkoutDto);

            // Act
            var result = await _controller.CheckoutBook(bookId);

            // Assert
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnValue = Assert.IsType<CheckoutDto>(createdAtResult.Value);
            Assert.Equal(checkoutDto.Id, returnValue.Id);

            // Verify logging attempt
            VerifyLoggerCall(LogLevel.Information, $"Attempting to checkout book {bookId}");

            // Verify logging success
            VerifyLoggerCall(LogLevel.Information, $"successfully checked out");
        }

        [Fact]
        public async Task CheckoutBook_BookNotFound_ReturnsNotFound()
        {
            // Arrange
            int bookId = 999;
            _mockCheckoutService.Setup(s => s.CheckoutBookAsync(_testUserId, bookId))
                .ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.CheckoutBook(bookId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = notFoundResult.Value.GetType().GetProperty("message")?.GetValue(notFoundResult.Value, null);
            Assert.Equal("Book not found", response);

            // Verify logging
            VerifyLoggerCall(LogLevel.Warning, $"Book {bookId} not found");
        }

        [Fact]
        public async Task CheckoutBook_InvalidOperation_ReturnsBadRequest()
        {
            // Arrange
            int bookId = 1;
            string errorMessage = "Book is not available for checkout";
            _mockCheckoutService.Setup(s => s.CheckoutBookAsync(_testUserId, bookId))
                .ThrowsAsync(new InvalidOperationException(errorMessage));

            // Act
            var result = await _controller.CheckoutBook(bookId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = badRequestResult.Value.GetType().GetProperty("message")?.GetValue(badRequestResult.Value, null);
            Assert.Equal(errorMessage, response);

            // Verify logging
            VerifyLoggerCall(LogLevel.Warning, errorMessage);
        }

        [Fact]
        public async Task ReturnBook_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            int checkoutId = 1;
            var checkoutDto = new CheckoutDto
            {
                Id = checkoutId,
                BookId = 1,
                BookTitle = "Test Book",
                UserId = _testUserId,
                UserName = "Test User",
                CheckoutDate = DateTime.UtcNow.AddDays(-3),
                DueDate = DateTime.UtcNow.AddDays(2),
                ReturnDate = DateTime.UtcNow
            };

            _mockCheckoutService.Setup(s => s.ReturnBookAsync(checkoutId))
                .ReturnsAsync(checkoutDto);

            // Act
            var result = await _controller.ReturnBook(checkoutId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<CheckoutDto>(okResult.Value);

            // Verify correct ID
            Assert.Equal(checkoutDto.Id, returnValue.Id);

            // Since ReturnDate is set, IsReturned should be true
            Assert.True(returnValue.IsReturned);

            // Verify logging
            VerifyLoggerCall(LogLevel.Information, "Attempting to return book");
            VerifyLoggerCall(LogLevel.Information, "successfully returned");
        }

        [Fact]
        public async Task ReturnBook_CheckoutNotFound_ReturnsNotFound()
        {
            // Arrange
            int checkoutId = 999;
            _mockCheckoutService.Setup(s => s.ReturnBookAsync(checkoutId))
                .ReturnsAsync((CheckoutDto)null);

            // Act
            var result = await _controller.ReturnBook(checkoutId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = notFoundResult.Value.GetType().GetProperty("message")?.GetValue(notFoundResult.Value, null);
            Assert.Equal("Checkout not found or already returned", response);

            // Verify logging
            VerifyLoggerCall(LogLevel.Warning, $"not found or already returned");
        }

        [Fact]
        public async Task GetCheckout_ValidId_ReturnsOkResult()
        {
            // Arrange
            int checkoutId = 1;
            var checkoutDto = new CheckoutDto
            {
                Id = checkoutId,
                BookId = 1,
                BookTitle = "Test Book",
                UserId = _testUserId,
                UserName = "Test User",
                CheckoutDate = DateTime.UtcNow.AddDays(-3),
                DueDate = DateTime.UtcNow.AddDays(2)
            };

            _mockCheckoutService.Setup(s => s.GetCheckoutByIdAsync(checkoutId))
                .ReturnsAsync(checkoutDto);

            // Act
            var result = await _controller.GetCheckout(checkoutId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<CheckoutDto>(okResult.Value);
            Assert.Equal(checkoutDto.Id, returnValue.Id);

            // Verify logging
            VerifyLoggerCall(LogLevel.Information, $"Retrieving checkout {checkoutId}");
            VerifyLoggerCall(LogLevel.Information, $"Successfully retrieved checkout");
        }

        [Fact]
        public async Task GetUserCheckouts_ReturnsOkResult()
        {
            // Arrange
            var checkouts = new List<CheckoutDto>
            {
                new CheckoutDto
                {
                    Id = 1,
                    BookId = 1,
                    BookTitle = "Test Book 1",
                    UserId = _testUserId,
                    UserName = "Test User",
                    CheckoutDate = DateTime.UtcNow.AddDays(-3),
                    DueDate = DateTime.UtcNow.AddDays(2)
                },
                new CheckoutDto
                {
                    Id = 2,
                    BookId = 2,
                    BookTitle = "Test Book 2",
                    UserId = _testUserId,
                    UserName = "Test User",
                    CheckoutDate = DateTime.UtcNow.AddDays(-1),
                    DueDate = DateTime.UtcNow.AddDays(4)
                }
            };

            _mockCheckoutService.Setup(s => s.GetUserCheckoutsAsync(_testUserId))
                .ReturnsAsync(checkouts);

            // Act
            var result = await _controller.GetUserCheckouts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CheckoutDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());

            // Verify logging
            VerifyLoggerCall(LogLevel.Information, $"Retrieving active checkouts for user");
            VerifyLoggerCall(LogLevel.Information, $"Retrieved 2 active checkouts");
        }

        [Fact]
        public async Task GetAllActiveCheckouts_ReturnsOkResult()
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
                    CheckoutDate = DateTime.UtcNow.AddDays(-3),
                    DueDate = DateTime.UtcNow.AddDays(2)
                },
                new CheckoutDto
                {
                    Id = 2,
                    BookId = 2,
                    BookTitle = "Test Book 2",
                    UserId = "user2",
                    UserName = "User 2",
                    CheckoutDate = DateTime.UtcNow.AddDays(-1),
                    DueDate = DateTime.UtcNow.AddDays(4)
                }
            };

            _mockCheckoutService.Setup(s => s.GetAllActiveCheckoutsAsync())
                .ReturnsAsync(checkouts);

            // Act
            var result = await _controller.GetAllActiveCheckouts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CheckoutDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());

            // Verify logging
            VerifyLoggerCall(LogLevel.Information, "Retrieving all active checkouts");
            VerifyLoggerCall(LogLevel.Information, "Retrieved 2 active checkouts");
        }

        [Fact]
        public async Task CheckoutBook_ExceptionThrown_ReturnsServerError()
        {
            // Arrange
            int bookId = 1;
            _mockCheckoutService.Setup(s => s.CheckoutBookAsync(_testUserId, bookId))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.CheckoutBook(bookId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(StatusCodes.Status500InternalServerError, statusCodeResult.StatusCode);
            Assert.Equal("An error occurred while checking out the book", statusCodeResult.Value);

            // Verify logging
            VerifyLoggerCall(LogLevel.Error, "Error checking out book with ID");
        }

        // Helper method to verify logger calls
        private void VerifyLoggerCall(LogLevel level, string contains)
        {
            _mockLogger.Verify(
                x => x.Log(
                    It.Is<LogLevel>(l => l == level),
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((o, t) => o.ToString().Contains(contains)),
                    It.IsAny<Exception>(),
                    (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()),
                Times.AtLeastOnce);
        }
    }
}
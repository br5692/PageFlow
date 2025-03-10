using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace backend.Tests
{
    public class CheckoutServiceTests
    {
        private readonly DbContextOptions<LibraryDbContext> _options;
        private readonly Mock<ILogger<CheckoutService>> _mockLogger;

        public CheckoutServiceTests()
        {
            // Use in-memory database for testing
            _options = new DbContextOptionsBuilder<LibraryDbContext>()
                .UseInMemoryDatabase(databaseName: "TestLibraryDb_Checkouts_" + Guid.NewGuid().ToString())
                .Options;

            _mockLogger = new Mock<ILogger<CheckoutService>>();

            // Seed the database
            SeedDatabase();
        }

        private void SeedDatabase()
        {
            using var context = new LibraryDbContext(_options);

            // Create test user
            if (!context.Users.Any())
            {
                context.Users.Add(new LibraryUser
                {
                    Id = "test-user-id",
                    UserName = "testuser@example.com",
                    Email = "testuser@example.com"
                });
            }

            // Create test books
            if (!context.Books.Any())
            {
                context.Books.Add(new Book
                {
                    Id = 1,
                    Title = "Available Book",
                    Author = "Test Author",
                    IsAvailable = true
                });

                context.Books.Add(new Book
                {
                    Id = 2,
                    Title = "Checked Out Book",
                    Author = "Test Author",
                    IsAvailable = false
                });
            }

            // Add existing checkout for book 2
            if (!context.Checkouts.Any())
            {
                context.Checkouts.Add(new Checkout
                {
                    Id = 1,
                    BookId = 2,
                    LibraryUserId = "test-user-id",
                    CheckoutDate = DateTime.UtcNow.AddDays(-3),
                    DueDate = DateTime.UtcNow.AddDays(2)
                });
            }

            context.SaveChanges();
        }

        [Fact]
        public async Task CheckoutBookAsync_WithAvailableBook_ShouldCreateCheckout()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.CheckoutBookAsync("test-user-id", 1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.BookId);
            Assert.Equal("test-user-id", result.UserId);

            // Verify book is now unavailable
            var book = await context.Books.FindAsync(1);
            Assert.False(book.IsAvailable);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Attempting to checkout book 1 for user test-user-id");
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Book 1 (Available Book) successfully checked out by user test-user-id");
        }

        [Fact]
        public async Task CheckoutBookAsync_WithUnavailableBook_ShouldThrowException()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CheckoutBookAsync("test-user-id", 2));

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Attempting to checkout book 2 for user test-user-id");
            VerifyLogEntry(_mockLogger, LogLevel.Warning, "Checkout failed: Book 2 (Checked Out Book) is not available");
        }

        [Fact]
        public async Task ReturnBookAsync_WithValidCheckout_ShouldUpdateCheckoutAndBook()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.ReturnBookAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.BookId);
            Assert.NotNull(result.ReturnDate);

            // Verify book is now available
            var book = await context.Books.FindAsync(2);
            Assert.True(book.IsAvailable);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Attempting to return book for checkout 1");
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Book 2 (Checked Out Book) successfully returned for checkout 1 by user test-user-id");
        }

        [Fact]
        public async Task GetUserCheckoutsAsync_ShouldReturnUserCheckouts()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.GetUserCheckoutsAsync("test-user-id");

            // Assert
            Assert.Single(result);
            var checkout = result.First();
            Assert.Equal(2, checkout.BookId);
            Assert.Equal("test-user-id", checkout.UserId);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieving active checkouts for user test-user-id");
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieved 1 active checkouts for user test-user-id");
        }

        [Fact]
        public async Task GetAllActiveCheckoutsAsync_ShouldReturnActiveCheckouts()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.GetAllActiveCheckoutsAsync();

            // Assert
            Assert.Single(result);
            var checkout = result.First();
            Assert.Equal(2, checkout.BookId);
            Assert.Null(checkout.ReturnDate);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieving all active checkouts");
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieved 1 active checkouts");
        }

        [Fact]
        public async Task CheckoutBookAsync_WithNonexistentBook_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                service.CheckoutBookAsync("test-user-id", 999));

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Attempting to checkout book 999 for user test-user-id");
            VerifyLogEntry(_mockLogger, LogLevel.Warning, "Checkout failed: Book 999 not found");
        }

        [Fact]
        public async Task ReturnBookAsync_WithNonexistentCheckout_ShouldReturnNull()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.ReturnBookAsync(999);

            // Assert
            Assert.Null(result);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Attempting to return book for checkout 999");
            VerifyLogEntry(_mockLogger, LogLevel.Warning, "Return failed: Checkout 999 not found");
        }

        [Fact]
        public async Task ReturnBookAsync_WithAlreadyReturnedBook_ShouldReturnNull()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Create a checkout that's already returned
            var book = await context.Books.FirstOrDefaultAsync();
            var checkout = new Checkout
            {
                BookId = book.Id,
                LibraryUserId = "test-user-id",
                CheckoutDate = DateTime.UtcNow.AddDays(-10),
                DueDate = DateTime.UtcNow.AddDays(-5),
                ReturnDate = DateTime.UtcNow.AddDays(-3) // Already returned
            };
            context.Checkouts.Add(checkout);
            await context.SaveChangesAsync();

            // Reset mock to clear previous log entries
            _mockLogger.Reset();

            // Act
            var result = await service.ReturnBookAsync(checkout.Id);

            // Assert
            Assert.Null(result);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, $"Attempting to return book for checkout {checkout.Id}");
            VerifyLogEntry(_mockLogger, LogLevel.Warning, $"Return failed: Book for checkout {checkout.Id} already returned on");
        }

        [Fact]
        public async Task GetUserCheckoutsAsync_WithNoCheckouts_ShouldReturnEmptyList()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.GetUserCheckoutsAsync("non-existent-user");

            // Assert
            Assert.Empty(result);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieving active checkouts for user non-existent-user");
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieved 0 active checkouts for user non-existent-user");
        }

        [Fact]
        public async Task GetAllActiveCheckoutsAsync_WithNoActiveCheckouts_ShouldReturnEmptyList()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Mark all checkouts as returned
            var checkouts = await context.Checkouts.ToListAsync();
            foreach (var checkout in checkouts)
            {
                checkout.ReturnDate = DateTime.UtcNow;
            }
            await context.SaveChangesAsync();

            // Reset mock to clear previous log entries
            _mockLogger.Reset();

            // Act
            var result = await service.GetAllActiveCheckoutsAsync();

            // Assert
            Assert.Empty(result);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieving all active checkouts");
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieved 0 active checkouts");
        }

        [Fact]
        public async Task GetCheckoutByIdAsync_WithNonexistentId_ShouldReturnNull()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new CheckoutService(context, _mockLogger.Object);

            // Act
            var result = await service.GetCheckoutByIdAsync(999);

            // Assert
            Assert.Null(result);

            // Verify logging occurred
            VerifyLogEntry(_mockLogger, LogLevel.Information, "Retrieving checkout 999");
            VerifyLogEntry(_mockLogger, LogLevel.Warning, "Checkout 999 not found");
        }

        // Helper method to verify log entries
        private void VerifyLogEntry(Mock<ILogger<CheckoutService>> mockLogger, LogLevel logLevel, string messageContains)
        {
            mockLogger.Verify(
                x => x.Log(
                    It.Is<LogLevel>(l => l == logLevel),
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains(messageContains)),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.AtLeastOnce);
        }
    }
}
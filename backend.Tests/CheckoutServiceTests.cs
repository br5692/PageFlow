using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

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

            // Act
            var result = await service.ReturnBookAsync(checkout.Id);

            // Assert
            Assert.Null(result);
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

            // Act
            var result = await service.GetAllActiveCheckoutsAsync();

            // Assert
            Assert.Empty(result);
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
        }
    }
}
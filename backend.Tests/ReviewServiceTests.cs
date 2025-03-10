using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace backend.Tests
{
    public class ReviewServiceTests
    {
        private readonly DbContextOptions<LibraryDbContext> _options;
        private readonly Mock<ILogger<ReviewService>> _loggerMock;

        public ReviewServiceTests()
        {
            // Use in-memory database for testing
            _options = new DbContextOptionsBuilder<LibraryDbContext>()
                .UseInMemoryDatabase(databaseName: "TestLibraryDb_Reviews_" + Guid.NewGuid().ToString())
                .Options;

            // Set up mock logger
            _loggerMock = new Mock<ILogger<ReviewService>>();

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

            // Create test book
            if (!context.Books.Any())
            {
                context.Books.Add(new Book
                {
                    Id = 1,
                    Title = "Test Book",
                    Author = "Test Author"
                });
            }

            // Add a review
            if (!context.Reviews.Any())
            {
                context.Reviews.Add(new Review
                {
                    Id = 1,
                    BookId = 1,
                    LibraryUserId = "test-user-id",
                    Rating = 4,
                    Comment = "Great book!",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                });
            }

            context.SaveChanges();
        }

        [Fact]
        public async Task GetReviewsByBookIdAsync_ShouldReturnReviews()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);

            // Act
            var result = await service.GetReviewsByBookIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            var review = result.First();
            Assert.Equal(1, review.BookId);
            Assert.Equal("test-user-id", review.UserId);
            Assert.Equal(4, review.Rating);
            Assert.Equal("Great book!", review.Comment);

            // Verify logger was called
            VerifyLogger(LogLevel.Information, "Retrieving reviews for book ID 1");
            VerifyLogger(LogLevel.Information, "Retrieved 1 reviews for book ID 1");
        }

        [Fact]
        public async Task CreateReviewAsync_ShouldCreateNewReview()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 5,
                Comment = "Excellent read!"
            };

            // Create a new user for this test to avoid conflict with existing review
            var newUserId = "new-test-user-id";
            context.Users.Add(new LibraryUser
            {
                Id = newUserId,
                UserName = "newuser@example.com",
                Email = "newuser@example.com"
            });
            await context.SaveChangesAsync();

            // Act
            var result = await service.CreateReviewAsync(newUserId, reviewDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.BookId);
            Assert.Equal(newUserId, result.UserId);
            Assert.Equal(5, result.Rating);
            Assert.Equal("Excellent read!", result.Comment);

            // Verify review was added to database
            var savedReview = await context.Reviews
                .FirstOrDefaultAsync(r => r.LibraryUserId == newUserId && r.BookId == 1);
            Assert.NotNull(savedReview);
            Assert.Equal(5, savedReview.Rating);

            // Verify logger was called
            VerifyLogger(LogLevel.Information, "Creating review for book ID 1");
            VerifyLogger(LogLevel.Information, "Review created with ID");
        }

        [Fact]
        public async Task CreateReviewAsync_WhenUserAlreadyReviewed_ShouldThrowException()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 3,
                Comment = "Second review attempt"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateReviewAsync("test-user-id", reviewDto));

            Assert.Equal("User has already reviewed this book", exception.Message);

            // Verify logger was called with warning level
            VerifyLogger(LogLevel.Warning, "attempted to review");
        }

        [Fact]
        public async Task HasUserReviewedBookAsync_WithExistingReview_ShouldReturnTrue()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);

            // Act
            var result = await service.HasUserReviewedBookAsync("test-user-id", 1);

            // Assert
            Assert.True(result);

            // Verify logger was called
            VerifyLogger(LogLevel.Debug, "Checking if user");
            VerifyLogger(LogLevel.Debug, "User test-user-id has reviewed book 1");
        }

        [Fact]
        public async Task HasUserReviewedBookAsync_WithNoReview_ShouldReturnFalse()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);

            // Act
            var result = await service.HasUserReviewedBookAsync("non-existent-user", 1);

            // Assert
            Assert.False(result);

            // Verify logger was called
            VerifyLogger(LogLevel.Debug, "User non-existent-user has not reviewed book 1");
        }

        [Fact]
        public async Task GetReviewsByBookIdAsync_WithNonExistentBookId_ShouldReturnEmptyList()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);

            // Act
            var result = await service.GetReviewsByBookIdAsync(999);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);

            // Verify logger was called
            VerifyLogger(LogLevel.Information, "Retrieved 0 reviews for book ID 999");
        }

        [Fact]
        public async Task CreateReviewAsync_WithInvalidBookId_ShouldThrowException()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context, _loggerMock.Object);

            var reviewDto = new ReviewCreateDto
            {
                BookId = 999, // Non-existent book ID
                Rating = 5,
                Comment = "Great book!"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateReviewAsync("test-user-id", reviewDto));

            Assert.Equal("Book with ID 999 does not exist", exception.Message);

            // Verify logger was called with warning level
            VerifyLogger(LogLevel.Warning, "Attempted to review non-existent book");
        }

        // Helper method to verify logger calls
        private void VerifyLogger(LogLevel level, string messageContains)
        {
            _loggerMock.Verify(
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
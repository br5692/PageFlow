using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class ReviewServiceTests
    {
        private readonly DbContextOptions<LibraryDbContext> _options;

        public ReviewServiceTests()
        {
            // Use in-memory database for testing
            _options = new DbContextOptionsBuilder<LibraryDbContext>()
                .UseInMemoryDatabase(databaseName: "TestLibraryDb_Reviews_" + Guid.NewGuid().ToString())
                .Options;

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
            var service = new ReviewService(context);

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
        }

        [Fact]
        public async Task CreateReviewAsync_ShouldCreateNewReview()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);
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
        }

        [Fact]
        public async Task CreateReviewAsync_WhenUserAlreadyReviewed_ShouldThrowException()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 3,
                Comment = "Second review attempt"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateReviewAsync("test-user-id", reviewDto));
        }

        [Fact]
        public async Task HasUserReviewedBookAsync_WithExistingReview_ShouldReturnTrue()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);

            // Act
            var result = await service.HasUserReviewedBookAsync("test-user-id", 1);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task HasUserReviewedBookAsync_WithNoReview_ShouldReturnFalse()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);

            // Act
            var result = await service.HasUserReviewedBookAsync("non-existent-user", 1);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetReviewsByBookIdAsync_WithNonExistentBookId_ShouldReturnEmptyList()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);

            // Act
            var result = await service.GetReviewsByBookIdAsync(999);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task HasUserReviewedBookAsync_WithNonExistentBook_ShouldReturnFalse()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);

            // Act
            var result = await service.HasUserReviewedBookAsync("test-user-id", 999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CreateReviewAsync_WithInvalidBookId_ShouldThrowException()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new ReviewService(context);

            var reviewDto = new ReviewCreateDto
            {
                BookId = 999, // Non-existent book ID
                Rating = 5,
                Comment = "Great book!"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateReviewAsync("test-user-id", reviewDto));
        }
    }
}
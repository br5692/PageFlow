using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace backend.Tests.Services
{
    public class BookRecommendationServiceTests
    {
        private readonly Mock<ILogger<BookRecommendationService>> _loggerMock;
        private readonly DbContextOptions<LibraryDbContext> _contextOptions;

        public BookRecommendationServiceTests()
        {
            _loggerMock = new Mock<ILogger<BookRecommendationService>>();

            // Use in-memory database for testing
            _contextOptions = new DbContextOptionsBuilder<LibraryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Initialize and seed the database
            SeedDatabase();
        }

        private void SeedDatabase()
        {
            using (var context = new LibraryDbContext(_contextOptions))
            {
                context.Database.EnsureCreated();

                // Add mock books
                if (!context.Books.Any())
                {
                    var books = new List<Book>
                    {
                        new Book
                        {
                            Id = 1,
                            Title = "The Great Adventure",
                            Author = "John Smith",
                            Category = "Fiction",
                            PageCount = 300,
                            IsAvailable = true
                        },
                        new Book
                        {
                            Id = 2,
                            Title = "Mystery of the Ages",
                            Author = "Jane Doe",
                            Category = "Mystery",
                            PageCount = 250,
                            IsAvailable = true
                        },
                        new Book
                        {
                            Id = 3,
                            Title = "History of Science",
                            Author = "John Smith",
                            Category = "Non-Fiction",
                            PageCount = 400,
                            IsAvailable = false
                        },
                        new Book
                        {
                            Id = 4,
                            Title = "Future Technology",
                            Author = "Alex Tech",
                            Category = "Science",
                            PageCount = 350,
                            IsAvailable = true
                        }
                    };

                    context.Books.AddRange(books);
                    context.SaveChanges();

                    // Add reviews
                    var reviews = new List<Review>
                    {
                        new Review { BookId = 1, LibraryUserId = "user1", Rating = 4 },
                        new Review { BookId = 1, LibraryUserId = "user2", Rating = 5 },
                        new Review { BookId = 2, LibraryUserId = "user1", Rating = 5 },
                        new Review { BookId = 2, LibraryUserId = "user3", Rating = 5 },
                        new Review { BookId = 3, LibraryUserId = "user2", Rating = 3 }
                    };

                    context.Reviews.AddRange(reviews);
                    context.SaveChanges();
                }
            }
        }

        private BookRecommendationService CreateService()
        {
            var context = new LibraryDbContext(_contextOptions);
            return new BookRecommendationService(context, _loggerMock.Object);
        }

        [Theory]
        [InlineData("help", true)]
        [InlineData("what are the commands?", true)]
        [InlineData("?", true)]
        [InlineData("show me books", false)]
        public async Task GenerateResponse_Help_ReturnsHelpMessage(string message, bool shouldReturnHelp)
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse(message);

            // Assert
            if (shouldReturnHelp)
            {
                Assert.Contains("I can help you find books!", result);
                Assert.Contains("Recommend a book", result);
            }
            else
            {
                Assert.DoesNotContain("I can help you find books!", result);
            }
        }

        [Theory]
        [InlineData("hi")]
        [InlineData("hello")]
        [InlineData("hey")]
        [InlineData("hello there")]
        public async Task GenerateResponse_Greeting_ReturnsGreeting(string message)
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse(message);

            // Assert
            Assert.Contains("Hello! I'm BookBot", result);
        }

        [Theory]
        [InlineData("recommend a book")]
        [InlineData("any suggestions?")]
        public async Task GenerateResponse_Recommendation_ReturnsBookRecommendation(string message)
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse(message);

            // Assert
            Assert.Contains("I recommend:", result);
            Assert.Contains("by", result);
            Assert.Contains("book with", result);
        }

        [Fact]
        public async Task GenerateResponse_AuthorSearch_ReturnsAuthorBooks()
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse("find books by John Smith");

            // Assert
            Assert.Contains("Found", result);
            Assert.Contains("books by John Smith", result);
        }

        [Fact]
        public async Task GenerateResponse_AuthorSearch_CaseInsensitive()
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse("find books by john smith");

            // Assert
            Assert.Contains("Found", result);
            Assert.Contains("books by john smith", result);
        }

        [Fact]
        public async Task GenerateResponse_PopularBooks_ReturnsTopRatedBooks()
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse("what are the most popular books?");

            // Assert
            Assert.Contains("Here are some popular books:", result);
        }

        [Theory]
        [InlineData("how do I checkout a book?")]
        [InlineData("can I borrow a book?")]
        public async Task GenerateResponse_CheckoutHelp_ReturnsHelpInformation(string message)
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse(message);

            // Assert
            Assert.Contains("To checkout a book:", result);
            Assert.Contains("My Checkouts", result);
        }

        [Fact]
        public async Task GenerateResponse_UnknownQuery_ReturnsDefaultResponse()
        {
            // Arrange
            var service = CreateService();

            // Act
            var result = await service.GenerateResponse("something completely random and unrelated to books");

            // Assert
            Assert.Contains("I'm not sure how to help with that", result);
            Assert.Contains("Type 'help'", result);
        }

        [Fact]
        public async Task RecommendRandomBook_NoAvailableBooks_ReturnsApology()
        {
            // Arrange - Set all books to unavailable
            using (var context = new LibraryDbContext(_contextOptions))
            {
                foreach (var book in context.Books)
                {
                    book.IsAvailable = false;
                }
                await context.SaveChangesAsync();
            }

            var service = CreateService();

            // Act
            var result = await service.GenerateResponse("recommend a book");

            // Assert
            Assert.Contains("Sorry, there are no available books right now", result);

            // Cleanup - restore availability for other tests
            using (var context = new LibraryDbContext(_contextOptions))
            {
                var booksToRestore = context.Books.Where(b => b.Id != 3); // Keep book 3 unavailable as in original setup
                foreach (var book in booksToRestore)
                {
                    book.IsAvailable = true;
                }
                await context.SaveChangesAsync();
            }
        }

        [Fact]
        public async Task FindBooksByAuthor_NoBooksByAuthor_ReturnsApology()
        {
            // Arrange
            var service = CreateService();
            var authorName = "NonExistentAuthor"; // Use a name that definitely doesn't exist

            // Act
            var result = await service.GenerateResponse($"find books by {authorName}");

            // Assert
            Assert.Contains($"I couldn't find any books by {authorName}", result);
            Assert.Contains("Try another author?", result);
        }

        [Fact]
        public async Task GetPopularBooks_NoRatedBooks_ReturnsApology()
        {
            // Arrange - Remove all reviews to simulate no ratings
            using (var context = new LibraryDbContext(_contextOptions))
            {
                context.Reviews.RemoveRange(context.Reviews);
                await context.SaveChangesAsync();
            }

            var service = CreateService();

            // Act
            var result = await service.GenerateResponse("popular books");

            // Assert
            Assert.Contains("I couldn't find any highly rated books right now", result);

            // Restore the database for other tests
            SeedDatabase();
        }
    }
}
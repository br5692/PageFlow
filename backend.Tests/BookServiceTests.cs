using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class BookServiceTests
    {
        private readonly DbContextOptions<LibraryDbContext> _options;

        public BookServiceTests()
        {
            // Use in-memory database for testing
            _options = new DbContextOptionsBuilder<LibraryDbContext>()
                .UseInMemoryDatabase(databaseName: "TestLibraryDb_" + Guid.NewGuid().ToString())
                .Options;

            // Seed the database
            SeedDatabase();
        }

        private void SeedDatabase()
        {
            using var context = new LibraryDbContext(_options);

            if (!context.Books.Any())
            {
                context.Books.Add(new Book
                {
                    Title = "Test Book 1",
                    Author = "Test Author 1",
                    Description = "Test Description 1",
                    ISBN = "1234567890123",
                    PublishedDate = DateTime.Now.AddYears(-1),
                });

                context.Books.Add(new Book
                {
                    Title = "Test Book 2",
                    Author = "Test Author 2",
                    Description = "Test Description 2",
                    ISBN = "9876543210987",
                    PublishedDate = DateTime.Now.AddMonths(-6),
                });

                context.SaveChanges();
            }
        }

        [Fact]
        public async Task GetAllBooksAsync_ShouldReturnAllBooks()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            // Act
            var result = await service.GetAllBooksAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, b => b.Title == "Test Book 1");
            Assert.Contains(result, b => b.Title == "Test Book 2");
        }

        [Fact]
        public async Task GetBookByIdAsync_WithValidId_ShouldReturnBook()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);
            var bookId = context.Books.First().Id;

            // Act
            var result = await service.GetBookByIdAsync(bookId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Book 1", result.Title);
        }

        [Fact]
        public async Task GetBookByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            // Act
            var result = await service.GetBookByIdAsync(-1);

            // Assert
            Assert.Null(result);
        }
    }
}
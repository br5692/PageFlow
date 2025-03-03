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

        [Fact]
        public async Task SearchBooksAsync_WithFilters_ShouldReturnFilteredBooks()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            // Add books with different categories
            context.Books.Add(new Book
            {
                Title = "Fantasy Book",
                Author = "Fantasy Author",
                Category = "Fantasy",
                IsAvailable = true
            });

            context.Books.Add(new Book
            {
                Title = "Science Book",
                Author = "Science Author",
                Category = "Science",
                IsAvailable = false
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.SearchBooksAsync(
                searchTerm: "Fantasy",
                category: "Fantasy",
                author: null,
                isAvailable: true,
                sortBy: "title",
                ascending: true);

            // Assert
            Assert.Single(result);
            Assert.Equal("Fantasy Book", result.First().Title);
        }

        [Fact]
        public async Task GetFeaturedBooksAsync_ShouldReturnRequestedNumberOfBooks()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            // Add more books for testing
            for (int i = 0; i < 10; i++)
            {
                context.Books.Add(new Book
                {
                    Title = $"Featured Book {i}",
                    Author = $"Author {i}"
                });
            }
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetFeaturedBooksAsync(5);

            // Assert
            Assert.Equal(5, result.Count());
        }

        [Fact]
        public async Task CreateBookAsync_ShouldAddBookToDatabase()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);
            var bookDto = new BookCreateDto
            {
                Title = "New Book",
                Author = "New Author",
                Description = "New Description",
                ISBN = "1234567890",
                Category = "Fiction",
                PageCount = 300
            };

            // Act
            var result = await service.CreateBookAsync(bookDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Book", result.Title);

            // Verify book was added to database
            var savedBook = await context.Books.FirstOrDefaultAsync(b => b.Title == "New Book");
            Assert.NotNull(savedBook);
            Assert.Equal("New Author", savedBook.Author);
        }

        [Fact]
        public async Task UpdateBookAsync_WithValidId_ShouldUpdateBook()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            var book = new Book
            {
                Title = "Original Title",
                Author = "Original Author"
            };
            context.Books.Add(book);
            await context.SaveChangesAsync();

            var bookDto = new BookUpdateDto
            {
                Id = book.Id,
                Title = "Updated Title",
                Author = "Updated Author",
                Description = "Updated Description"
            };

            // Act
            var result = await service.UpdateBookAsync(bookDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", result.Title);

            // Verify book was updated in database
            var updatedBook = await context.Books.FindAsync(book.Id);
            Assert.Equal("Updated Title", updatedBook.Title);
            Assert.Equal("Updated Author", updatedBook.Author);
        }

        [Fact]
        public async Task UpdateBookAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            var bookDto = new BookUpdateDto
            {
                Id = 999,
                Title = "Updated Title",
                Author = "Updated Author"
            };

            // Act
            var result = await service.UpdateBookAsync(bookDto);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteBookAsync_WithValidId_ShouldRemoveBook()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            var book = new Book
            {
                Title = "Book to Delete",
                Author = "Delete Author"
            };
            context.Books.Add(book);
            await context.SaveChangesAsync();

            // Act
            var result = await service.DeleteBookAsync(book.Id);

            // Assert
            Assert.True(result);

            // Verify book was removed from database
            var deletedBook = await context.Books.FindAsync(book.Id);
            Assert.Null(deletedBook);
        }

        [Fact]
        public async Task DeleteBookAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            // Act
            var result = await service.DeleteBookAsync(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task IsBookAvailableAsync_WithAvailableBook_ShouldReturnTrue()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            var book = new Book
            {
                Title = "Available Book",
                Author = "Author",
                IsAvailable = true
            };
            context.Books.Add(book);
            await context.SaveChangesAsync();

            // Act
            var result = await service.IsBookAvailableAsync(book.Id);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsBookAvailableAsync_WithUnavailableBook_ShouldReturnFalse()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);
            var service = new BookService(context);

            var book = new Book
            {
                Title = "Unavailable Book",
                Author = "Author",
                IsAvailable = false
            };
            context.Books.Add(book);
            await context.SaveChangesAsync();

            // Act
            var result = await service.IsBookAvailableAsync(book.Id);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetAllBooksAsync_WithSorting_ShouldReturnSortedBooks()
        {
            // Arrange
            using var context = new LibraryDbContext(_options);

            // Clear existing books to ensure predictable test environment
            context.Books.RemoveRange(context.Books);
            await context.SaveChangesAsync();

            var service = new BookService(context);

            context.Books.Add(new Book { Title = "C Book", Author = "C Author" });
            context.Books.Add(new Book { Title = "A Book", Author = "A Author" });
            context.Books.Add(new Book { Title = "B Book", Author = "B Author" });
            await context.SaveChangesAsync();

            // Act - Sort by title ascending
            var resultAsc = await service.GetAllBooksAsync("title", true);

            // Assert
            var titles = resultAsc.Select(b => b.Title).ToList();
            var sortedTitles = titles.OrderBy(t => t).ToList();
            Assert.Equal(sortedTitles, titles); // Verify they're in alphabetical order
            Assert.Equal(3, titles.Count);

            // Act - Sort by title descending
            var resultDesc = await service.GetAllBooksAsync("title", false);

            // Assert
            titles = resultDesc.Select(b => b.Title).ToList();
            sortedTitles = titles.OrderByDescending(t => t).ToList();
            Assert.Equal(sortedTitles, titles); // Verify they're in reverse alphabetical order
            Assert.Equal("C Book", titles[0]); // The first book should be "C Book" when sorted desc
        }
    }
}
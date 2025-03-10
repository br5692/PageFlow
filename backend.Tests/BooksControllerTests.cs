using backend.Controllers;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests.Controllers
{
    public class BooksControllerTests
    {
        private readonly Mock<IBookService> _mockBookService;
        private readonly Mock<IReviewService> _mockReviewService;
        private readonly Mock<ILogger<BooksController>> _mockLogger;
        private readonly BooksController _controller;

        public BooksControllerTests()
        {
            _mockBookService = new Mock<IBookService>();
            _mockReviewService = new Mock<IReviewService>();
            _mockLogger = new Mock<ILogger<BooksController>>();

            _controller = new BooksController(
                _mockBookService.Object,
                _mockReviewService.Object,
                _mockLogger.Object
            );
        }

        // GetAllBooks Tests
        [Fact]
        public async Task GetAllBooks_ReturnsOkResult_WithPaginatedBooks()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Test Book 1", Author = "Author 1" },
                new BookDto { Id = 2, Title = "Test Book 2", Author = "Author 2" }
            };
            int totalCount = 2;

            _mockBookService.Setup(service => service.GetAllBooksAsync(
                It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync((books, totalCount));

            // Act
            var result = await _controller.GetAllBooks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resultValue = okResult.Value;

            // Extract values using reflection to handle anonymous object
            var dataProperty = resultValue.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var returnedBooks = Assert.IsAssignableFrom<IEnumerable<BookDto>>(dataProperty.GetValue(resultValue));
            Assert.Equal(books.Count, returnedBooks.Count());

            var totalCountProperty = resultValue.GetType().GetProperty("totalCount");
            Assert.NotNull(totalCountProperty);
            Assert.Equal(totalCount, totalCountProperty.GetValue(resultValue));

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Getting all books")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Retrieved 2 books successfully")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task GetAllBooks_HandlesException_ReturnsServerError()
        {
            // Arrange
            _mockBookService.Setup(service => service.GetAllBooksAsync(
                It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<int>(), It.IsAny<int>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetAllBooks();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);

            // Verify error logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Error getting all books")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        // GetFeaturedBooks Tests
        [Fact]
        public async Task GetFeaturedBooks_ReturnsOkResult_WithFeaturedBooks()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Featured Book 1", Author = "Author 1", AverageRating = 4.5m }
            };
            int totalCount = 1;

            _mockBookService.Setup(service => service.GetFeaturedBooksAsync(
                It.IsAny<int>(), It.IsAny<decimal>(), It.IsAny<bool>()))
                .ReturnsAsync((books, totalCount));

            // Act
            var result = await _controller.GetFeaturedBooks(1, 4.0m, true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resultValue = okResult.Value;

            // Extract values using reflection
            var dataProperty = resultValue.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var returnedBooks = Assert.IsAssignableFrom<IEnumerable<BookDto>>(dataProperty.GetValue(resultValue));
            Assert.Equal(books.Count, returnedBooks.Count());

            var totalCountProperty = resultValue.GetType().GetProperty("totalCount");
            Assert.NotNull(totalCountProperty);
            Assert.Equal(totalCount, totalCountProperty.GetValue(resultValue));

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Getting 1 featured books")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }


        // SearchBooks Tests
        [Fact]
        public async Task SearchBooks_ReturnsOkResult_WithMatchingBooks()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Search Result", Author = "Author 1" }
            };
            int totalCount = 1;

            _mockBookService.Setup(service => service.SearchBooksAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<bool?>(), It.IsAny<string>(), It.IsAny<bool>(),
                It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync((books, totalCount));

            // Act
            var result = await _controller.SearchBooks("test");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resultValue = okResult.Value;

            // Explicitly extract values using reflection to handle anonymous types
            var dataProperty = resultValue.GetType().GetProperty("data");
            Assert.NotNull(dataProperty);
            var returnedBooks = Assert.IsAssignableFrom<IEnumerable<BookDto>>(dataProperty.GetValue(resultValue));
            Assert.Equal(books.Count, returnedBooks.Count());

            var totalCountProperty = resultValue.GetType().GetProperty("totalCount");
            Assert.NotNull(totalCountProperty);
            Assert.Equal(totalCount, totalCountProperty.GetValue(resultValue));

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Searching books with term: test")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }


        // GetBookById Tests
        [Fact]
        public async Task GetBookById_ReturnsOkResult_WithBook()
        {
            // Arrange
            var book = new BookDto { Id = 1, Title = "Test Book", Author = "Test Author" };
            _mockBookService.Setup(service => service.GetBookByIdAsync(1))
                .ReturnsAsync(book);

            // Act
            var result = await _controller.GetBookById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBook = Assert.IsType<BookDto>(okResult.Value);
            Assert.Equal(book, returnedBook);

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Getting book with id: 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task GetBookById_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Arrange
            _mockBookService.Setup(service => service.GetBookByIdAsync(99))
                .ReturnsAsync((BookDto)null);

            // Act
            var result = await _controller.GetBookById(99);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);

            // Verify warning logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Book with ID 99 not found")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        // CreateBook Tests
        [Fact]
        public async Task CreateBook_ReturnsCreatedAtAction_WithNewBook()
        {
            // Arrange
            var bookDto = new BookCreateDto
            {
                Title = "New Book",
                Author = "New Author",
                ISBN = "1234567890",
                PageCount = 200
            };

            var createdBook = new BookDto
            {
                Id = 1,
                Title = "New Book",
                Author = "New Author",
                ISBN = "1234567890",
                PageCount = 200,
                IsAvailable = true
            };

            _mockBookService.Setup(service => service.CreateBookAsync(bookDto))
                .ReturnsAsync(createdBook);

            // Act
            var result = await _controller.CreateBook(bookDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(BooksController.GetBookById), createdAtActionResult.ActionName);
            Assert.Equal(createdBook.Id, createdAtActionResult.RouteValues["id"]);

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Creating new book: New Book by New Author")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Book created successfully with ID: 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task CreateBook_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("Title", "Required");
            var bookDto = new BookCreateDto(); // Missing required fields

            // Act
            var result = await _controller.CreateBook(bookDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);

            // Verify warning logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Invalid model state for book creation")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        // UpdateBook Tests
        [Fact]
        public async Task UpdateBook_ReturnsOkResult_WithUpdatedBook()
        {
            // Arrange
            var bookDto = new BookUpdateDto
            {
                Id = 1,
                Title = "Updated Book",
                Author = "Updated Author",
                PageCount = 250
            };

            var updatedBook = new BookDto
            {
                Id = 1,
                Title = "Updated Book",
                Author = "Updated Author",
                PageCount = 250,
                IsAvailable = true
            };

            _mockBookService.Setup(service => service.UpdateBookAsync(bookDto))
                .ReturnsAsync(updatedBook);

            // Act
            var result = await _controller.UpdateBook(bookDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBook = Assert.IsType<BookDto>(okResult.Value);
            Assert.Equal(updatedBook, returnedBook);

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Updating book with ID: 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Book updated successfully: 1 - Updated Book")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task UpdateBook_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Arrange
            var bookDto = new BookUpdateDto
            {
                Id = 99,
                Title = "Book Does Not Exist",
                Author = "Unknown Author",
                PageCount = 100
            };

            _mockBookService.Setup(service => service.UpdateBookAsync(bookDto))
                .ReturnsAsync((BookDto)null);

            // Act
            var result = await _controller.UpdateBook(bookDto);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);

            // Verify warning logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Book with ID 99 not found for update")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        // DeleteBook Tests
        [Fact]
        public async Task DeleteBook_ReturnsNoContent_WhenBookDeleted()
        {
            // Arrange
            _mockBookService.Setup(service => service.DeleteBookAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteBook(1);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Deleting book with ID: 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Book deleted successfully: 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task DeleteBook_ReturnsNotFound_WhenBookDoesNotExist()
        {
            // Arrange
            _mockBookService.Setup(service => service.DeleteBookAsync(99))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteBook(99);

            // Assert
            Assert.IsType<NotFoundResult>(result);

            // Verify warning logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Book with ID 99 not found for deletion")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        // GetBookReviews Tests
        [Fact]
        public async Task GetBookReviews_ReturnsOkResult_WithReviews()
        {
            // Arrange
            var bookId = 1;

            var reviews = new List<ReviewDto>
            {
                new ReviewDto
                {
                    Id = 1,
                    BookId = bookId,
                    UserId = "user1",
                    UserName = "User 1",
                    Rating = 5,
                    Comment = "Great book!"
                }
            };

            var book = new BookDto
            {
                Id = bookId,
                Title = "Test Book",
                Author = "Test Author"
            };

            // **Ensure the mock returns a book first**
            _mockBookService.Setup(service => service.GetBookByIdAsync(bookId))
                .ReturnsAsync(book);

            _mockReviewService.Setup(service => service.GetReviewsByBookIdAsync(bookId))
                .ReturnsAsync(reviews);

            // Act
            var result = await _controller.GetBookReviews(bookId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedReviews = Assert.IsAssignableFrom<IEnumerable<ReviewDto>>(okResult.Value);
            Assert.Equal(reviews.Count, returnedReviews.Count());

            // Verify logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Retrieving reviews for book ID 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Retrieved 1 reviews for book ID 1")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

    }
}
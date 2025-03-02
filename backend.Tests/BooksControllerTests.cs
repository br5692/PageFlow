using backend.Controllers;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class BooksControllerTests
    {
        private readonly Mock<IBookService> _mockBookService;
        private readonly Mock<ILogger<BooksController>> _mockLogger;

        public BooksControllerTests()
        {
            _mockBookService = new Mock<IBookService>();
            _mockLogger = new Mock<ILogger<BooksController>>();
        }

        [Fact]
        public async Task GetBooks_ReturnsOkResult()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Test Book 1", Author = "Test Author 1" },
                new BookDto { Id = 2, Title = "Test Book 2", Author = "Test Author 2" }
            };

            _mockBookService.Setup(x => x.GetAllBooksAsync())
                .ReturnsAsync(books);

            var controller = new BooksController(_mockBookService.Object);

            // Act
            var result = await controller.GetBooks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBooks = Assert.IsAssignableFrom<IEnumerable<BookDto>>(okResult.Value);
            Assert.Equal(2, returnedBooks.Count());
        }

        [Fact]
        public async Task GetBookById_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var book = new BookDto { Id = 1, Title = "Test Book", Author = "Test Author" };

            _mockBookService.Setup(x => x.GetBookByIdAsync(1))
                .ReturnsAsync(book);

            var controller = new BooksController(_mockBookService.Object);

            // Act
            var result = await controller.GetBookById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedBook = Assert.IsType<BookDto>(okResult.Value);
            Assert.Equal("Test Book", returnedBook.Title);
        }

        [Fact]
        public async Task GetBookById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockBookService.Setup(x => x.GetBookByIdAsync(999))
                .ReturnsAsync((BookDto)null);

            var controller = new BooksController(_mockBookService.Object);

            // Act
            var result = await controller.GetBookById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
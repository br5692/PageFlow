using backend.Controllers;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class BooksControllerTests
    {
        private readonly Mock<IBookService> _mockBookService;
        private readonly Mock<ILogger<BooksController>> _mockLogger;
        private readonly Mock<IReviewService> _mockReviewService;

        public BooksControllerTests()
        {
            _mockBookService = new Mock<IBookService>();
            _mockLogger = new Mock<ILogger<BooksController>>();
            _mockReviewService = new Mock<IReviewService>();
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

            // Use the correct method: GetAllBooksAsync instead of GetFeaturedBooksAsync
            _mockBookService.Setup(x => x.GetAllBooksAsync(null, true, It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(books);

            _mockBookService.Setup(x => x.GetBooksCountAsync())
                .ReturnsAsync(books.Count);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetAllBooks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);

            // Use property pattern matching to access the anonymous object properties
            var resultValue = okResult.Value;

            // Check if the resultValue has a 'books' property using reflection
            var booksProperty = resultValue.GetType().GetProperty("books");
            Assert.NotNull(booksProperty);

            var returnedBooks = (IEnumerable<BookDto>)booksProperty.GetValue(resultValue);
            Assert.Equal(2, returnedBooks.Count());
        }

        [Fact]
        public async Task GetBookById_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var book = new BookDto { Id = 1, Title = "Test Book", Author = "Test Author" };
            _mockBookService.Setup(x => x.GetBookByIdAsync(1))
                .ReturnsAsync(book);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetBookById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBook = Assert.IsType<BookDto>(okResult.Value);
            Assert.Equal("Test Book", returnedBook.Title);
        }

        [Fact]
        public async Task GetBookById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockBookService.Setup(x => x.GetBookByIdAsync(999))
                .ReturnsAsync((BookDto)null);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetBookById(999);

            // Assert
            // Your controller returns NotFoundResult, not NotFoundObjectResult
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetAllBooks_WithSorting_ReturnsCorrectResult()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Book A", Author = "Author A" },
                new BookDto { Id = 2, Title = "Book B", Author = "Author B" }
            };

            // Mock GetAllBooksAsync instead of GetFeaturedBooksAsync
            _mockBookService.Setup(x => x.GetAllBooksAsync(
                "title",
                true,
                It.IsAny<int>(),
                It.IsAny<int>()))
                .ReturnsAsync(books);

            // Also mock the GetBooksCountAsync that should be called
            _mockBookService.Setup(x => x.GetBooksCountAsync())
                .ReturnsAsync(books.Count);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetAllBooks(sortBy: "title", ascending: true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);

            // Use reflection to access the books property
            var booksProperty = okResult.Value.GetType().GetProperty("books");
            Assert.NotNull(booksProperty); // Verify the property exists

            var returnedBooks = Assert.IsAssignableFrom<IEnumerable<BookDto>>(
                booksProperty.GetValue(okResult.Value));
            Assert.Equal(2, returnedBooks.Count());
        }

        [Fact]
        public async Task GetAllBooks_ThrowsException_ReturnsServerError()
        {
            // Arrange
            // This should mock GetAllBooksAsync instead of GetFeaturedBooksAsync
            _mockBookService.Setup(x => x.GetAllBooksAsync(
                It.IsAny<string>(),
                It.IsAny<bool>(),
                It.IsAny<int>(),
                It.IsAny<int>()))
                .ThrowsAsync(new Exception("Test exception"));

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetAllBooks();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetFeaturedBooks_ReturnsOkResult()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Featured Book 1", Author = "Author 1" },
                new BookDto { Id = 2, Title = "Featured Book 2", Author = "Author 2" }
            };

            // Update the setup to match the new signature with default values
            _mockBookService.Setup(x => x.GetFeaturedBooksAsync(5, 0, false))
                .ReturnsAsync(books);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetFeaturedBooks(5);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBooks = Assert.IsAssignableFrom<IEnumerable<BookDto>>(okResult.Value);
            Assert.Equal(2, returnedBooks.Count());
        }

        [Fact]
        public async Task SearchBooks_WithParameters_ReturnsOkResult()
        {
            // Arrange
            var books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "Search Result 1", Author = "Author 1", Category = "Fiction" },
            };

            // Include search count in the mocks
            _mockBookService.Setup(x => x.GetSearchBooksCountAsync(
                "search", "Fiction", "Author 1", true))
                .ReturnsAsync(1);

            // Update the setup to include pagination parameters
            _mockBookService.Setup(x => x.SearchBooksAsync(
                "search",
                "Fiction",
                "Author 1",
                true,
                "title",
                true,
                It.IsAny<int>(),
                It.IsAny<int>()
            ))
            .ReturnsAsync(books);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.SearchBooks("search", "Fiction", "Author 1", true, "title", true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);

            // Use reflection to access the anonymous object properties
            var resultValue = okResult.Value;
            var booksProperty = resultValue.GetType().GetProperty("books");
            Assert.NotNull(booksProperty);

            var returnedBooks = (IEnumerable<BookDto>)booksProperty.GetValue(resultValue);
            Assert.Single(returnedBooks);
        }

        [Fact]
        public async Task CreateBook_WithValidData_ReturnsCreatedResult()
        {
            // Arrange
            var bookDto = new BookCreateDto
            {
                Title = "New Book",
                Author = "New Author",
                ISBN = "1234567890"
            };

            var createdBook = new BookDto
            {
                Id = 1,
                Title = "New Book",
                Author = "New Author",
                ISBN = "1234567890"
            };

            _mockBookService.Setup(x => x.CreateBookAsync(bookDto))
                .ReturnsAsync(createdBook);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Create ClaimsPrincipal with Librarian role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateBook(bookDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(controller.GetBookById), createdAtActionResult.ActionName);
            var returnedBook = Assert.IsType<BookDto>(createdAtActionResult.Value);
            Assert.Equal("New Book", returnedBook.Title);
        }

        [Fact]
        public async Task UpdateBook_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var bookDto = new BookUpdateDto
            {
                Id = 1,
                Title = "Updated Book",
                Author = "Updated Author"
            };

            var updatedBook = new BookDto
            {
                Id = 1,
                Title = "Updated Book",
                Author = "Updated Author"
            };

            _mockBookService.Setup(x => x.UpdateBookAsync(bookDto))
                .ReturnsAsync(updatedBook);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Create ClaimsPrincipal with Librarian role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.UpdateBook(bookDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBook = Assert.IsType<BookDto>(okResult.Value);
            Assert.Equal("Updated Book", returnedBook.Title);
        }

        [Fact]
        public async Task UpdateBook_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var bookDto = new BookUpdateDto
            {
                Id = 999,
                Title = "Updated Book",
                Author = "Updated Author"
            };

            _mockBookService.Setup(x => x.UpdateBookAsync(bookDto))
                .ReturnsAsync((BookDto)null);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Create ClaimsPrincipal with Librarian role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.UpdateBook(bookDto);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task DeleteBook_WithValidId_ReturnsNoContent()
        {
            // Arrange
            _mockBookService.Setup(x => x.DeleteBookAsync(1))
                .ReturnsAsync(true);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Create ClaimsPrincipal with Librarian role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.DeleteBook(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteBook_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockBookService.Setup(x => x.DeleteBookAsync(999))
                .ReturnsAsync(false);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Create ClaimsPrincipal with Librarian role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, "Librarian")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.DeleteBook(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetBookReviews_ReturnsOkResult()
        {
            // Arrange
            var reviews = new List<ReviewDto>
            {
                new ReviewDto { Id = 1, BookId = 1, Rating = 5, Comment = "Great book!" },
                new ReviewDto { Id = 2, BookId = 1, Rating = 4, Comment = "Good read." }
            };

            _mockReviewService.Setup(x => x.GetReviewsByBookIdAsync(1))
                .ReturnsAsync(reviews);

            var controller = new BooksController(_mockBookService.Object, _mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetBookReviews(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedReviews = Assert.IsAssignableFrom<IEnumerable<ReviewDto>>(okResult.Value);
            Assert.Equal(2, returnedReviews.Count());
        }
    }
}
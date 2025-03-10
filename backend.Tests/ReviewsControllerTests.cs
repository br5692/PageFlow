using backend.Controllers;
using backend.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;

namespace backend.Tests
{
    public class ReviewsControllerTests
    {
        private readonly Mock<IReviewService> _mockReviewService;
        private readonly Mock<ILogger<ReviewsController>> _mockLogger;

        public ReviewsControllerTests()
        {
            _mockReviewService = new Mock<IReviewService>();
            _mockLogger = new Mock<ILogger<ReviewsController>>();
        }

        [Fact]
        public async Task GetReviewsByBook_WithEmptyReviews_ReturnsEmptyCollection()
        {
            // Arrange
            _mockReviewService.Setup(x => x.GetReviewsByBookIdAsync(1))
                .ReturnsAsync(new List<ReviewDto>());

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetReviewsByBook(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var reviews = Assert.IsAssignableFrom<IEnumerable<ReviewDto>>(okResult.Value);
            Assert.Empty(reviews);
        }

        [Fact]
        public async Task GetReviewsByBook_WhenExceptionThrown_ReturnsServerError()
        {
            // Arrange
            _mockReviewService.Setup(x => x.GetReviewsByBookIdAsync(1))
                .ThrowsAsync(new Exception("Test exception"));

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Act
            var result = await controller.GetReviewsByBook(1);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("error", statusCodeResult.Value.ToString().ToLower());
        }

        [Fact]
        public async Task CreateReview_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 0, // Invalid rating (below 1)
                Comment = "Bad review"
            };

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Assign a mock authenticated user to the controller context
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Add invalid model state
            controller.ModelState.AddModelError("Rating", "Rating must be between 1 and 5");

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }


        [Fact]
        public async Task CreateReview_WhenUserAlreadyReviewed_ReturnsBadRequest()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 4,
                Comment = "Good book"
            };

            // User has already reviewed this book
            _mockReviewService.Setup(x => x.HasUserReviewedBookAsync("test-user-id", 1))
                .ReturnsAsync(true);

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Set up User Claims with Customer role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("already reviewed", badRequestResult.Value.ToString().ToLower());
        }

        [Fact]
        public async Task CreateReview_WhenBookDoesNotExist_ReturnsServerError()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 999, // Non-existent book
                Rating = 4,
                Comment = "Good book"
            };

            // User has not already reviewed this book
            _mockReviewService.Setup(x => x.HasUserReviewedBookAsync("test-user-id", 999))
                .ReturnsAsync(false);

            // Creating review throws exception due to non-existent book
            _mockReviewService.Setup(x => x.CreateReviewAsync("test-user-id", reviewDto))
                .ThrowsAsync(new KeyNotFoundException("Book not found"));

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Set up User Claims with Customer role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task CreateReview_WhenLibrarianCreatesReview_ShouldSucceed()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 5,
                Comment = "Excellent reference material"
            };

            var createdReview = new ReviewDto
            {
                Id = 1,
                BookId = 1,
                UserId = "librarian-id",
                UserName = "Librarian",
                Rating = 5,
                Comment = "Excellent reference material",
                CreatedAt = DateTime.Now
            };

            // User has not already reviewed this book
            _mockReviewService.Setup(x => x.HasUserReviewedBookAsync("librarian-id", 1))
                .ReturnsAsync(false);

            // Review creation succeeds
            _mockReviewService.Setup(x => x.CreateReviewAsync("librarian-id", reviewDto))
                .ReturnsAsync(createdReview);

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Set up User Claims with both Librarian and Customer roles
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "librarian-id"),
                new Claim(ClaimTypes.Role, "Librarian"),
                new Claim(ClaimTypes.Role, "Customer") // Librarian can also be a customer
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedReview = Assert.IsType<ReviewDto>(createdAtActionResult.Value);
            Assert.Equal(5, returnedReview.Rating);
            Assert.Equal("Excellent reference material", returnedReview.Comment);
        }

        [Fact]
        public async Task CreateReview_WithMaxRating_ShouldSucceed()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 5, // Max rating
                Comment = "Amazing book!"
            };

            var createdReview = new ReviewDto
            {
                Id = 1,
                BookId = 1,
                UserId = "test-user-id",
                UserName = "Test User",
                Rating = 5,
                Comment = "Amazing book!",
                CreatedAt = DateTime.Now
            };

            // User has not already reviewed this book
            _mockReviewService.Setup(x => x.HasUserReviewedBookAsync("test-user-id", 1))
                .ReturnsAsync(false);

            // Review creation succeeds
            _mockReviewService.Setup(x => x.CreateReviewAsync("test-user-id", reviewDto))
                .ReturnsAsync(createdReview);

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Set up User Claims with Customer role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedReview = Assert.IsType<ReviewDto>(createdAtActionResult.Value);
            Assert.Equal(5, returnedReview.Rating);
            Assert.Equal("Amazing book!", returnedReview.Comment);
        }

        [Fact]
        public async Task CreateReview_WithMinRating_ShouldSucceed()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 1, // Min rating
                Comment = "Terrible book!"
            };

            var createdReview = new ReviewDto
            {
                Id = 1,
                BookId = 1,
                UserId = "test-user-id",
                UserName = "Test User",
                Rating = 1,
                Comment = "Terrible book!",
                CreatedAt = DateTime.Now
            };

            // User has not already reviewed this book
            _mockReviewService.Setup(x => x.HasUserReviewedBookAsync("test-user-id", 1))
                .ReturnsAsync(false);

            // Review creation succeeds
            _mockReviewService.Setup(x => x.CreateReviewAsync("test-user-id", reviewDto))
                .ReturnsAsync(createdReview);

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Set up User Claims with Customer role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedReview = Assert.IsType<ReviewDto>(createdAtActionResult.Value);
            Assert.Equal(1, returnedReview.Rating);
            Assert.Equal("Terrible book!", returnedReview.Comment);
        }

        [Fact]
        public async Task CreateReview_WithNoComment_ShouldSucceed()
        {
            // Arrange
            var reviewDto = new ReviewCreateDto
            {
                BookId = 1,
                Rating = 4,
                Comment = null // No comment
            };

            var createdReview = new ReviewDto
            {
                Id = 1,
                BookId = 1,
                UserId = "test-user-id",
                UserName = "Test User",
                Rating = 4,
                Comment = null,
                CreatedAt = DateTime.Now
            };

            // User has not already reviewed this book
            _mockReviewService.Setup(x => x.HasUserReviewedBookAsync("test-user-id", 1))
                .ReturnsAsync(false);

            // Review creation succeeds
            _mockReviewService.Setup(x => x.CreateReviewAsync("test-user-id", reviewDto))
                .ReturnsAsync(createdReview);

            var controller = new ReviewsController(_mockReviewService.Object, _mockLogger.Object);

            // Set up User Claims with Customer role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateReview(reviewDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedReview = Assert.IsType<ReviewDto>(createdAtActionResult.Value);
            Assert.Equal(4, returnedReview.Rating);
            Assert.Null(returnedReview.Comment);
        }
    }
}
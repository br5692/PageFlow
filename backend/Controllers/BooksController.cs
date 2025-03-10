using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IReviewService _reviewService;
        private readonly ILogger<BooksController> _logger;

        public BooksController(
            IBookService bookService,
            IReviewService reviewService,
            ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _reviewService = reviewService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetAllBooks(
            [FromQuery] string? sortBy = null,
            [FromQuery] bool ascending = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
            )
        {
            try
            {
                _logger.LogInformation("Getting all books with sortBy: {SortBy}, ascending: {Ascending}, page: {Page}, pageSize: {PageSize}",
                    sortBy, ascending, page, pageSize);
                var (books, totalCount) = await _bookService.GetAllBooksAsync(sortBy, ascending, page, pageSize);

                _logger.LogInformation("Retrieved {Count} books successfully", books.Count());
                return Ok(new
                {
                    data = books,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all books: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetFeaturedBooks(
            [FromQuery] int count = 10,
            [FromQuery] decimal minRating = 0,
            [FromQuery] bool availableOnly = false
            )
        {
            try
            {
                _logger.LogInformation("Getting {Count} featured books with minRating: {MinRating}, availableOnly: {AvailableOnly}",
                    count, minRating, availableOnly);
                var (books, totalCount) = await _bookService.GetFeaturedBooksAsync(count, minRating, availableOnly);

                _logger.LogInformation("Retrieved {Count} featured books successfully", books.Count());
                return Ok(new
                {
                    data = books,
                    totalCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured books");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<BookDto>>> SearchBooks(
            [FromQuery] string query = "",
            [FromQuery] string? category = null,
            [FromQuery] string? author = null,
            [FromQuery] bool? isAvailable = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] bool ascending = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
            )
        {
            try
            {
                _logger.LogInformation("Searching books with term: {Query}, category: {Category}, author: {Author}, isAvailable: {IsAvailable}",
                    query, category, author, isAvailable);
                var (books, totalCount) = await _bookService.SearchBooksAsync(
                    query, category, author, isAvailable, sortBy, ascending, page, pageSize);

                _logger.LogInformation("Search completed, found {Count} books matching criteria", books.Count());
                return Ok(new
                {
                    data = books,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching books with query: {Query}", query);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBookById(int id)
        {
            try
            {
                _logger.LogInformation("Getting book with id: {BookId}", id);
                var book = await _bookService.GetBookByIdAsync(id);

                if (book == null)
                {
                    _logger.LogWarning("Book with ID {BookId} not found", id);
                    return NotFound();
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book with ID: {BookId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Librarian")]
        public async Task<ActionResult<BookDto>> CreateBook([FromBody] BookCreateDto bookDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for book creation: {@ModelErrors}",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }
            try
            {
                _logger.LogInformation("Creating new book: {BookTitle} by {BookAuthor}", bookDto.Title, bookDto.Author);
                var createdBook = await _bookService.CreateBookAsync(bookDto);
                _logger.LogInformation("Book created successfully with ID: {BookId}", createdBook.Id);
                return CreatedAtAction(nameof(GetBookById), new { id = createdBook.Id }, createdBook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book: {BookTitle}", bookDto.Title);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut]
        [Authorize(Roles = "Librarian")]
        public async Task<ActionResult<BookDto>> UpdateBook([FromBody] BookUpdateDto bookDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for book update: {@ModelErrors}",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }
            try
            {
                _logger.LogInformation("Updating book with ID: {BookId}", bookDto.Id);
                var updatedBook = await _bookService.UpdateBookAsync(bookDto);

                if (updatedBook == null)
                {
                    _logger.LogWarning("Book with ID {BookId} not found for update", bookDto.Id);
                    return NotFound();
                }

                _logger.LogInformation("Book updated successfully: {BookId} - {BookTitle}", updatedBook.Id, updatedBook.Title);
                return Ok(updatedBook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book with ID: {BookId}", bookDto.Id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Librarian")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            try
            {
                _logger.LogInformation("Deleting book with ID: {BookId}", id);
                var result = await _bookService.DeleteBookAsync(id);

                if (!result)
                {
                    _logger.LogWarning("Book with ID {BookId} not found for deletion", id);
                    return NotFound();
                }

                _logger.LogInformation("Book deleted successfully: {BookId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book with ID: {BookId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/reviews")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetBookReviews(int id)
        {
            try
            {
                _logger.LogInformation("Retrieving reviews for book ID {BookId}", id);
                var reviews = await _reviewService.GetReviewsByBookIdAsync(id);
                _logger.LogInformation("Retrieved {Count} reviews for book ID {BookId}", reviews.Count(), id);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for book with ID: {BookId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
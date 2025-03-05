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
                _logger.LogInformation("Getting all books");
                var (books, totalCount) = await _bookService.GetAllBooksAsync(sortBy, ascending, page, pageSize);

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
                var (books, totalCount) = await _bookService.GetFeaturedBooksAsync(count, minRating, availableOnly);

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
                var (books, totalCount) = await _bookService.SearchBooksAsync(
                    query, category, author, isAvailable, sortBy, ascending, page, pageSize);

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
                var book = await _bookService.GetBookByIdAsync(id);

                if (book == null)
                    return NotFound();

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
                return BadRequest(ModelState);
            try
            {
                var createdBook = await _bookService.CreateBookAsync(bookDto);
                return CreatedAtAction(nameof(GetBookById), new { id = createdBook.Id }, createdBook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut]
        [Authorize(Roles = "Librarian")]
        public async Task<ActionResult<BookDto>> UpdateBook([FromBody] BookUpdateDto bookDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                var updatedBook = await _bookService.UpdateBookAsync(bookDto);

                if (updatedBook == null)
                    return NotFound();

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
                var result = await _bookService.DeleteBookAsync(id);

                if (!result)
                    return NotFound();

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
                var reviews = await _reviewService.GetReviewsByBookIdAsync(id);
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
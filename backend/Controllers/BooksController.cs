using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

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
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error getting all books: {Message}", ex.Message);
                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument error getting all books: {Message}", ex.Message);
                return BadRequest(ex.Message);
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
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error getting featured books: {Message}", ex.Message);
                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument error getting featured books: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured books: {Message}", ex.Message);
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
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error while searching books: {Message}", ex.Message);
                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid search parameters: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching books with query: {Query}", ex.Message);
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
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error getting book with ID {BookId}: {Message}", id, ex.Message);
                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument getting book with ID {BookId}: {Message}", id, ex.Message);
                return BadRequest(ex.Message);
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
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business rule violation while creating book: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error while creating book: {Message}", ex.Message);

                if (ex.Number == 2627 || ex.Number == 2601) // Unique constraint violation
                {
                    return Conflict("A book with the same key information already exists");
                }

                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error creating book: {Message}", ex.Message);
                return StatusCode(503, "Error saving to database");
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
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business rule violation while updating book with ID {BookId}: {Message}", bookDto.Id, ex.Message);
                return BadRequest(ex.Message);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error while updating book with ID {BookId}: {Message}", bookDto.Id, ex.Message);

                if (ex.Number == 2627 || ex.Number == 2601) // Unique constraint violation
                {
                    return Conflict("Update would create a duplicate book");
                }

                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Concurrency conflict updating book with ID {BookId}: {Message}", bookDto.Id, ex.Message);
                return StatusCode(409, "The book was modified by another user. Please refresh and try again.");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error updating book with ID {BookId}: {Message}", bookDto.Id, ex.Message);
                return StatusCode(503, "Error saving to database");
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
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Cannot delete book with ID {BookId}: {Message}", id, ex.Message);
                return BadRequest(ex.Message);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error while deleting book with ID {BookId}: {Message}", id, ex.Message);

                if (ex.Number == 547) // Foreign key constraint violation
                {
                    return Conflict("Cannot delete this book as it is referenced by other records");
                }

                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error deleting book with ID {BookId}: {Message}", id, ex.Message);

                // Check if inner exception is a foreign key constraint violation
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 547)
                {
                    return Conflict("Cannot delete this book as it is referenced by other records");
                }

                return StatusCode(503, "Error deleting from database");
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

                // Check if book exists first
                var book = await _bookService.GetBookByIdAsync(id);
                if (book == null)
                {
                    _logger.LogWarning("Attempted to get reviews for non-existent book ID {BookId}", id);
                    return NotFound();
                }

                var reviews = await _reviewService.GetReviewsByBookIdAsync(id);
                _logger.LogInformation("Retrieved {Count} reviews for book ID {BookId}", reviews.Count(), id);
                return Ok(reviews);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error retrieving reviews for book ID {BookId}: {Message}", id, ex.Message);
                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for book with ID: {BookId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
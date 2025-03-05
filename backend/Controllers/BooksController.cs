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
        public async Task<ActionResult<object>> GetAllBooks(
            [FromQuery] string? sortBy = null,
            [FromQuery] bool ascending = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
            )
        {
            try
            {
                _logger.LogInformation("Getting books page {Page}, size {PageSize}", page, pageSize);

                // Get total count
                var totalCount = await _bookService.GetBooksCountAsync();

                // Get paginated books
                var books = await _bookService.GetAllBooksAsync(sortBy, ascending, page, pageSize);

                return Ok(new
                {
                    books,
                    totalCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting books: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<object>> SearchBooks(
            [FromQuery] string query = "",
            [FromQuery] string? category = null,
            [FromQuery] string? author = null,
            [FromQuery] bool? isAvailable = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] bool ascending = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
            )
        {
            try
            {
                // Get total count
                var totalCount = await _bookService.GetSearchBooksCountAsync(
                    query, category, author, isAvailable);

                // Get paginated search results
                var books = await _bookService.SearchBooksAsync(
                    query, category, author, isAvailable, sortBy, ascending, page, pageSize);

                return Ok(new
                {
                    books,
                    totalCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching books with query: {Query}", query);
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
                var books = await _bookService.GetFeaturedBooksAsync(count, minRating, availableOnly);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured books");
                return StatusCode(500, "Internal server error");
            }
        }

        //[HttpGet("search")]
        //public async Task<ActionResult<IEnumerable<BookDto>>> SearchBooks(
        //    [FromQuery] string query = "",
        //    [FromQuery] string? category = null,
        //    [FromQuery] string? author = null,
        //    [FromQuery] bool? isAvailable = null,
        //    [FromQuery] string? sortBy = null,
        //    [FromQuery] bool ascending = true
        //    )
        //{
        //    try
        //    {
        //        var books = await _bookService.SearchBooksAsync(
        //            query, category, author, isAvailable, sortBy, ascending);
        //        return Ok(books);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error searching books with query: {Query}", query);
        //        return StatusCode(500, "Internal server error");
        //    }
        //}

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

        [HttpGet("quick")]
        public async Task<ActionResult<object>> GetQuickBooks(
            [FromQuery] string? sortBy = null,
            [FromQuery] bool ascending = true)
        {
            try
            {
                _logger.LogInformation("Getting quick books view");

                // Get only total count - fast query
                var totalCount = await _bookService.GetBooksCountAsync();

                // Get just the first 10 books for immediate display
                var books = await _bookService.GetAllBooksAsync(sortBy, ascending, 1, 10);

                // Get a sample of categories and authors for filters (top 20 most common)
                var categories = await _bookService.GetTopCategoriesAsync(20);
                var authors = await _bookService.GetTopAuthorsAsync(20);

                return Ok(new
                {
                    books,
                    totalCount,
                    categories,
                    authors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quick books view: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
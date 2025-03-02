using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        /// <summary>
        /// Retrieves all books from the database.
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        /// <summary>
        /// Retrieves a book by its ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound(new { message = "Book not found." });
            }
            return Ok(book);
        }

        [HttpGet("test-auth")]
        [Authorize]
        public IActionResult TestAuth()
        {
            var identity = HttpContext.User.Identity;
            var claims = (identity as ClaimsIdentity)?.Claims.Select(c => new { c.Type, c.Value }).ToList();

            return Ok(new
            {
                IsAuthenticated = identity?.IsAuthenticated ?? false,
                UserName = identity?.Name,
                Claims = claims
            });
        }
    }
}

using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        [HttpGet]
        [AllowAnonymous] // Allow unauthenticated users to fetch books
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }
    }
}

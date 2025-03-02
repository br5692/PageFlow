using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookService : IBookService
    {
        private readonly LibraryDbContext _context;

        public BookService(LibraryDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all books from the database.
        /// </summary>
        public async Task<IEnumerable<BookDto>> GetAllBooksAsync()
        {
            var books = await _context.Books
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    ISBN = b.ISBN,
                    PublishedDate = b.PublishedDate,
                    Description = b.Description,
                    CoverImage = b.CoverImage,
                    Publisher = b.Publisher,
                    Category = b.Category,
                    PageCount = b.PageCount
                })
                .ToListAsync();

            return books;
        }
    }
}

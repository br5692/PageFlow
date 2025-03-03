using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

public class BookService : IBookService
{
    private readonly LibraryDbContext _context;

    public BookService(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BookDto>> GetAllBooksAsync(string? sortBy = null, bool ascending = true)
    {
        var query = _context.Books.AsQueryable();

        // Apply sorting if specified
        if (!string.IsNullOrEmpty(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "title" => ascending ? query.OrderBy(b => b.Title) : query.OrderByDescending(b => b.Title),
                "author" => ascending ? query.OrderBy(b => b.Author) : query.OrderByDescending(b => b.Author),
                "availability" => ascending ? query.OrderBy(b => b.IsAvailable) : query.OrderByDescending(b => b.IsAvailable),
                _ => query.OrderBy(b => b.Id)
            };
        }

        return await query
            .Include(b => b.Reviews)
            .Select(b => MapToBookDto(b))
            .ToListAsync();
    }

    public async Task<BookDto?> GetBookByIdAsync(int id)
    {
        var book = await _context.Books
            .Include(b => b.Reviews)
            .FirstOrDefaultAsync(b => b.Id == id);

        return book != null ? MapToBookDto(book) : null;
    }

    public async Task<IEnumerable<BookDto>> SearchBooksAsync(
        string searchTerm,
        string? category = null,
        string? author = null,
        bool? isAvailable = null,
        string? sortBy = null,
        bool ascending = true
        )
    {
        var query = _context.Books.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(b => b.Title.Contains(searchTerm) || b.Author.Contains(searchTerm));
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(b => b.Category == category);
        }

        if (!string.IsNullOrEmpty(author))
        {
            query = query.Where(b => b.Author.Contains(author));
        }

        if (isAvailable.HasValue)
        {
            query = query.Where(b => b.IsAvailable == isAvailable.Value);
        }

        // Apply sorting if specified
        if (!string.IsNullOrEmpty(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "title" => ascending ? query.OrderBy(b => b.Title) : query.OrderByDescending(b => b.Title),
                "author" => ascending ? query.OrderBy(b => b.Author) : query.OrderByDescending(b => b.Author),
                "availability" => ascending ? query.OrderBy(b => b.IsAvailable) : query.OrderByDescending(b => b.IsAvailable),
                _ => query.OrderBy(b => b.Id)
            };
        }

        return await query
            .Include(b => b.Reviews)
            .Select(b => MapToBookDto(b))
            .ToListAsync();
    }

    public async Task<IEnumerable<BookDto>> GetFeaturedBooksAsync(int count)
    {
        return await _context.Books
            .Include(b => b.Reviews)
            .OrderBy(b => Guid.NewGuid()) // Random order
            .Take(count)
            .Select(b => MapToBookDto(b))
            .ToListAsync();
    }

    public async Task<BookDto> CreateBookAsync(BookCreateDto bookDto)
    {
        var book = new Book
        {
            Title = bookDto.Title,
            Author = bookDto.Author,
            ISBN = bookDto.ISBN,
            Description = bookDto.Description,
            CoverImage = bookDto.CoverImage,
            Publisher = bookDto.Publisher,
            PublishedDate = bookDto.PublishedDate,
            Category = bookDto.Category,
            PageCount = bookDto.PageCount,
            IsAvailable = true
        };

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return MapToBookDto(book);
    }

    public async Task<BookDto?> UpdateBookAsync(BookUpdateDto bookDto)
    {
        var book = await _context.Books.FindAsync(bookDto.Id);

        if (book == null)
            return null;

        book.Title = bookDto.Title;
        book.Author = bookDto.Author;
        book.ISBN = bookDto.ISBN;
        book.Description = bookDto.Description;
        book.CoverImage = bookDto.CoverImage;
        book.Publisher = bookDto.Publisher;
        book.PublishedDate = bookDto.PublishedDate;
        book.Category = bookDto.Category;
        book.PageCount = bookDto.PageCount;

        await _context.SaveChangesAsync();

        return MapToBookDto(book);
    }

    public async Task<bool> DeleteBookAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
            return false;

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> IsBookAvailableAsync(int bookId)
    {
        var book = await _context.Books.FindAsync(bookId);
        return book?.IsAvailable ?? false;
    }

    private static BookDto MapToBookDto(Book book)
    {
        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            ISBN = book.ISBN,
            PublishedDate = book.PublishedDate,
            Description = book.Description,
            CoverImage = book.CoverImage,
            Publisher = book.Publisher,
            Category = book.Category,
            PageCount = book.PageCount,
            IsAvailable = book.IsAvailable,
            AverageRating = book.Reviews.Any() ? (decimal)book.Reviews.Average(r => r.Rating) : 0
        };
    }
}
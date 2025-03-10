using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class BookService : IBookService
{
    private readonly LibraryDbContext _context;
    private readonly ILogger<BookService> _logger;

    public BookService(LibraryDbContext context, ILogger<BookService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<(IEnumerable<BookDto> Books, int TotalCount)> GetAllBooksAsync(string? sortBy = null, bool ascending = true, int page = 1, int pageSize = 20)
    {
        _logger.LogInformation("Getting all books with sortBy: {SortBy}, ascending: {Ascending}, page: {Page}, pageSize: {PageSize}",
            sortBy, ascending, page, pageSize);

        var query = _context.Books.AsQueryable();

        // Apply sorting
        if (!string.IsNullOrEmpty(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "title" => ascending ? query.OrderBy(b => b.Title) : query.OrderByDescending(b => b.Title),
                "author" => ascending ? query.OrderBy(b => b.Author) : query.OrderByDescending(b => b.Author),
                "availability" => ascending ? query.OrderBy(b => b.IsAvailable) : query.OrderByDescending(b => b.IsAvailable),
                _ => query.OrderBy(b => b.Id)
            };

            _logger.LogDebug("Applied sorting: {SortBy}, {Direction}", sortBy, ascending ? "ascending" : "descending");
        }

        // Get total count before pagination
        int totalCount = await query.CountAsync();
        _logger.LogDebug("Total book count: {TotalCount}", totalCount);

        // Apply pagination
        var paginatedQuery = query.Skip((page - 1) * pageSize).Take(pageSize);

        // Optimize to avoid loading all reviews
        var books = await paginatedQuery
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
                PageCount = b.PageCount,
                IsAvailable = b.IsAvailable,
                // Calculate average rating without loading all reviews
                AverageRating = b.Reviews.Any() ? (decimal)b.Reviews.Average(r => r.Rating) : 0
            })
            .ToListAsync();

        _logger.LogInformation("Retrieved {Count} books successfully", books.Count);
        return (books, totalCount);
    }

    public async Task<BookDto?> GetBookByIdAsync(int id)
    {
        _logger.LogInformation("Getting book with id: {BookId}", id);

        var book = await _context.Books
            .Include(b => b.Reviews)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
        {
            _logger.LogWarning("Book with id {BookId} not found", id);
            return null;
        }

        _logger.LogDebug("Found book: {BookTitle} (ID: {BookId})", book.Title, book.Id);
        return MapToBookDto(book);
    }

    public async Task<(IEnumerable<BookDto> Books, int TotalCount)> SearchBooksAsync(
    string searchTerm,
    string? category = null,
    string? author = null,
    bool? isAvailable = null,
    string? sortBy = null,
    bool ascending = true,
    int page = 1,
    int pageSize = 20)
    {
        _logger.LogInformation("Searching books with term: {SearchTerm}, category: {Category}, author: {Author}, isAvailable: {IsAvailable}",
            searchTerm, category, author, isAvailable);

        var query = _context.Books.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(b => b.Title.Contains(searchTerm) || b.Author.Contains(searchTerm));
            _logger.LogDebug("Applied search term filter: {SearchTerm}", searchTerm);
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(b => b.Category == category);
            _logger.LogDebug("Applied category filter: {Category}", category);
        }

        if (!string.IsNullOrEmpty(author))
        {
            query = query.Where(b => b.Author.Contains(author));
            _logger.LogDebug("Applied author filter: {Author}", author);
        }

        if (isAvailable.HasValue)
        {
            query = query.Where(b => b.IsAvailable == isAvailable.Value);
            _logger.LogDebug("Applied availability filter: {IsAvailable}", isAvailable.Value);
        }

        // Apply sorting
        if (!string.IsNullOrEmpty(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "title" => ascending ? query.OrderBy(b => b.Title) : query.OrderByDescending(b => b.Title),
                "author" => ascending ? query.OrderBy(b => b.Author) : query.OrderByDescending(b => b.Author),
                "availability" => ascending ? query.OrderBy(b => b.IsAvailable) : query.OrderByDescending(b => b.IsAvailable),
                _ => query.OrderBy(b => b.Id)
            };

            _logger.LogDebug("Applied sorting: {SortBy}, {Direction}", sortBy, ascending ? "ascending" : "descending");
        }

        // Get total count before pagination
        int totalCount = await query.CountAsync();
        _logger.LogDebug("Total search results count: {TotalCount}", totalCount);

        // Apply pagination
        var paginatedQuery = query.Skip((page - 1) * pageSize).Take(pageSize);

        // Optimize review loading
        var books = await paginatedQuery
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
                PageCount = b.PageCount,
                IsAvailable = b.IsAvailable,
                AverageRating = b.Reviews.Any() ? (decimal)b.Reviews.Average(r => r.Rating) : 0
            })
            .ToListAsync();

        _logger.LogInformation("Search completed, found {Count} books matching criteria", books.Count);
        return (books, totalCount);
    }

    public async Task<(IEnumerable<BookDto> Books, int TotalCount)> GetFeaturedBooksAsync(
    int count,
    decimal minRating = 0,
    bool availableOnly = false)
    {
        _logger.LogInformation("Getting {Count} featured books with minRating: {MinRating}, availableOnly: {AvailableOnly}",
            count, minRating, availableOnly);

        var query = _context.Books.AsQueryable();

        // Apply filters
        if (minRating > 0)
        {
            query = query.Where(b => b.Reviews.Any() &&
                (decimal)b.Reviews.Average(r => r.Rating) >= minRating);
            _logger.LogDebug("Applied minimum rating filter: {MinRating}", minRating);
        }

        if (availableOnly)
        {
            query = query.Where(b => b.IsAvailable);
            _logger.LogDebug("Applied availability filter");
        }

        // Get total count
        int totalCount = await query.CountAsync();
        _logger.LogDebug("Total books matching featured criteria: {TotalCount}", totalCount);

        // More efficient random selection
        int totalBooks = totalCount;
        int skip = 0;

        if (totalBooks > count)
        {
            // Only generate random offset if we have more books than requested
            skip = new Random().Next(0, totalBooks - count);
            _logger.LogDebug("Randomly skipping {SkipCount} books", skip);
        }

        var featuredBooks = await query
            .Skip(skip)
            .Take(count)
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
                PageCount = b.PageCount,
                IsAvailable = b.IsAvailable,
                AverageRating = b.Reviews.Any() ? (decimal)b.Reviews.Average(r => r.Rating) : 0
            })
            .ToListAsync();

        _logger.LogInformation("Retrieved {Count} featured books successfully", featuredBooks.Count);
        return (featuredBooks, totalCount);
    }

    public async Task<BookDto> CreateBookAsync(BookCreateDto bookDto)
    {
        _logger.LogInformation("Creating new book: {BookTitle} by {BookAuthor}", bookDto.Title, bookDto.Author);

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

        try
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Book created successfully with ID: {BookId}", book.Id);
            return MapToBookDto(book);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating book {BookTitle}", bookDto.Title);
            throw;
        }
    }

    public async Task<BookDto?> UpdateBookAsync(BookUpdateDto bookDto)
    {
        _logger.LogInformation("Updating book with ID: {BookId}", bookDto.Id);

        var book = await _context.Books.FindAsync(bookDto.Id);

        if (book == null)
        {
            _logger.LogWarning("Book with ID {BookId} not found for update", bookDto.Id);
            return null;
        }

        try
        {
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
            _logger.LogInformation("Book updated successfully: {BookId} - {BookTitle}", book.Id, book.Title);
            return MapToBookDto(book);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating book {BookId}", bookDto.Id);
            throw;
        }
    }

    public async Task<bool> DeleteBookAsync(int id)
    {
        _logger.LogInformation("Deleting book with ID: {BookId}", id);

        var book = await _context.Books.FindAsync(id);

        if (book == null)
        {
            _logger.LogWarning("Book with ID {BookId} not found for deletion", id);
            return false;
        }

        try
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Book deleted successfully: {BookId} - {BookTitle}", id, book.Title);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting book {BookId}", id);
            throw;
        }
    }

    public async Task<bool> IsBookAvailableAsync(int bookId)
    {
        _logger.LogInformation("Checking availability of book with ID: {BookId}", bookId);

        var book = await _context.Books.FindAsync(bookId);

        if (book == null)
        {
            _logger.LogWarning("Book with ID {BookId} not found when checking availability", bookId);
            return false;
        }

        _logger.LogDebug("Book {BookId} availability status: {IsAvailable}", bookId, book.IsAvailable);
        return book.IsAvailable;
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
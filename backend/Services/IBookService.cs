using backend.DTOs;

public interface IBookService
{
    Task<(IEnumerable<BookDto> Books, int TotalCount)> GetAllBooksAsync(string? sortBy = null, bool ascending = true, int page = 1, int pageSize = 20);
    Task<BookDto?> GetBookByIdAsync(int id);
    Task<(IEnumerable<BookDto> Books, int TotalCount)> GetFeaturedBooksAsync(int count, decimal minRating = 0, bool availableOnly = false);
    Task<BookDto> CreateBookAsync(BookCreateDto bookDto);
    Task<BookDto?> UpdateBookAsync(BookUpdateDto bookDto);
    Task<bool> DeleteBookAsync(int id);
    Task<bool> IsBookAvailableAsync(int bookId);
    Task<(IEnumerable<BookDto> Books, int TotalCount)> SearchBooksAsync(
        string searchTerm,
        string? category = null,
        string? author = null,
        bool? isAvailable = null,
        string? sortBy = null,
        bool ascending = true,
        int page = 1,
        int pageSize = 20);
}
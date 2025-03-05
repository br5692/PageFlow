using backend.DTOs;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetAllBooksAsync(string? sortBy = null, bool ascending = true, int page = 1, int pageSize = 10);
    Task<int> GetBooksCountAsync();
    Task<BookDto?> GetBookByIdAsync(int id);
    Task<IEnumerable<BookDto>> SearchBooksAsync(
        string searchTerm,
        string? category = null,
        string? author = null,
        bool? isAvailable = null,
        string? sortBy = null,
        bool ascending = true,
        int page = 1,
        int pageSize = 10);
    Task<int> GetSearchBooksCountAsync(
        string searchTerm,
        string? category = null,
        string? author = null,
        bool? isAvailable = null);
    Task<IEnumerable<BookDto>> GetFeaturedBooksAsync(
        int count = 10,
        decimal minRating = 0,
        bool availableOnly = false);
    Task<BookDto> CreateBookAsync(BookCreateDto bookDto);
    Task<BookDto?> UpdateBookAsync(BookUpdateDto bookDto);
    Task<bool> DeleteBookAsync(int id);
    Task<bool> IsBookAvailableAsync(int bookId);
}
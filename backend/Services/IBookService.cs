using backend.DTOs;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetAllBooksAsync();
    Task<BookDto?> GetBookByIdAsync(int id);
    Task<IEnumerable<BookDto>> SearchBooksAsync(string searchTerm, string? category = null, string? author = null);
    Task<IEnumerable<BookDto>> GetFeaturedBooksAsync(int count);
    Task<BookDto> CreateBookAsync(BookCreateDto bookDto);
    Task<BookDto?> UpdateBookAsync(BookUpdateDto bookDto);
    Task<bool> DeleteBookAsync(int id);
    Task<bool> IsBookAvailableAsync(int bookId);
}
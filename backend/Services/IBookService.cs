using backend.DTOs;

namespace backend.Services
{
    public interface IBookService
    {
        Task<IEnumerable<BookDto>> GetAllBooksAsync();
    }
}

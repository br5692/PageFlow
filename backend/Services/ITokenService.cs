using backend.Models;

namespace backend.Services
{
    public interface ITokenService
    {
        Task<string> GenerateTokenAsync(LibraryUser user);
    }
}

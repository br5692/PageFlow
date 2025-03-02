using backend.DTOs;

namespace backend.Services
{
    public interface ICheckoutService
    {
        Task<CheckoutDto> CheckoutBookAsync(string userId, int bookId);
        Task<CheckoutDto?> ReturnBookAsync(int checkoutId);
        Task<IEnumerable<CheckoutDto>> GetUserCheckoutsAsync(string userId);
        Task<IEnumerable<CheckoutDto>> GetAllActiveCheckoutsAsync();
        Task<CheckoutDto?> GetCheckoutByIdAsync(int id);
    }
}

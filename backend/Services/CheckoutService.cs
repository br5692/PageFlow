using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CheckoutService : ICheckoutService
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<CheckoutService> _logger;

        public CheckoutService(LibraryDbContext context, ILogger<CheckoutService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CheckoutDto> CheckoutBookAsync(string userId, int bookId)
        {
            // Check if book exists and is available
            var book = await _context.Books.FindAsync(bookId);

            if (book == null)
                throw new KeyNotFoundException("Book not found");

            if (!book.IsAvailable)
                throw new InvalidOperationException("Book is not available for checkout");

            // Create the checkout
            var checkout = new Checkout
            {
                BookId = bookId,
                LibraryUserId = userId,
                CheckoutDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(5) // 5 days checkout period as per requirements
            };

            // Update book availability
            book.IsAvailable = false;

            _context.Checkouts.Add(checkout);
            await _context.SaveChangesAsync();

            // Load related entities for the response
            await _context.Entry(checkout)
                .Reference(c => c.Book)
                .LoadAsync();

            await _context.Entry(checkout)
                .Reference(c => c.LibraryUser)
                .LoadAsync();

            return MapToCheckoutDto(checkout);
        }

        public async Task<CheckoutDto?> ReturnBookAsync(int checkoutId)
        {
            // Find the checkout
            var checkout = await _context.Checkouts
                .Include(c => c.Book)
                .Include(c => c.LibraryUser)
                .FirstOrDefaultAsync(c => c.Id == checkoutId);

            if (checkout == null || checkout.ReturnDate.HasValue)
                return null;

            // Update checkout and book
            checkout.ReturnDate = DateTime.UtcNow;
            checkout.Book.IsAvailable = true;

            await _context.SaveChangesAsync();

            return MapToCheckoutDto(checkout);
        }

        public async Task<IEnumerable<CheckoutDto>> GetUserCheckoutsAsync(string userId)
        {
            var checkouts = await _context.Checkouts
                .Include(c => c.Book)
                .Include(c => c.LibraryUser)
                .Where(c => c.LibraryUserId == userId)
                .ToListAsync();

            return checkouts.Select(MapToCheckoutDto);
        }

        public async Task<IEnumerable<CheckoutDto>> GetAllActiveCheckoutsAsync()
        {
            var checkouts = await _context.Checkouts
                .Include(c => c.Book)
                .Include(c => c.LibraryUser)
                .Where(c => !c.ReturnDate.HasValue)
                .ToListAsync();

            return checkouts.Select(MapToCheckoutDto);
        }

        public async Task<CheckoutDto?> GetCheckoutByIdAsync(int id)
        {
            var checkout = await _context.Checkouts
                .Include(c => c.Book)
                .Include(c => c.LibraryUser)
                .FirstOrDefaultAsync(c => c.Id == id);

            return checkout != null ? MapToCheckoutDto(checkout) : null;
        }

        private static CheckoutDto MapToCheckoutDto(Checkout checkout)
        {
            return new CheckoutDto
            {
                Id = checkout.Id,
                BookId = checkout.BookId,
                BookTitle = checkout.Book.Title,
                UserId = checkout.LibraryUserId,
                UserName = checkout.LibraryUser.UserName,
                CheckoutDate = checkout.CheckoutDate,
                DueDate = checkout.CheckoutDate.AddDays(5), // Ensure 5 days checkout period
                ReturnDate = checkout.ReturnDate
            };
        }
    }
}

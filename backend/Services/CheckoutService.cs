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
            _logger.LogInformation("Attempting to checkout book {BookId} for user {UserId}", bookId, userId);

            // Check if book exists and is available
            var book = await _context.Books.FindAsync(bookId);

            if (book == null)
            {
                _logger.LogWarning("Checkout failed: Book {BookId} not found", bookId);
                throw new KeyNotFoundException($"Book with ID {bookId} not found");
            }

            if (!book.IsAvailable)
            {
                _logger.LogWarning("Checkout failed: Book {BookId} ({BookTitle}) is not available", bookId, book.Title);
                throw new InvalidOperationException($"Book with ID {bookId} is not available for checkout");
            }

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

            try
            {
                _context.Checkouts.Add(checkout);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Book {BookId} ({BookTitle}) successfully checked out by user {UserId}",
                    bookId, book.Title, userId);

                // Load related entities for the response
                await _context.Entry(checkout)
                    .Reference(c => c.Book)
                    .LoadAsync();

                await _context.Entry(checkout)
                    .Reference(c => c.LibraryUser)
                    .LoadAsync();

                return MapToCheckoutDto(checkout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking out book {BookId} for user {UserId}", bookId, userId);
                throw;
            }
        }

        public async Task<CheckoutDto?> ReturnBookAsync(int checkoutId)
        {
            _logger.LogInformation("Attempting to return book for checkout {CheckoutId}", checkoutId);

            // Find the checkout
            var checkout = await _context.Checkouts
                .Include(c => c.Book)
                .Include(c => c.LibraryUser)
                .FirstOrDefaultAsync(c => c.Id == checkoutId);

            if (checkout == null)
            {
                _logger.LogWarning("Return failed: Checkout {CheckoutId} not found", checkoutId);
                return null;
            }

            if (checkout.ReturnDate.HasValue)
            {
                _logger.LogWarning("Return failed: Book for checkout {CheckoutId} already returned on {ReturnDate}",
                    checkoutId, checkout.ReturnDate);
                return null;
            }

            try
            {
                // Update checkout and book
                checkout.ReturnDate = DateTime.UtcNow;
                checkout.Book.IsAvailable = true;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Book {BookId} ({BookTitle}) successfully returned for checkout {CheckoutId} by user {UserId}",
                    checkout.BookId, checkout.Book.Title, checkoutId, checkout.LibraryUserId);

                return MapToCheckoutDto(checkout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while returning book for checkout {CheckoutId}", checkoutId);
                throw;
            }
        }

        public async Task<IEnumerable<CheckoutDto>> GetUserCheckoutsAsync(string userId)
        {
            _logger.LogInformation("Retrieving active checkouts for user {UserId}", userId);

            try
            {
                var checkouts = await _context.Checkouts
                    .Include(c => c.Book)
                    .Include(c => c.LibraryUser)
                    .Where(c => c.LibraryUserId == userId && !c.ReturnDate.HasValue)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} active checkouts for user {UserId}", checkouts.Count, userId);
                return checkouts.Select(MapToCheckoutDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving checkouts for user {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<CheckoutDto>> GetAllActiveCheckoutsAsync()
        {
            _logger.LogInformation("Retrieving all active checkouts");

            try
            {
                var checkouts = await _context.Checkouts
                    .Include(c => c.Book)
                    .Include(c => c.LibraryUser)
                    .Where(c => !c.ReturnDate.HasValue)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} active checkouts", checkouts.Count);
                return checkouts.Select(MapToCheckoutDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving all active checkouts");
                throw;
            }
        }

        public async Task<CheckoutDto?> GetCheckoutByIdAsync(int id)
        {
            _logger.LogInformation("Retrieving checkout {CheckoutId}", id);

            try
            {
                var checkout = await _context.Checkouts
                    .Include(c => c.Book)
                    .Include(c => c.LibraryUser)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (checkout == null)
                {
                    _logger.LogWarning("Checkout {CheckoutId} not found", id);
                    return null;
                }

                _logger.LogInformation("Successfully retrieved checkout {CheckoutId} for book {BookId} by user {UserId}",
                    id, checkout.BookId, checkout.LibraryUserId);

                return MapToCheckoutDto(checkout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving checkout {CheckoutId}", id);
                throw;
            }
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
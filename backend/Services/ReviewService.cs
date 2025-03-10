using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class ReviewService : IReviewService
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(LibraryDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByBookIdAsync(int bookId)
        {
            try
            {
                _logger.LogInformation("Retrieving reviews for book ID {BookId}", bookId);

                var reviews = await _context.Reviews
                    .Include(r => r.LibraryUser)
                    .Where(r => r.BookId == bookId)
                    .Select(r => new ReviewDto
                    {
                        Id = r.Id,
                        BookId = r.BookId,
                        UserId = r.LibraryUserId,
                        UserName = r.LibraryUser.UserName,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} reviews for book ID {BookId}", reviews.Count, bookId);
                return reviews;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for book ID {BookId}", bookId);
                throw;
            }
        }

        public async Task<ReviewDto> CreateReviewAsync(string userId, ReviewCreateDto reviewDto)
        {
            try
            {
                _logger.LogInformation("Creating review for book ID {BookId} by user {UserId}", reviewDto.BookId, userId);

                // Validate the book exists
                var bookExists = await _context.Books.AnyAsync(b => b.Id == reviewDto.BookId);
                if (!bookExists)
                {
                    _logger.LogWarning("Attempted to review non-existent book with ID {BookId} by user {UserId}", reviewDto.BookId, userId);
                    throw new InvalidOperationException($"Book with ID {reviewDto.BookId} does not exist");
                }

                // Check if user has already reviewed this book
                if (await HasUserReviewedBookAsync(userId, reviewDto.BookId))
                {
                    _logger.LogWarning("User {UserId} attempted to review book {BookId} multiple times", userId, reviewDto.BookId);
                    throw new InvalidOperationException("User has already reviewed this book");
                }

                var review = new Review
                {
                    BookId = reviewDto.BookId,
                    LibraryUserId = userId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Load the user info for the response
                await _context.Entry(review)
                    .Reference(r => r.LibraryUser)
                    .LoadAsync();

                _logger.LogInformation("Review created with ID {ReviewId} for book {BookId} by user {UserId}", review.Id, review.BookId, userId);

                return new ReviewDto
                {
                    Id = review.Id,
                    BookId = review.BookId,
                    UserId = review.LibraryUserId,
                    UserName = review.LibraryUser.UserName,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for book ID {BookId} by user {UserId}", reviewDto.BookId, userId);
                throw;
            }
        }

        public async Task<bool> HasUserReviewedBookAsync(string userId, int bookId)
        {
            try
            {
                _logger.LogDebug("Checking if user {UserId} has reviewed book {BookId}", userId, bookId);

                var hasReviewed = await _context.Reviews
                    .AnyAsync(r => r.LibraryUserId == userId && r.BookId == bookId);

                _logger.LogDebug("User {UserId} has{HasNot} reviewed book {BookId}",
                    userId, hasReviewed ? "" : " not", bookId);

                return hasReviewed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} has reviewed book {BookId}", userId, bookId);
                throw;
            }
        }
    }
}
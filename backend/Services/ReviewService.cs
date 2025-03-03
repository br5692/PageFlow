using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ReviewService : IReviewService
    {
        private readonly LibraryDbContext _context;

        public ReviewService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByBookIdAsync(int bookId)
        {
            return await _context.Reviews
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
        }

        public async Task<ReviewDto> CreateReviewAsync(string userId, ReviewCreateDto reviewDto)
        {
            // Add this check to validate the book exists
            var bookExists = await _context.Books.AnyAsync(b => b.Id == reviewDto.BookId);
            if (!bookExists)
            {
                throw new InvalidOperationException($"Book with ID {reviewDto.BookId} does not exist");
            }

            // Check if user has already reviewed this book
            if (await HasUserReviewedBookAsync(userId, reviewDto.BookId))
            {
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

        public async Task<bool> HasUserReviewedBookAsync(string userId, int bookId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.LibraryUserId == userId && r.BookId == bookId);
        }
    }
}

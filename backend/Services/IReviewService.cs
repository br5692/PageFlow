using backend.DTOs;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetReviewsByBookIdAsync(int bookId);
    Task<ReviewDto> CreateReviewAsync(string userId, ReviewCreateDto reviewDto);
    Task<bool> HasUserReviewedBookAsync(string userId, int bookId);
}
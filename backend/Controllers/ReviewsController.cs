using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByBook(int bookId)
        {
            try
            {
                var reviews = await _reviewService.GetReviewsByBookIdAsync(bookId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for book ID {BookId}", bookId);
                return StatusCode(500, "An error occurred while retrieving reviews");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] ReviewCreateDto reviewDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

                if (await _reviewService.HasUserReviewedBookAsync(userId, reviewDto.BookId))
                {
                    return BadRequest(new { message = "You have already reviewed this book" });
                }

                var review = await _reviewService.CreateReviewAsync(userId, reviewDto);
                return CreatedAtAction(nameof(GetReviewsByBook), new { bookId = review.BookId }, review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, "An error occurred while creating the review");
            }
        }
    }
}

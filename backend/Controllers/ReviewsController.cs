﻿using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
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
            _logger.LogInformation("Retrieving reviews for book ID {BookId}", bookId);
            try
            {
                var reviews = await _reviewService.GetReviewsByBookIdAsync(bookId);
                _logger.LogInformation("Retrieved {Count} reviews for book ID {BookId}", reviews.Count(), bookId);
                return Ok(reviews);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error retrieving reviews for book ID {BookId}: {Message}", bookId, ex.Message);
                return StatusCode(500, "An error occurred while retrieving reviews");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for book ID {BookId}", bookId);
                return StatusCode(500, "An internal error occurred");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] ReviewCreateDto reviewDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _logger.LogInformation("Creating review for book ID {BookId} by user {UserId}", reviewDto.BookId, userId);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for review creation: {@ModelErrors}",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }

            try
            {
                // Check if user has already reviewed this book
                if (await _reviewService.HasUserReviewedBookAsync(userId, reviewDto.BookId))
                {
                    _logger.LogWarning("User {UserId} attempted to submit multiple reviews for book {BookId}",
                        userId, reviewDto.BookId);
                    return BadRequest(new { message = "You have already reviewed this book" });
                }

                var review = await _reviewService.CreateReviewAsync(userId, reviewDto);
                _logger.LogInformation("Review created with ID {ReviewId} for book {BookId} by user {UserId}",
                    review.Id, review.BookId, userId);
                return CreatedAtAction(nameof(GetReviewsByBook), new { bookId = review.BookId }, review);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError(ex, "Book not found when creating review for book ID {BookId}", reviewDto.BookId);
                return StatusCode(500, "An error occurred while creating the review");
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error creating review for book ID {BookId}: {Message}", reviewDto.BookId, ex.Message);
                return StatusCode(500, "An error occurred while creating the review");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error creating review for book ID {BookId}: {Message}", reviewDto.BookId, ex.Message);
                return StatusCode(500, "An error occurred while creating the review");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating review for book ID {BookId}", reviewDto.BookId);
                return StatusCode(500, "An error occurred while creating the review");
            }
        }
    }
}
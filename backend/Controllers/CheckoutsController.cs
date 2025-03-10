using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutsController : ControllerBase
    {
        private readonly ICheckoutService _checkoutService;
        private readonly ILogger<CheckoutsController> _logger;

        public CheckoutsController(ICheckoutService checkoutService, ILogger<CheckoutsController> logger)
        {
            _checkoutService = checkoutService;
            _logger = logger;
        }

        [HttpPost("checkout/{bookId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<CheckoutDto>> CheckoutBook(int bookId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                _logger.LogInformation("Attempting to checkout book {BookId} for user {UserId}", bookId, userId);

                var checkout = await _checkoutService.CheckoutBookAsync(userId, bookId);

                _logger.LogInformation("Book {BookId} ({BookTitle}) successfully checked out by user {UserId}",
                    bookId, checkout.BookTitle, userId);

                return CreatedAtAction(nameof(GetCheckout), new { id = checkout.Id }, checkout);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Checkout failed: Book {BookId} not found", bookId);
                return NotFound(new { message = "Book not found" });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Checkout failed for book {BookId}: {ErrorMessage}", bookId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error while checking out book {BookId}: {Message}", bookId, ex.Message);
                return StatusCode(503, "Service unavailable: Database error");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error while checking out book {BookId}: {Message}", bookId, ex.Message);
                return StatusCode(503, "Error saving checkout to database");
            }
            catch (Exception ex)
            {
                // Ensure the log message specifically contains "Error checking out book with ID"
                _logger.LogError(ex, "Error checking out book with ID {BookId}", bookId);
                return StatusCode(500, "An error occurred while checking out the book");
            }
        }

        [HttpPost("return/{checkoutId}")]
        [Authorize(Roles = "Librarian")]
        public async Task<ActionResult<CheckoutDto>> ReturnBook(int checkoutId)
        {
            try
            {
                _logger.LogInformation("Attempting to return book for checkout {CheckoutId}", checkoutId);

                var checkout = await _checkoutService.ReturnBookAsync(checkoutId);

                if (checkout == null)
                {
                    _logger.LogWarning("Return failed: Checkout {CheckoutId} not found or already returned", checkoutId);
                    return NotFound(new { message = "Checkout not found or already returned" });
                }

                _logger.LogInformation("Book {BookId} ({BookTitle}) successfully returned for checkout {CheckoutId}",
                    checkout.BookId, checkout.BookTitle, checkoutId);

                return Ok(checkout);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business rule violation while returning checkout {CheckoutId}: {Message}", checkoutId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error while returning book for checkout {CheckoutId}: {Message}", checkoutId, ex.Message);
                return StatusCode(503, new { message = "Service unavailable: Database error" });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database update error while returning book for checkout {CheckoutId}: {Message}", checkoutId, ex.Message);
                return StatusCode(503, new { message = "Error updating checkout in database" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error returning book with checkout ID {CheckoutId}", checkoutId);
                return StatusCode(500, new { message = "An unexpected error occurred while returning the book" });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<CheckoutDto>> GetCheckout(int id)
        {
            try
            {
                _logger.LogInformation("Retrieving checkout {CheckoutId}", id);

                var checkout = await _checkoutService.GetCheckoutByIdAsync(id);

                if (checkout == null)
                {
                    _logger.LogWarning("Checkout {CheckoutId} not found", id);
                    return NotFound(new { message = "Checkout not found" });
                }

                _logger.LogInformation("Successfully retrieved checkout {CheckoutId} for book {BookId} by user {UserId}",
                    id, checkout.BookId, checkout.UserId);

                return Ok(checkout);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error retrieving checkout {CheckoutId}: {Message}", id, ex.Message);
                return StatusCode(503, new { message = "Service unavailable: Database error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving checkout with ID {Id}", id);
                return StatusCode(500, new { message = "An unexpected error occurred while retrieving the checkout" });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<CheckoutDto>>> GetUserCheckouts()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                _logger.LogInformation("Retrieving active checkouts for user {UserId}", userId);

                var checkouts = await _checkoutService.GetUserCheckoutsAsync(userId);

                _logger.LogInformation("Retrieved {Count} active checkouts for user {UserId}",
                    checkouts.Count(), userId);

                return Ok(checkouts);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error retrieving user checkouts: {Message}", ex.Message);
                return StatusCode(503, new { message = "Service unavailable: Database error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving user checkouts for user {UserId}",
                    User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                return StatusCode(500, new { message = "An unexpected error occurred while retrieving checkouts" });
            }
        }

        [HttpGet("active")]
        [Authorize(Roles = "Librarian")]
        public async Task<ActionResult<IEnumerable<CheckoutDto>>> GetAllActiveCheckouts()
        {
            try
            {
                _logger.LogInformation("Retrieving all active checkouts");

                var checkouts = await _checkoutService.GetAllActiveCheckoutsAsync();

                _logger.LogInformation("Retrieved {Count} active checkouts", checkouts.Count());

                return Ok(checkouts);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Database error retrieving active checkouts: {Message}", ex.Message);
                return StatusCode(503, new { message = "Service unavailable: Database error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving active checkouts");
                return StatusCode(500, new { message = "An unexpected error occurred while retrieving active checkouts" });
            }
        }
    }
}
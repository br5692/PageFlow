using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
                var checkout = await _checkoutService.CheckoutBookAsync(userId, bookId);
                return CreatedAtAction(nameof(GetCheckout), new { id = checkout.Id }, checkout);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Book not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
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
                var checkout = await _checkoutService.ReturnBookAsync(checkoutId);

                if (checkout == null)
                    return NotFound(new { message = "Checkout not found or already returned" });

                return Ok(checkout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error returning book with checkout ID {CheckoutId}", checkoutId);
                return StatusCode(500, "An error occurred while returning the book");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<CheckoutDto>> GetCheckout(int id)
        {
            try
            {
                var checkout = await _checkoutService.GetCheckoutByIdAsync(id);

                if (checkout == null)
                    return NotFound(new { message = "Checkout not found" });

                return Ok(checkout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checkout with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the checkout");
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<CheckoutDto>>> GetUserCheckouts()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var checkouts = await _checkoutService.GetUserCheckoutsAsync(userId);
                return Ok(checkouts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user checkouts");
                return StatusCode(500, "An error occurred while retrieving checkouts");
            }
        }

        [HttpGet("active")]
        [Authorize(Roles = "Librarian")]
        public async Task<ActionResult<IEnumerable<CheckoutDto>>> GetAllActiveCheckouts()
        {
            try
            {
                var checkouts = await _checkoutService.GetAllActiveCheckoutsAsync();
                return Ok(checkouts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active checkouts");
                return StatusCode(500, "An error occurred while retrieving active checkouts");
            }
        }
    }
}

using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public class BookRecommendationService : IBookRecommendationService
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<BookRecommendationService> _logger;
        private readonly Random _random = new Random();

        public BookRecommendationService(LibraryDbContext context, ILogger<BookRecommendationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GenerateResponse(string message)
        {
            _logger.LogInformation("Generating response for message: {Message}", message);

            if (string.IsNullOrWhiteSpace(message))
            {
                return "I'm not sure how to help with that. Type 'help' to see what I can do!";
            }

            var lowerMessage = message.ToLower();

            // Help commands
            if (lowerMessage.Contains("help") || lowerMessage.Contains("commands") || lowerMessage == "?")
            {
                _logger.LogDebug("Returning help command information");
                return "I can help you find books! Try asking:\n" +
                       "- Recommend a book\n" +
                       "- Find books by [author name]\n" +
                       "- How to checkout a book";
            }

            // Greetings - Make pattern more specific to avoid false positives
            if (lowerMessage == "hello" || lowerMessage == "hi" || lowerMessage == "hey" ||
                lowerMessage.StartsWith("hello ") || lowerMessage.StartsWith("hi ") || lowerMessage.StartsWith("hey "))
            {
                _logger.LogDebug("Returning greeting response");
                return "Hello! I'm BookBot, your library assistant. How can I help you find your next great read?";
            }

            // Book recommendations
            if (lowerMessage.Contains("recommend") || lowerMessage.Contains("suggestion"))
            {
                _logger.LogDebug("User requested book recommendation");
                return await RecommendRandomBook();
            }

            // Author search
            if (lowerMessage.Contains("by author") || lowerMessage.Contains("books by"))
            {
                var authorPattern = @"by\s+([a-zA-Z\s]+)";
                var match = Regex.Match(message, authorPattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    var author = match.Groups[1].Value.Trim();
                    _logger.LogDebug("User requested books by author: {Author}", author);
                    return await FindBooksByAuthor(author);
                }
            }

            // Popular books
            if (lowerMessage.Contains("popular") || lowerMessage.Contains("top rated"))
            {
                _logger.LogDebug("User requested popular books");
                return await GetPopularBooks();
            }

            // Checkout help
            if (lowerMessage.Contains("checkout") || lowerMessage.Contains("borrow"))
            {
                _logger.LogDebug("User requested checkout information");
                return "To checkout a book: Browse to the book details page and click the 'Check Out Book' button. " +
                       "You can view your checked out books in the 'My Checkouts' section.";
            }

            // Default response
            _logger.LogInformation("No specific command recognized, returning default response");
            return "I'm not sure how to help with that. Type 'help' to see what I can do!";
        }

        private async Task<string> RecommendRandomBook()
        {
            _logger.LogInformation("Recommending a random book");

            try
            {
                var books = await _context.Books.Where(b => b.IsAvailable).ToListAsync();
                if (!books.Any())
                {
                    _logger.LogWarning("No available books found for recommendation");
                    return "Sorry, there are no available books right now.";
                }

                var book = books[_random.Next(books.Count)];
                _logger.LogInformation("Recommending book: {BookId} - {BookTitle} by {Author}",
                    book.Id, book.Title, book.Author);

                return $"I recommend: \"{book.Title}\" by {book.Author}. " +
                       $"It's a {book.Category} book with {book.PageCount} pages. Check it out!";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while recommending a random book");
                return "Sorry, I encountered an error while finding a book to recommend. Please try again.";
            }
        }

        private async Task<string> FindBooksByAuthor(string author)
        {
            _logger.LogInformation("Finding books by author: {Author}", author);

            try
            {
                // Use case-insensitive comparison for author search
                var books = await _context.Books
                    .Where(b => EF.Functions.Like(b.Author, $"%{author}%"))
                    .Take(3)
                    .ToListAsync();

                if (!books.Any())
                {
                    _logger.LogWarning("No books found for author: {Author}", author);
                    return $"I couldn't find any books by {author}. Try another author?";
                }

                _logger.LogInformation("Found {Count} books by author: {Author}", books.Count, author);
                var response = $"Found {books.Count} books by {author}:\n";
                foreach (var book in books)
                {
                    response += $"- {book.Title} ({(book.IsAvailable ? "Available" : "Checked out")})\n";
                }
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while finding books by author: {Author}", author);
                return $"Sorry, I encountered an error while looking for books by {author}. Please try again.";
            }
        }

        private async Task<string> GetPopularBooks()
        {
            _logger.LogInformation("Getting popular books");

            try
            {
                var booksWithReviews = await _context.Books
                    .Where(b => b.IsAvailable)
                    .Include(b => b.Reviews)
                    .ToListAsync();

                // Calculate average ratings manually
                var booksWithRatings = booksWithReviews
                    .Select(b => new
                    {
                        Book = b,
                        AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0
                    })
                    .Where(b => b.AverageRating > 0)  // Only include books with ratings > 0
                    .OrderByDescending(b => b.AverageRating)
                    .Take(3)
                    .ToList();

                if (!booksWithRatings.Any())
                {
                    _logger.LogWarning("No highly rated books found");
                    return "I couldn't find any highly rated books right now. Try checking out some books and leaving reviews!";
                }

                _logger.LogInformation("Found {Count} popular books", booksWithRatings.Count);
                var response = "Here are some popular books:\n";
                foreach (var item in booksWithRatings)
                {
                    response += $"- {item.Book.Title} by {item.Book.Author} ({item.AverageRating:F1}★)\n";
                }
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting popular books");
                return "Sorry, I encountered an error while finding popular books. Please try again.";
            }
        }
    }
}
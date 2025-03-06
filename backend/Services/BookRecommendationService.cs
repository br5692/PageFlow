using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Collections.Generic;  // Add this for List<string>
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookRecommendationService : IBookRecommendationService
    {
        private readonly LibraryDbContext _context;
        private readonly Random _random = new Random();

        public BookRecommendationService(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateResponse(string message)
        {
            var lowerMessage = message.ToLower();

            // Help commands
            if (lowerMessage.Contains("help") || lowerMessage.Contains("commands") || lowerMessage == "?")
            {
                return "I can help you find books! Try asking:\n" +
                       "- Recommend a book\n" +
                       "- Find books by [author name]\n" +
                       "- Books in [category]\n" +
                       "- Popular books\n" +
                       "- New releases\n" +
                       "- How to checkout a book";
            }

            // Greetings
            if (lowerMessage.Contains("hello") || lowerMessage.Contains("hi") || lowerMessage == "hey")
            {
                return "Hello! I'm BookBot, your library assistant. How can I help you find your next great read?";
            }

            // Book recommendations
            if (lowerMessage.Contains("recommend") || lowerMessage.Contains("suggestion"))
            {
                return await RecommendRandomBook();
            }

            // Author search
            if (lowerMessage.Contains("by author") || lowerMessage.Contains("books by"))
            {
                var authorPattern = @"by\s+([a-zA-Z\s]+)";
                var match = Regex.Match(lowerMessage, authorPattern);
                if (match.Success)
                {
                    var author = match.Groups[1].Value.Trim();
                    return await FindBooksByAuthor(author);
                }
            }

            // Category search
            if (lowerMessage.Contains("category") || lowerMessage.Contains("genre"))
            {
                foreach (var category in await GetCategories())
                {
                    if (lowerMessage.Contains(category.ToLower()))
                    {
                        return await FindBooksByCategory(category);
                    }
                }
            }

            // Popular books
            if (lowerMessage.Contains("popular") || lowerMessage.Contains("top rated"))
            {
                return await GetPopularBooks();
            }

            // Checkout help
            if (lowerMessage.Contains("checkout") || lowerMessage.Contains("borrow"))
            {
                return "To checkout a book: Browse to the book details page and click the 'Check Out Book' button. " +
                       "You can view your checked out books in the 'My Checkouts' section.";
            }

            // Default response
            return "I'm not sure how to help with that. Type 'help' to see what I can do!";
        }

        private async Task<string> RecommendRandomBook()
        {
            var books = await _context.Books.Where(b => b.IsAvailable).ToListAsync();
            if (!books.Any())
                return "Sorry, there are no available books right now.";

            var book = books[_random.Next(books.Count)];
            return $"I recommend: \"{book.Title}\" by {book.Author}. " +
                   $"It's a {book.Category} book with {book.PageCount} pages. Check it out!";
        }

        private async Task<string> FindBooksByAuthor(string author)
        {
            var books = await _context.Books
                .Where(b => b.Author.Contains(author))
                .Take(3)
                .ToListAsync();

            if (!books.Any())
                return $"I couldn't find any books by {author}. Try another author?";

            var response = $"Found {books.Count} books by {author}:\n";
            foreach (var book in books)
            {
                // Fixed: Added parentheses around the ternary operator
                response += $"- {book.Title} ({(book.IsAvailable ? "Available" : "Checked out")})\n";
            }
            return response;
        }

        private async Task<string> FindBooksByCategory(string category)
        {
            var books = await _context.Books
                .Where(b => b.Category == category && b.IsAvailable)
                .Take(3)
                .ToListAsync();

            if (!books.Any())
                return $"I couldn't find any available books in {category}. Try another category?";

            var response = $"Here are some available {category} books:\n";
            foreach (var book in books)
            {
                response += $"- {book.Title} by {book.Author}\n";
            }
            return response;
        }

        private async Task<string> GetPopularBooks()
        {
            var books = await _context.Books
                .Where(b => b.IsAvailable)
                .OrderByDescending(b => b.Reviews.Average(r => r.Rating))
                .Take(3)
                .ToListAsync();

            if (!books.Any())
                return "I couldn't find any highly rated books right now.";

            var response = "Here are some popular books:\n";
            foreach (var book in books)
            {
                var avgRating = book.Reviews.Any()
                    ? book.Reviews.Average(r => r.Rating)
                    : 0;
                response += $"- {book.Title} by {book.Author} ({avgRating:F1}★)\n";
            }
            return response;
        }

        private async Task<List<string>> GetCategories()
        {
            return await _context.Books
                .Where(b => b.Category != null)
                .Select(b => b.Category)
                .Distinct()
                .ToListAsync();
        }
    }
}
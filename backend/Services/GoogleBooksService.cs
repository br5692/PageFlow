using System.Net.Http;
using System.Text.Json;
using backend.Data;
using backend.Models;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class GoogleBooksService
    {
        private readonly LibraryDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GoogleBooksService(LibraryDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _apiKey = configuration["GoogleBooks:ApiKey"] ?? throw new InvalidOperationException("Google Books API key is missing.");
        }

        /// <summary>
        /// Fetches books from Google Books API and saves them in the database.
        /// </summary>
        public async Task FetchAndSaveBooksAsync()
        {
            string apiUrl = $"https://www.googleapis.com/books/v1/volumes?q=programming&maxResults=10&key={_apiKey}";

            try
            {
                var response = await _httpClient.GetAsync(apiUrl);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Google Books API Error: {response.StatusCode} - {errorContent}");
                    return;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var googleBooksData = JsonSerializer.Deserialize<GoogleBooksResponse>(jsonResponse);

                if (googleBooksData?.Items != null)
                {
                    foreach (var item in googleBooksData.Items)
                    {
                        var volumeInfo = item.VolumeInfo;

                        // Attempt to parse the published date safely
                        DateTime.TryParse(volumeInfo?.PublishedDate, out var parsedDate);
                        DateTime publishedDate = parsedDate != default ? parsedDate : DateTime.UtcNow;

                        var book = new Book
                        {
                            Title = volumeInfo?.Title ?? "Unknown Title",
                            Author = volumeInfo?.Authors?.FirstOrDefault() ?? "Unknown Author",
                            ISBN = volumeInfo?.IndustryIdentifiers?.FirstOrDefault()?.Identifier,
                            PublishedDate = publishedDate,
                            Description = volumeInfo?.Description ?? "No description available.",
                            Publisher = volumeInfo?.Publisher ?? "Unknown Publisher",
                            Category = volumeInfo?.Categories?.FirstOrDefault() ?? "Uncategorized",
                            PageCount = volumeInfo?.PageCount ?? 0,
                            CoverImage = volumeInfo?.ImageLinks?.Thumbnail ?? "https://via.placeholder.com/150"
                        };

                        // Ensure no duplicate books based on Title and Author, or ISBN if available
                        bool bookExists = _context.Books.Any(b =>
                            (b.Title == book.Title && b.Author == book.Author) ||
                            (!string.IsNullOrEmpty(book.ISBN) && b.ISBN == book.ISBN));

                        if (!bookExists)
                        {
                            _context.Books.Add(book);
                        }
                    }

                    await _context.SaveChangesAsync(); // Save to the database
                    Console.WriteLine("Successfully added books from Google Books API.");
                }
                else
                {
                    Console.WriteLine("No books found from Google Books API.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching books from Google Books API: {ex.Message}");
            }
        }
    }

    // Google Books API response model
    public class GoogleBooksResponse
    {
        public List<GoogleBookItem> Items { get; set; } = new List<GoogleBookItem>();
    }

    public class GoogleBookItem
    {
        public GoogleBookVolumeInfo VolumeInfo { get; set; } = new GoogleBookVolumeInfo();
    }

    public class GoogleBookVolumeInfo
    {
        public string Title { get; set; } = string.Empty;
        public List<string> Authors { get; set; } = new List<string>();
        public List<GoogleBookIndustryIdentifier> IndustryIdentifiers { get; set; } = new List<GoogleBookIndustryIdentifier>();
        public string PublishedDate { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new List<string>();
        public int PageCount { get; set; }
        public GoogleBookImageLinks ImageLinks { get; set; } = new GoogleBookImageLinks();
    }

    public class GoogleBookIndustryIdentifier
    {
        public string Type { get; set; } = string.Empty;
        public string Identifier { get; set; } = string.Empty;
    }

    public class GoogleBookImageLinks
    {
        public string Thumbnail { get; set; } = string.Empty;
    }
}

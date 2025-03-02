using backend.Models;
using backend.Services;

namespace backend.Data
{
    public class DbSeeder
    {
        private readonly LibraryDbContext _dbContext;
        private readonly GoogleBooksService _googleBooksService;

        public DbSeeder(LibraryDbContext dbContext, GoogleBooksService googleBooksService)
        {
            _dbContext = dbContext;
            _googleBooksService = googleBooksService;
        }

        /// <summary>
        /// Seeds the database with books. Attempts to fetch from Google Books API first.
        /// If the API call fails, fallback mock data is inserted instead.
        /// </summary>
        public async Task SeedAsync()
        {
            try
            {
                Console.WriteLine("Checking if database connection is available...");
                if (!_dbContext.Database.CanConnect())
                {
                    Console.WriteLine("Database connection failed. Seeding aborted.");
                    return;
                }

                if (!_dbContext.Books.Any()) // If no books exist, seed the data
                {
                    Console.WriteLine("No books found in the database. Fetching from Google Books API...");

                    // Attempt to fetch from Google Books API
                    try
                    {
                        await _googleBooksService.FetchAndSaveBooksAsync();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Google Books API fetch failed: {ex.Message}");
                        Console.WriteLine("Falling back to mock book data...");

                        var fallbackBooks = new List<Book>
                        {
                            new Book
                            {
                                Title = "Sample Book Title",
                                Author = "Sample Author",
                                Description = "Sample Description",
                                ISBN = "1234567890",
                                Publisher = "Sample Publisher",
                                PublishedDate = DateTime.Parse("2020-01-01"),
                                Category = "Sample Category",
                                PageCount = 200,
                                CoverImage = "https://example.com/cover.jpg"
                            },
                            new Book
                            {
                                Title = "Another Sample Book",
                                Author = "Another Author",
                                Description = "A backup book in case API fails",
                                ISBN = "0987654321",
                                Publisher = "Backup Publisher",
                                PublishedDate = DateTime.UtcNow,
                                Category = "Fallback",
                                PageCount = 150,
                                CoverImage = "https://example.com/cover2.jpg"
                            }
                        };

                        _dbContext.Books.AddRange(fallbackBooks);
                        await _dbContext.SaveChangesAsync();

                        Console.WriteLine("Fallback books added successfully.");
                    }
                }
                else
                {
                    Console.WriteLine("Books already exist in the database. Skipping seeding.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error during database seeding: {ex.Message}");
            }
        }
    }
}

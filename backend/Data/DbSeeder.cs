using backend.Models;
using Bogus;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DbSeeder
    {
        private readonly LibraryDbContext _dbContext;

        public DbSeeder(LibraryDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Seeds the database with books and reviews using Bogus for randomized data generation.
        /// Only seeds if the database is empty.
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

                // Only seed if there are no books in the database
                if (!_dbContext.Books.Any())
                {
                    Console.WriteLine("No books found in the database. Seeding with Bogus-generated books...");

                    var faker = new Faker<Book>()
                        .RuleFor(b => b.Title, f => f.Lorem.Sentence(3, 5))
                        .RuleFor(b => b.Author, f => f.Name.FullName())
                        .RuleFor(b => b.Description, f => f.Lorem.Paragraph())
                        .RuleFor(b => b.ISBN, f => f.Random.Replace("###-##########"))
                        .RuleFor(b => b.Publisher, f => f.Company.CompanyName())
                        .RuleFor(b => b.PublishedDate, f => f.Date.Past(10))
                        .RuleFor(b => b.Category, f => f.Commerce.Categories(1).First())
                        .RuleFor(b => b.PageCount, f => f.Random.Int(100, 600))
                        .RuleFor(b => b.CoverImage, f => f.Image.PicsumUrl())
                        .RuleFor(b => b.IsAvailable, true); // Explicitly set IsAvailable to true

                    var fakeBooks = faker.Generate(2000); // Generate 2000 fake books
                    _dbContext.Books.AddRange(fakeBooks);
                    await _dbContext.SaveChangesAsync();

                    Console.WriteLine("Successfully seeded database with 2000 Bogus-generated books.");
                }
                else
                {
                    Console.WriteLine("Books already exist in the database. Skipping book seeding.");
                }

                // After books are seeded, seed reviews if there are users and no reviews yet
                if (_dbContext.Books.Any() && _dbContext.Users.Any() && !_dbContext.Reviews.Any())
                {
                    Console.WriteLine("No reviews found in the database. Seeding reviews...");
                    await SeedReviewsAsync();
                }
                else if (_dbContext.Reviews.Any())
                {
                    Console.WriteLine("Reviews already exist in the database. Skipping review seeding.");
                }
                else
                {
                    Console.WriteLine("Cannot seed reviews: No books or users found.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error during database seeding: {ex.Message}");
            }
        }

        /// <summary>
        /// Seeds reviews for 80% of books from existing users with ratings from 2-5
        /// </summary>
        private async Task SeedReviewsAsync()
        {
            // Get all books and users
            var books = await _dbContext.Books.ToListAsync();
            var users = await _dbContext.Users.ToListAsync();

            if (!books.Any() || !users.Any())
            {
                Console.WriteLine("Cannot seed reviews: No books or users found.");
                return;
            }

            // Calculate how many books should have reviews (80% of total)
            int booksWithReviews = (int)(books.Count * 0.8);
            Console.WriteLine($"Seeding reviews for {booksWithReviews} books (80% of total) from {users.Count} users...");

            // Randomly select 80% of books to have reviews
            var random = new Random();
            var booksToReview = books.OrderBy(x => random.Next()).Take(booksWithReviews).ToList();

            var reviewFaker = new Faker<Review>()
                .RuleFor(r => r.Rating, f => f.Random.Int(2, 5)) // Ratings from 2-5
                .RuleFor(r => r.Comment, f => f.Lorem.Paragraph())
                .RuleFor(r => r.CreatedAt, f => f.Date.Past(1));

            int totalReviews = 0;

            foreach (var book in booksToReview)
            {
                // Give each selected book 1-5 reviews
                int reviewCount = random.Next(1, 6);

                for (int i = 0; i < reviewCount; i++)
                {
                    // Get a random user
                    var user = users[random.Next(users.Count)];

                    // Avoid duplicate reviews
                    if (await _dbContext.Reviews.AnyAsync(r => r.BookId == book.Id && r.LibraryUserId == user.Id))
                        continue;

                    var review = reviewFaker.Generate();
                    review.BookId = book.Id;
                    review.LibraryUserId = user.Id;
                    review.Book = book;

                    _dbContext.Reviews.Add(review);
                    totalReviews++;
                }
            }

            await _dbContext.SaveChangesAsync();
            Console.WriteLine($"Successfully seeded {totalReviews} reviews for {booksToReview.Count} books.");
        }
    }
}
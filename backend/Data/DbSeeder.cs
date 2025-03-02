using backend.Models;
using Bogus;

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
        /// Seeds the database with books using Bogus for randomized data generation.
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
                        .RuleFor(b => b.CoverImage, f => f.Image.PicsumUrl());

                    var fakeBooks = faker.Generate(50); // Generate 50 fake books
                    _dbContext.Books.AddRange(fakeBooks);
                    await _dbContext.SaveChangesAsync();

                    Console.WriteLine("Successfully seeded database with 50 Bogus-generated books.");
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

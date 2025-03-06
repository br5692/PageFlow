using backend.Constants;
using backend.Models;
using Bogus;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Data
{
    public class DbSeeder
    {
        private readonly LibraryDbContext _dbContext;
        private readonly Random _random = new Random();

        // Configuration constants for performance tuning
        private const int TOTAL_BOOKS = 2000;
        private const int BATCH_SIZE = 100;
        private const double BOOKS_WITH_REVIEWS_PERCENTAGE = 0.6;
        private const int MAX_REVIEWS_PER_BOOK = 15;

        // Dictionary to store key elements from book titles for use in reviews
        private Dictionary<int, BookTheme> _bookThemes = new Dictionary<int, BookTheme>();

        public DbSeeder(LibraryDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Class to hold the thematic elements of a book
        /// </summary>
        private class BookTheme
        {
            public string Title { get; set; }
            public string MainNoun { get; set; }
            public string Character { get; set; }
            public string Subject { get; set; }
            public string Adjective { get; set; }
            public string Setting { get; set; }
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
                    Console.WriteLine($"No books found in the database. Seeding with {TOTAL_BOOKS} books...");
                    await SeedBooksAsync();
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
                Console.WriteLine(ex.StackTrace);
            }
        }

        /// <summary>
        /// Seeds the database with realistic books using templates for titles and descriptions.
        /// Ensures all book titles are unique and descriptions relate to titles.
        /// </summary>
        private async Task SeedBooksAsync()
        {
            // HashSet to track unique titles and prevent duplicates
            var uniqueTitles = new HashSet<string>();

            // Generate books in batches for better performance
            for (int i = 0; i < TOTAL_BOOKS; i += BATCH_SIZE)
            {
                var booksToAdd = new List<Book>();
                int batchCount = Math.Min(BATCH_SIZE, TOTAL_BOOKS - i);

                for (int j = 0; j < batchCount; j++)
                {
                    // Generate a unique title and its theme elements
                    string title;
                    BookTheme theme;
                    int attempts = 0;

                    do
                    {
                        (title, theme) = GenerateBookTitle();
                        attempts++;
                        // Avoid infinite loops by adding a unique suffix after too many attempts
                        if (attempts > 10)
                        {
                            title += $" (Edition {_random.Next(1, 100)})";
                        }
                    } while (uniqueTitles.Contains(title));

                    // Add the unique title to our tracking set
                    uniqueTitles.Add(title);

                    var book = new Book
                    {
                        Title = title,
                        Author = new Faker().Name.FullName(),
                        Description = GenerateBookDescription(theme),
                        ISBN = new Faker().Random.Replace("###-##########"),
                        Publisher = new Faker().Company.CompanyName(),
                        PublishedDate = new Faker().Date.Past(20),
                        Category = theme.Subject ?? SeederConstants.GetRandomItem(SeederConstants.BookSubjects),
                        PageCount = _random.Next(100, 801),
                        CoverImage = GetRandomCoverImage(),
                        IsAvailable = true
                    };

                    booksToAdd.Add(book);
                }

                _dbContext.Books.AddRange(booksToAdd);
                await _dbContext.SaveChangesAsync();

                // After saving the batch, store the book themes for each book ID
                foreach (var book in booksToAdd)
                {
                    if (!_bookThemes.ContainsKey(book.Id) && book.Title != null)
                    {
                        // Parse the title to extract theme elements
                        (_, BookTheme theme) = GenerateBookTitleFromExisting(book.Title);
                        theme.Title = book.Title; // Store the actual title
                        _bookThemes[book.Id] = theme;
                    }
                }

                Console.WriteLine($"Added batch of {batchCount} books. Progress: {i + batchCount}/{TOTAL_BOOKS}");
            }

            Console.WriteLine($"Successfully seeded database with {TOTAL_BOOKS} books.");
        }

        /// <summary>
        /// Seeds reviews for books with a realistic distribution.
        /// Reviews reference key elements from the corresponding book's title and description.
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

            // Load missing book themes for existing books
            foreach (var book in books)
            {
                if (!_bookThemes.ContainsKey(book.Id) && book.Title != null)
                {
                    (_, BookTheme theme) = GenerateBookTitleFromExisting(book.Title);
                    theme.Title = book.Title;
                    _bookThemes[book.Id] = theme;
                }
            }

            // Determine how many books should have reviews
            int booksWithReviewsCount = (int)(books.Count * BOOKS_WITH_REVIEWS_PERCENTAGE);
            Console.WriteLine($"Seeding reviews for {booksWithReviewsCount} books ({BOOKS_WITH_REVIEWS_PERCENTAGE * 100}% of total) from {users.Count} users...");

            // Randomly select books to have reviews
            var booksToReview = books.OrderBy(x => _random.Next()).Take(booksWithReviewsCount).ToList();

            int totalReviews = 0;
            var reviewsToAdd = new List<Review>();

            foreach (var book in booksToReview)
            {
                // Assign a "quality" score to the book that will influence review ratings
                double bookQuality = _random.NextDouble(); // 0.0 to 1.0

                // Determine number of reviews for this book with a realistic distribution
                int reviewCount;
                double reviewDistribution = _random.NextDouble();

                if (reviewDistribution > 0.95) // 5% of books have many reviews (10-15)
                {
                    reviewCount = _random.Next(10, MAX_REVIEWS_PER_BOOK + 1);
                }
                else if (reviewDistribution > 0.8) // 15% of books have 5-9 reviews
                {
                    reviewCount = _random.Next(5, 10);
                }
                else // 80% of books have 1-4 reviews
                {
                    reviewCount = _random.Next(1, 5);
                }

                // Track which users have already reviewed this book
                var userReviewTracker = new HashSet<string>();

                for (int i = 0; i < reviewCount; i++)
                {
                    // Get a random user who hasn't reviewed this book yet
                    string userId;
                    int attempts = 0;
                    do
                    {
                        var user = users[_random.Next(users.Count)];
                        userId = user.Id;
                        attempts++;
                        // Avoid infinite loops if we run out of available users
                        if (attempts > 50) break;
                    } while (userReviewTracker.Contains(userId));

                    if (attempts > 50) continue;
                    userReviewTracker.Add(userId);

                    // Determine rating based on book quality with some randomness
                    int rating;
                    double ratingRoll = _random.NextDouble();

                    if (bookQuality > 0.8) // High quality books
                    {
                        if (ratingRoll < 0.7) rating = 5;
                        else if (ratingRoll < 0.9) rating = 4;
                        else rating = _random.Next(1, 4);
                    }
                    else if (bookQuality > 0.5) // Medium quality books
                    {
                        if (ratingRoll < 0.5) rating = 4;
                        else if (ratingRoll < 0.8) rating = 3;
                        else if (ratingRoll < 0.9) rating = 5;
                        else rating = _random.Next(1, 3);
                    }
                    else // Lower quality books
                    {
                        if (ratingRoll < 0.4) rating = 3;
                        else if (ratingRoll < 0.7) rating = 2;
                        else if (ratingRoll < 0.9) rating = 1;
                        else rating = _random.Next(4, 6);
                    }

                    // Get the book's theme for use in the review
                    BookTheme theme = _bookThemes.ContainsKey(book.Id)
                        ? _bookThemes[book.Id]
                        : new BookTheme
                        {
                            Title = book.Title,
                            Subject = book.Category
                        };

                    // Create review with text based on the rating and book theme
                    var review = new Review
                    {
                        BookId = book.Id,
                        LibraryUserId = userId,
                        Rating = rating,
                        Comment = GenerateReview(rating, theme),
                        CreatedAt = new Faker().Date.Past(1)
                    };

                    reviewsToAdd.Add(review);
                    totalReviews++;

                    // Save reviews in batches for better performance
                    if (reviewsToAdd.Count >= BATCH_SIZE)
                    {
                        _dbContext.Reviews.AddRange(reviewsToAdd);
                        await _dbContext.SaveChangesAsync();
                        Console.WriteLine($"Added batch of {reviewsToAdd.Count} reviews. Total progress: {totalReviews} reviews");
                        reviewsToAdd.Clear();
                    }
                }
            }

            // Add any remaining reviews
            if (reviewsToAdd.Any())
            {
                _dbContext.Reviews.AddRange(reviewsToAdd);
                await _dbContext.SaveChangesAsync();
            }

            Console.WriteLine($"Successfully seeded {totalReviews} reviews for {booksToReview.Count} books.");
        }

        /// <summary>
        /// Generates a book title using templates from SeederConstants and returns the key thematic elements.
        /// Specifically avoids using any templates with numbers.
        /// </summary>
        private (string Title, BookTheme Theme) GenerateBookTitle()
        {
            // Filter out templates that use numbers
            var validTemplates = SeederConstants.BookTitleTemplates
                .Where(t => !t.Contains("{Number}"))
                .ToList();

            // If somehow all templates have numbers (shouldn't happen), fall back to a simple format
            if (!validTemplates.Any())
            {
                validTemplates = new List<string> {
                    "The {Adjective} {Noun}",
                    "{Noun} of {BookSubject}",
                    "The {Adjective} {Character}"
                };
            }

            string template = SeederConstants.GetRandomItem(validTemplates);

            // Create a theme object to store key elements
            var theme = new BookTheme();

            // Generate and store each element
            theme.Adjective = SeederConstants.GetRandomItem(SeederConstants.Adjectives);
            theme.MainNoun = SeederConstants.GetRandomItem(SeederConstants.Nouns);
            theme.Subject = SeederConstants.GetRandomItem(SeederConstants.BookSubjects);
            theme.Character = SeederConstants.GetRandomItem(SeederConstants.Characters);
            theme.Setting = SeederConstants.GetRandomItem(SeederConstants.Settings);

            // Apply the elements to the template
            string title = template
                .Replace("{Adjective}", theme.Adjective)
                .Replace("{Noun}", theme.MainNoun)
                .Replace("{BookSubject}", theme.Subject)
                .Replace("{Character}", theme.Character)
                .Replace("{Setting}", theme.Setting);

            return (title, theme);
        }

        /// <summary>
        /// Attempts to extract theme elements from an existing title
        /// </summary>
        private (string Title, BookTheme Theme) GenerateBookTitleFromExisting(string existingTitle)
        {
            var theme = new BookTheme { Title = existingTitle };

            // Look for potential matches from our word lists
            foreach (var adjective in SeederConstants.Adjectives)
            {
                if (existingTitle.Contains(adjective, StringComparison.OrdinalIgnoreCase))
                {
                    theme.Adjective = adjective;
                    break;
                }
            }

            foreach (var noun in SeederConstants.Nouns)
            {
                if (existingTitle.Contains(noun, StringComparison.OrdinalIgnoreCase))
                {
                    theme.MainNoun = noun;
                    break;
                }
            }

            foreach (var subject in SeederConstants.BookSubjects)
            {
                if (existingTitle.Contains(subject, StringComparison.OrdinalIgnoreCase))
                {
                    theme.Subject = subject;
                    break;
                }
            }

            foreach (var character in SeederConstants.Characters)
            {
                if (existingTitle.Contains(character, StringComparison.OrdinalIgnoreCase))
                {
                    theme.Character = character;
                    break;
                }
            }

            foreach (var setting in SeederConstants.Settings)
            {
                if (existingTitle.Contains(setting, StringComparison.OrdinalIgnoreCase))
                {
                    theme.Setting = setting;
                    break;
                }
            }

            // If we couldn't extract some elements, fill in with random ones
            theme.Adjective ??= SeederConstants.GetRandomItem(SeederConstants.Adjectives);
            theme.MainNoun ??= SeederConstants.GetRandomItem(SeederConstants.Nouns);
            theme.Subject ??= SeederConstants.GetRandomItem(SeederConstants.BookSubjects);
            theme.Character ??= SeederConstants.GetRandomItem(SeederConstants.Characters);
            theme.Setting ??= SeederConstants.GetRandomItem(SeederConstants.Settings);

            return (existingTitle, theme);
        }

        /// <summary>
        /// Generates a book description that relates to the book's theme.
        /// </summary>
        private string GenerateBookDescription(BookTheme theme)
        {
            string template = SeederConstants.GetRandomItem(SeederConstants.BookDescriptionTemplates);

            // First ensure the key themes from the title appear in the description
            // Replace the first instance of each placeholder with the theme element
            if (theme.Adjective != null && template.Contains("{Adjective}"))
                template = ReplaceFirst(template, "{Adjective}", theme.Adjective);

            if (theme.Setting != null && template.Contains("{Setting}"))
                template = ReplaceFirst(template, "{Setting}", theme.Setting);

            if (theme.Character != null && template.Contains("{Character}"))
                template = ReplaceFirst(template, "{Character}", theme.Character);

            if (theme.MainNoun != null && template.Contains("{Noun}"))
                template = ReplaceFirst(template, "{Noun}", theme.MainNoun);

            if (theme.Subject != null && template.Contains("{BookSubject}"))
                template = ReplaceFirst(template, "{BookSubject}", theme.Subject);

            // Now replace any remaining placeholders with random words
            while (template.Contains("{Adjective}"))
                template = ReplaceFirst(template, "{Adjective}", SeederConstants.GetRandomItem(SeederConstants.Adjectives));

            while (template.Contains("{Setting}"))
                template = ReplaceFirst(template, "{Setting}", SeederConstants.GetRandomItem(SeederConstants.Settings));

            while (template.Contains("{Character}"))
                template = ReplaceFirst(template, "{Character}", SeederConstants.GetRandomItem(SeederConstants.Characters));

            while (template.Contains("{Noun}"))
                template = ReplaceFirst(template, "{Noun}", SeederConstants.GetRandomItem(SeederConstants.Nouns));

            while (template.Contains("{BookSubject}"))
                template = ReplaceFirst(template, "{BookSubject}", SeederConstants.GetRandomItem(SeederConstants.BookSubjects));

            while (template.Contains("{Plot}"))
                template = ReplaceFirst(template, "{Plot}", SeederConstants.GetRandomItem(SeederConstants.Plots));

            return template;
        }

        /// <summary>
        /// Generates a review based on the rating using templates from SeederConstants.
        /// Incorporates elements from the book's theme to create more relevant reviews.
        /// </summary>
        private string GenerateReview(int rating, BookTheme theme)
        {
            // Ensure rating is within valid range (1-5)
            rating = Math.Clamp(rating, 1, 5);

            string template = SeederConstants.GetRandomItem(SeederConstants.ReviewTemplatesByRating[rating]);

            // First ensure theme elements appear in the review
            if (theme.Adjective != null && template.Contains("{Adjective}"))
                template = ReplaceFirst(template, "{Adjective}", theme.Adjective);

            if (theme.Character != null && template.Contains("{Character}"))
                template = ReplaceFirst(template, "{Character}", theme.Character);

            if (theme.Setting != null && template.Contains("{Setting}"))
                template = ReplaceFirst(template, "{Setting}", theme.Setting);

            if (theme.Subject != null && template.Contains("{BookSubject}"))
                template = ReplaceFirst(template, "{BookSubject}", theme.Subject);

            // Now replace any remaining placeholders with random words
            while (template.Contains("{Adjective}"))
                template = ReplaceFirst(template, "{Adjective}", SeederConstants.GetRandomItem(SeederConstants.Adjectives));

            while (template.Contains("{Character}"))
                template = ReplaceFirst(template, "{Character}", SeederConstants.GetRandomItem(SeederConstants.Characters));

            while (template.Contains("{Plot}"))
                template = ReplaceFirst(template, "{Plot}", SeederConstants.GetRandomItem(SeederConstants.Plots));

            while (template.Contains("{Setting}"))
                template = ReplaceFirst(template, "{Setting}", SeederConstants.GetRandomItem(SeederConstants.Settings));

            while (template.Contains("{BookSubject}"))
                template = ReplaceFirst(template, "{BookSubject}", SeederConstants.GetRandomItem(SeederConstants.BookSubjects));

            // For a more coherent review, explicitly mention the book's title or main elements 25% of the time
            if (_random.NextDouble() < 0.25 && !string.IsNullOrEmpty(theme.Title))
            {
                string mention;
                if (_random.NextDouble() < 0.5)
                {
                    // Mention the title directly
                    mention = $" \"{theme.Title}\" is {(_random.NextDouble() < 0.5 ? "truly" : "definitely")} ";
                }
                else
                {
                    // Use a thematic element
                    string element = theme.MainNoun ?? theme.Subject ?? theme.Character ?? theme.Setting ?? theme.Adjective;
                    if (!string.IsNullOrEmpty(element))
                    {
                        mention = $" The {element} in this book is ";
                    }
                    else
                    {
                        mention = " This book is ";
                    }
                }

                string[] adjectives = rating >= 4
                    ? new[] { "fascinating", "captivating", "brilliant", "remarkable" }
                    : rating >= 3
                        ? new[] { "interesting", "decent", "solid", "fine" }
                        : new[] { "disappointing", "frustrating", "unconvincing", "tedious" };

                mention += SeederConstants.GetRandomItem(adjectives.ToList()) + ". ";

                // Insert this mention somewhere in the middle of the review
                int insertPos = template.Length / 2;
                int sentenceEnd = template.IndexOf(". ", insertPos);
                if (sentenceEnd > 0)
                {
                    template = template.Insert(sentenceEnd + 1, mention);
                }
                else
                {
                    template += mention;
                }
            }

            return template;
        }

        /// <summary>
        /// Replaces only the first occurrence of a pattern in a string.
        /// </summary>
        private string ReplaceFirst(string text, string search, string replace)
        {
            int pos = text.IndexOf(search);
            if (pos < 0)
                return text;

            return text.Substring(0, pos) + replace + text.Substring(pos + search.Length);
        }

        /// <summary>
        /// Gets a image URL from Picsum Photos with proper dimensions for book covers.
        /// </summary>
        private string GetRandomCoverImage()
        {
            // Use fixed width-to-height ratio for book covers (close to 2:3)
            // Make the width consistent to avoid thin images
            int width = 450;  // Fixed width to ensure images don't appear thin
            int height = 600; // Standard book cover ratio

            // Generate a random image ID
            int imageId = _random.Next(1, 85);

            // 20% chance of grayscale images for variety
            bool grayscale = _random.NextDouble() > 0.8;

            // Construct the URL following the Picsum format
            var sb = new StringBuilder("https://picsum.photos");

            if (grayscale)
            {
                sb.Append("/g");
            }

            sb.Append($"/{width}/{height}");
            sb.Append($"/?image={imageId}");

            return sb.ToString();
        }
    }
}
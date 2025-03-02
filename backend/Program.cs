using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register DbContext
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("LibraryDB"))
);

// Register ASP.NET Identity
builder.Services.AddIdentity<LibraryUser, IdentityRole>()
    .AddEntityFrameworkStores<LibraryDbContext>()
    .AddDefaultTokenProviders();

// Register services
builder.Services.AddScoped<GoogleBooksService>(); // Google Books API Service
builder.Services.AddHttpClient(); // HttpClient for API calls

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication(); // REQUIRED for Identity to work
app.UseAuthorization();

app.MapControllers();

// Run database initialization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var googleBooksService = scope.ServiceProvider.GetRequiredService<GoogleBooksService>();

    await InitializeDatabase(dbContext, roleManager, googleBooksService);
}

app.Run();

/// <summary>
/// Ensures database is connected, roles are created, and books are seeded.
/// </summary>
async Task InitializeDatabase(LibraryDbContext dbContext, RoleManager<IdentityRole> roleManager, GoogleBooksService googleBooksService)
{
    try
    {
        Console.WriteLine("Testing database connection...");
        var canConnect = dbContext.Database.CanConnect();
        Console.WriteLine(canConnect ? "Successfully connected to the database!" : "Database connection failed.");

        // Ensure roles exist
        var roles = new[] { "Librarian", "Customer" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed books only if the database is empty
        if (!dbContext.Books.Any())
        {
            await googleBooksService.FetchAndSaveBooksAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during database initialization: {ex.Message}");
    }
}

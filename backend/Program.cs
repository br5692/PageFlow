using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register DbContext
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("LibraryDB"))
);

// Configure ASP.NET Identity
builder.Services.AddIdentity<LibraryUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<LibraryDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing.");

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtIssuer,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Library Management API", Version = "v1" });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token in the text input below."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

builder.Services.AddAuthorization();

// Register services
builder.Services.AddScoped<DbSeeder>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ICheckoutService, CheckoutService>();
builder.Services.AddHttpClient();

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Run database initialization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<LibraryUser>>();
    var dbSeeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();

    await InitializeDatabase(dbContext, roleManager, userManager, dbSeeder);
}

app.Run();

async Task InitializeDatabase(LibraryDbContext dbContext, RoleManager<IdentityRole> roleManager, UserManager<LibraryUser> userManager, DbSeeder dbSeeder)
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

        // Create a default Librarian user if none exists
        if (!userManager.Users.Any(u => u.UserName == "admin@library.com"))
        {
            var librarian = new LibraryUser
            {
                UserName = "admin@library.com",
                Email = "admin@library.com"
            };

            var result = await userManager.CreateAsync(librarian, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(librarian, "Librarian");
                Console.WriteLine("Default librarian account created: admin@library.com / Admin@123");
            }
        }

        // Create a default Customer user if none exists
        if (!userManager.Users.Any(u => u.UserName == "customer@library.com"))
        {
            var customer = new LibraryUser
            {
                UserName = "customer@library.com",
                Email = "customer@library.com"
            };

            var result = await userManager.CreateAsync(customer, "Customer@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(customer, "Customer");
                Console.WriteLine("Default customer account created: customer@library.com / Customer@123");
            }
        }

        // Seed books and reviews
        await dbSeeder.SeedAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during database initialization: {ex.Message}");
    }
}
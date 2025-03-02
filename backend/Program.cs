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

Console.WriteLine("=== Configuration Check ===");
Console.WriteLine($"JWT Key from config: {builder.Configuration["Jwt:Key"]?.Substring(0, 5)}... (length: {builder.Configuration["Jwt:Key"]?.Length})");
Console.WriteLine($"JWT Issuer from config: {builder.Configuration["Jwt:Issuer"]}");
Console.WriteLine($"Connection string: {builder.Configuration.GetConnectionString("LibraryDB")?.Substring(0, 20)}...");
Console.WriteLine("=========================");

// Add services to the container.
builder.Services.AddControllers();

// Register DbContext
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("LibraryDB"))
);

// Configure ASP.NET Identity
builder.Services.AddIdentity<LibraryUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false; // Optional, depends on if you need email confirmation
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
    var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtIssuer,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // For debugging
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Auth failed: {context.Exception.Message}");
            return Task.CompletedTask;
        }
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
        Description = "Enter 'Bearer {your_token}' below (without quotes)"
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
builder.Services.AddScoped<DbSeeder>(); // Register database seeder
builder.Services.AddScoped<IBookService, BookService>(); // Register Book service
builder.Services.AddScoped<ITokenService, TokenService>(); // Register Token service
builder.Services.AddHttpClient(); // HttpClient for external API calls

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

app.Use(async (context, next) =>
{
    if (context.Request.Headers.ContainsKey("Authorization"))
    {
        Console.WriteLine($"Authorization Header: {context.Request.Headers["Authorization"]}");
    }
    await next();
});

app.Use(async (context, next) =>
{
    Console.WriteLine($"[REQUEST] {context.Request.Method} {context.Request.Path}");

    if (context.Request.Headers.ContainsKey("Authorization"))
    {
        var authHeader = context.Request.Headers["Authorization"].ToString();
        if (authHeader.Length > 60)
        {
            authHeader = authHeader.Substring(0, 30) + "..." + authHeader.Substring(authHeader.Length - 30);
        }
        Console.WriteLine($"[HEADER] Authorization: {authHeader}");
    }
    else
    {
        Console.WriteLine("[HEADER] No Authorization header found");
    }

    await next();

    Console.WriteLine($"[RESPONSE] Status: {context.Response.StatusCode}");
});

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    // Log request information
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");

    // Check for and log authorization header
    if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
    {
        Console.WriteLine($"Authorization header present: {authHeader}");
    }
    else
    {
        Console.WriteLine("No Authorization header");
    }

    // Continue processing
    await next();

    // Log response status
    Console.WriteLine($"Response status: {context.Response.StatusCode}");
});

app.UseRouting(); // Add this if not present

app.UseAuthentication(); // Enable JWT Authentication
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

/// <summary>
/// Ensures database is connected, roles are created, and books are seeded.
/// </summary>
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
        if (!userManager.Users.Any())
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

        // Seed books using Bogus
        await dbSeeder.SeedAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during database initialization: {ex.Message}");
    }
}

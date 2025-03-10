using backend.Data;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Events;
using System.Text;

// Setup Serilog logger configuration
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/library-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting Library Management System");

    var builder = WebApplication.CreateBuilder(args);

    // Configure builder to use Serilog
    builder.Host.UseSerilog();

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

    // Add response compression
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true; // Ensures compression works over HTTPS
        options.Providers.Add<BrotliCompressionProvider>(); // Brotli for modern browsers
        options.Providers.Add<GzipCompressionProvider>(); // Gzip for fallback
    });

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

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactApp", builder =>
        {
            builder
                .WithOrigins(
                    "http://localhost:3000",   // React default port
                    "https://localhost:3000",
                    "http://localhost:5096",   // Backend HTTP port
                    "https://localhost:7067",   // Backend HTTPS port
                    "http://localhost:44314",  // API port (http)
                    "https://localhost:44314"  // API port (https)
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    builder.Services.AddSignalR();

    builder.Services.AddAuthorization();

    // Register services
    builder.Services.AddScoped<DbSeeder>();
    builder.Services.AddScoped<IBookService, BookService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IReviewService, ReviewService>();
    builder.Services.AddScoped<ICheckoutService, CheckoutService>();
    builder.Services.AddScoped<IBookRecommendationService, BookRecommendationService>();
    builder.Services.AddHttpClient();

    builder.Services.AddEndpointsApiExplorer();

    var app = builder.Build();

    // Configure middleware
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();
    }

    app.UseResponseCompression();
    app.UseHttpsRedirection();
    app.UseRouting();
    app.UseCors("AllowReactApp");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapHub<ChatHub>("/chatHub");
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

    try
    {
        app.Run();
        Log.Information("Application stopped cleanly");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Application terminated unexpectedly");
        throw;
    }
    finally
    {
        Log.CloseAndFlush();
    }

    async Task InitializeDatabase(LibraryDbContext dbContext, RoleManager<IdentityRole> roleManager, UserManager<LibraryUser> userManager, DbSeeder dbSeeder)
    {
        try
        {
            Log.Information("Testing database connection...");
            var canConnect = dbContext.Database.CanConnect();
            Log.Information(canConnect ? "Successfully connected to the database!" : "Database connection failed.");

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
                    Log.Information("Default librarian account created: admin@library.com / Admin@123");
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
                    Log.Information("Default customer account created: customer@library.com / Customer@123");
                }
            }

            // Seed books and reviews
            await dbSeeder.SeedAsync();
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error during database initialization: {ErrorMessage}", ex.Message);
        }
    }
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application start-up failed");
}
finally
{
    Log.CloseAndFlush();
}
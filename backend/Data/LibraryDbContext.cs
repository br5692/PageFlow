using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class LibraryDbContext : IdentityDbContext<LibraryUser, IdentityRole, string>
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options)
            : base(options) { }

        // Your custom tables
        public DbSet<Book> Books { get; set; }
        public DbSet<Checkout> Checkouts { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Important to call the base method first
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<Checkout>()
                .HasOne(c => c.Book)
                .WithMany(b => b.Checkouts)
                .HasForeignKey(c => c.BookId);

            modelBuilder.Entity<Checkout>()
                .HasOne(c => c.LibraryUser)
                .WithMany(u => u.Checkouts)
                .HasForeignKey(c => c.LibraryUserId);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Book)
                .WithMany() // or .WithMany(b => b.Reviews) if you need a Reviews collection on Book
                .HasForeignKey(r => r.BookId);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.LibraryUser)
                .WithMany()
                .HasForeignKey(r => r.LibraryUserId);
        }
    }
}

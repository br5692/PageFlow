using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class LibraryDbContext : DbContext
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<LibraryUser> LibraryUsers { get; set; }
        public DbSet<Checkout> Checkouts { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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
                .WithMany()
                .HasForeignKey(r => r.BookId);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.LibraryUser)
                .WithMany()
                .HasForeignKey(r => r.LibraryUserId);
        }
    }
}

using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Book
    {
        [Key]
        public int Id { get; set; }

        public required string Title { get; set; }
        public required string Author { get; set; }
        public string? ISBN { get; set; }
        public DateTime PublishedDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
        public string? CoverImage { get; set; }  // URL to the cover image
        public string? Publisher { get; set; }
        public string? Category { get; set; }
        public int PageCount { get; set; }

        public ICollection<Checkout> Checkouts { get; set; } = new List<Checkout>();
    }
}

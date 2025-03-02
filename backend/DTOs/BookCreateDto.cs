using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class BookCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;

        public string? ISBN { get; set; }
        public DateTime PublishedDate { get; set; } = DateTime.Now;
        public string? Description { get; set; }
        public string? CoverImage { get; set; }
        public string? Publisher { get; set; }
        public string? Category { get; set; }
        public int PageCount { get; set; }
    }
}

namespace backend.DTOs
{
    public class GoogleBooksDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CoverImage { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public string PublicationDate { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public int PageCount { get; set; }
        public double AverageRating { get; set; }
    }
}

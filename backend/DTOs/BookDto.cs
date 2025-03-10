public class BookDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? ISBN { get; set; }
    public DateTime PublishedDate { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public string? Publisher { get; set; }
    public string? Category { get; set; }
    public int PageCount { get; set; }
    public bool IsAvailable { get; set; }
    public decimal AverageRating { get; set; }
}
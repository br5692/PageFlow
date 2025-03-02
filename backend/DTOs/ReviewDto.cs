﻿namespace backend.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

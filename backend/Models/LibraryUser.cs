using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class LibraryUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer";

        public ICollection<Checkout> Checkouts { get; set; } = new List<Checkout>();
    }
}

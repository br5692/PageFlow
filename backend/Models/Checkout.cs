using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Checkout
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Book")]
        public int BookId { get; set; }
        public Book Book { get; set; } = null!;

        [ForeignKey("LibraryUser")]
        public int LibraryUserId { get; set; }
        public LibraryUser LibraryUser { get; set; } = null!;

        public DateTime CheckoutDate { get; set; }
        public DateTime? ReturnDate { get; set; }
    }
}

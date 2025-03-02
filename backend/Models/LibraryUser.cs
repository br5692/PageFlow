using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class LibraryUser : IdentityUser
    {
        public ICollection<Checkout> Checkouts { get; set; } = new List<Checkout>();
    }
}

namespace HorizonTravel.Model
{
    public class Role
    {
        public int Id { get; set; }
        public string NazwaRoli { get; set; } = string.Empty;

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}

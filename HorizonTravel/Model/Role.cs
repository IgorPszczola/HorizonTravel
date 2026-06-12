namespace HorizonTravel.Model
{
    public class Role
    {
        public int id { get; set; }
        public string nazwaRoli { get; set; } = string.Empty;

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}

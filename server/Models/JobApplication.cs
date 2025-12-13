namespace server.Models
{
    public class JobApplication
    {
        public int Id { get; set; }
        public string Company { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = "Applied";
        public DateTime AppliedDate { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}

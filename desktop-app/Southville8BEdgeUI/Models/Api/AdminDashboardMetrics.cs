using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class AdminDashboardMetrics
{
    [JsonPropertyName("totalStudents")]
    public int TotalStudents { get; set; }
    
    [JsonPropertyName("activeTeachers")]
    public int ActiveTeachers { get; set; }
    
    [JsonPropertyName("totalSections")]
    public int TotalSections { get; set; }
    
    [JsonPropertyName("onlineUsersCount")]
    public int OnlineUsersCount { get; set; }
    
    [JsonPropertyName("lastUpdated")]
    public string LastUpdated { get; set; } = string.Empty;
}

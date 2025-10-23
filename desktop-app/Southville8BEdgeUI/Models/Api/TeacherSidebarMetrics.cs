using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class TeacherSidebarMetrics
{
    [JsonPropertyName("totalClasses")]
    public int TotalClasses { get; set; }

    [JsonPropertyName("pendingAssignments")]
    public int PendingAssignments { get; set; }

    [JsonPropertyName("totalStudents")]
    public int TotalStudents { get; set; }

    [JsonPropertyName("unreadMessages")]
    public int UnreadMessages { get; set; }

    [JsonPropertyName("lastUpdated")]
    public string LastUpdated { get; set; } = string.Empty;
}

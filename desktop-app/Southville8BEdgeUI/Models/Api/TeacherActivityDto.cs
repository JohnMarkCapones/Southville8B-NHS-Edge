using System;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class TeacherActivityDto
{
    [JsonPropertyName("studentName")]
    public string StudentName { get; set; } = string.Empty;

    [JsonPropertyName("studentInitials")]
    public string StudentInitials { get; set; } = string.Empty;

    [JsonPropertyName("activity")]
    public string Activity { get; set; } = string.Empty;

    [JsonPropertyName("timeAgo")]
    public string TimeAgo { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
}

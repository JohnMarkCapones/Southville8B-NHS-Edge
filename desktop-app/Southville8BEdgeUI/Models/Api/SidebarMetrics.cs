using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class SidebarMetrics
{
    [JsonPropertyName("events")]
    public int Events { get; set; }

    [JsonPropertyName("teachers")]
    public int Teachers { get; set; }

    [JsonPropertyName("students")]
    public int Students { get; set; }

    [JsonPropertyName("sections")]
    public int Sections { get; set; }

    [JsonPropertyName("lastUpdated")]
    public string LastUpdated { get; set; } = string.Empty;
}

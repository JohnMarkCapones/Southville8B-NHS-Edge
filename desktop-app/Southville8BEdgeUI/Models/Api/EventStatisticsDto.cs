using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class EventStatisticsDto
{
    [JsonPropertyName("totalEvents")]
    public int TotalEvents { get; set; }

    [JsonPropertyName("thisWeekEvents")]
    public int ThisWeekEvents { get; set; }

    [JsonPropertyName("upcomingEvents")]
    public int UpcomingEvents { get; set; }

    [JsonPropertyName("pastEvents")]
    public int PastEvents { get; set; }

    [JsonPropertyName("publishedEvents")]
    public int PublishedEvents { get; set; }

    [JsonPropertyName("draftEvents")]
    public int DraftEvents { get; set; }

    [JsonPropertyName("cancelledEvents")]
    public int CancelledEvents { get; set; }
}

using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UpdateEventDto
{
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("date")]
    public string? Date { get; set; } // YYYY-MM-DD

    [JsonPropertyName("time")]
    public string? Time { get; set; } // HH:MM

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("eventImage")]
    public string? EventImage { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; } // draft/published/cancelled/completed

    [JsonPropertyName("visibility")]
    public string? Visibility { get; set; } // public/private

    [JsonPropertyName("tagIds")]
    public List<string>? TagIds { get; set; }
}

using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class CreateEventDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty; // YYYY-MM-DD

    [JsonPropertyName("time")]
    public string Time { get; set; } = string.Empty; // HH:MM

    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;

    [JsonPropertyName("organizerId")]
    public string OrganizerId { get; set; } = string.Empty;

    [JsonPropertyName("eventImage")]
    public string? EventImage { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "draft"; // draft/published/cancelled/completed

    [JsonPropertyName("visibility")]
    public string Visibility { get; set; } = "public"; // public/private

    [JsonPropertyName("tagIds")]
    public List<string>? TagIds { get; set; }

    [JsonPropertyName("faq")]
    public List<CreateEventFaqDto>? Faq { get; set; }
}

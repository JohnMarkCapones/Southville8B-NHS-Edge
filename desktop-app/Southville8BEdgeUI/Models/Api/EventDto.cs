using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class EventDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

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
    public string Status { get; set; } = string.Empty; // draft/published/cancelled/completed

    [JsonPropertyName("visibility")]
    public string Visibility { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("organizer")]
    public OrganizerDto? Organizer { get; set; }

    [JsonPropertyName("tags")]
    public List<TagDto>? Tags { get; set; }

    [JsonPropertyName("additionalInfo")]
    public List<EventAdditionalInfoDto>? AdditionalInfo { get; set; }

    [JsonPropertyName("highlights")]
    public List<EventHighlightDto>? Highlights { get; set; }

    [JsonPropertyName("schedule")]
    public List<EventScheduleDto>? Schedule { get; set; }

    [JsonPropertyName("faq")]
    public List<EventFaqDto>? Faq { get; set; }
}

public class OrganizerDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("full_name")]  // Changed from "fullName" to match backend snake_case
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}

public class TagDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;

    [JsonPropertyName("color")]
    public string? Color { get; set; }
}

public class EventAdditionalInfoDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("order_index")]  // Changed from "orderIndex" to match backend snake_case
    public int OrderIndex { get; set; }
}

public class EventHighlightDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("image_url")]  // Changed from "imageUrl" to match backend snake_case
    public string? ImageUrl { get; set; }

    [JsonPropertyName("order_index")]  // Changed from "orderIndex" to match backend snake_case
    public int OrderIndex { get; set; }
}

public class EventScheduleDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("activity_time")]  // Changed from "activityTime" to match backend snake_case
    public string ActivityTime { get; set; } = string.Empty;

    [JsonPropertyName("activity_description")]  // Changed from "activityDescription" to match backend snake_case
    public string ActivityDescription { get; set; } = string.Empty;

    [JsonPropertyName("order_index")]  // Changed from "orderIndex" to match backend snake_case
    public int OrderIndex { get; set; }
}

public class EventFaqDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;

    [JsonPropertyName("answer")]
    public string Answer { get; set; } = string.Empty;
}

public class CreateEventFaqDto
{
    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;

    [JsonPropertyName("answer")]
    public string Answer { get; set; } = string.Empty;
}

public class UpdateEventFaqDto
{
    [JsonPropertyName("question")]
    public string? Question { get; set; }

    [JsonPropertyName("answer")]
    public string? Answer { get; set; }
}

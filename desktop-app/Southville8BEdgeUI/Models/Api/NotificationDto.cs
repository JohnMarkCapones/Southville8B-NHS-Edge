using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class NotificationDto
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("user_id")] public string UserId { get; set; } = string.Empty;
    [JsonPropertyName("type")] public string Type { get; set; } = string.Empty; // info|warning|success|error|system
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("message")] public string Message { get; set; } = string.Empty;
    [JsonPropertyName("category")] public string? Category { get; set; }
    [JsonPropertyName("related_entity_type")] public string? RelatedEntityType { get; set; }
    [JsonPropertyName("related_entity_id")] public string? RelatedEntityId { get; set; }
    [JsonPropertyName("is_read")] public bool IsRead { get; set; }
    [JsonPropertyName("read_at")] public DateTimeOffset? ReadAt { get; set; }
    [JsonPropertyName("created_by")] public string? CreatedBy { get; set; }
    [JsonPropertyName("created_at")] public DateTimeOffset CreatedAt { get; set; }
    [JsonPropertyName("updated_at")] public DateTimeOffset UpdatedAt { get; set; }
}

public class NotificationListResponse
{
    [JsonPropertyName("data")] public List<NotificationDto> Data { get; set; } = new();
    [JsonPropertyName("total")] public int Total { get; set; }
    [JsonPropertyName("page")] public int Page { get; set; }
    [JsonPropertyName("limit")] public int Limit { get; set; }
    [JsonPropertyName("total_pages")] public int TotalPages { get; set; }
}

public class MarkNotificationReadResponse
{
    [JsonPropertyName("success")] public bool Success { get; set; }
}


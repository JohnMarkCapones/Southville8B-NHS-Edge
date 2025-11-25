using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace Southville8BEdgeUI.Models.Api;

public class AnnouncementDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("updatedAt")]
    public string UpdatedAt { get; set; } = string.Empty;

    [JsonPropertyName("expiresAt")]
    public string? ExpiresAt { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("visibility")]
    public string Visibility { get; set; } = "public";

    [JsonPropertyName("sections")]
    public List<SectionDto> Sections { get; set; } = new();
}

public class AnnouncementSectionDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("gradeLevel")]
    public string? GradeLevel { get; set; }
}

public class CreateAnnouncementDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("visibility")]
    public string Visibility { get; set; } = "public";

    [JsonPropertyName("expiresAt")]
    public string? ExpiresAt { get; set; }

    [JsonPropertyName("targetRoleIds")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public List<string>? TargetRoleIds { get; set; }

    [JsonPropertyName("sectionIds")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public List<string>? SectionIds { get; set; }
}

public class UpdateAnnouncementDto
{
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("content")]
    public string? Content { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("visibility")]
    public string? Visibility { get; set; }

    [JsonPropertyName("expiresAt")]
    public string? ExpiresAt { get; set; }

    [JsonPropertyName("targetRoleIds")]
    public List<string>? TargetRoleIds { get; set; }

    [JsonPropertyName("sectionIds")]
    public List<string>? SectionIds { get; set; }
}

public class AnnouncementStatsDto
{
    [JsonPropertyName("totalCount")]
    public int TotalCount { get; set; }

    [JsonPropertyName("activeCount")]
    public int ActiveCount { get; set; }

    [JsonPropertyName("totalViews")]
    public int TotalViews { get; set; }

    [JsonPropertyName("engagementRate")]
    public double EngagementRate { get; set; }
}

public class AnnouncementListResponse
{
    [JsonPropertyName("data")]
    public List<AnnouncementDto> Data { get; set; } = new();

    [JsonPropertyName("pagination")]
    public PaginationInfo Pagination { get; set; } = new();
}


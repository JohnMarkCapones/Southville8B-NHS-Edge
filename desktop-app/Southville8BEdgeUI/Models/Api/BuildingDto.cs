using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class BuildingDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string BuildingName { get; set; } = string.Empty;
    
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;
    
    [JsonPropertyName("capacity")]
    public int? Capacity { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Relations
    [JsonPropertyName("floors")]
    public List<FloorDto>? Floors { get; set; }
    
    [JsonPropertyName("stats")]
    public BuildingStatsDto? Stats { get; set; }
}

public class FloorInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("number")]
    public int Number { get; set; }
    
    [JsonPropertyName("rooms_count")]
    public int? RoomsCount { get; set; }
}

public class BuildingStatsDto
{
    [JsonPropertyName("total_floors")]
    public int TotalFloors { get; set; }
    
    [JsonPropertyName("total_rooms")]
    public int TotalRooms { get; set; }
    
    [JsonPropertyName("total_capacity")]
    public int TotalCapacity { get; set; }
    
    [JsonPropertyName("utilization_rate")]
    public double UtilizationRate { get; set; }
}

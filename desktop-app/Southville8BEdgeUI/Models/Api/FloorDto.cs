using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class FloorDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("building_id")]
    public string BuildingId { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("number")]
    public int Number { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Relations
    [JsonIgnore] // Break circular reference Building ↔ Floor
    public BuildingDto? Building { get; set; }
    
    [JsonPropertyName("rooms")]
    public List<RoomDto>? Rooms { get; set; }
}

public class BuildingInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("building_name")]
    public string BuildingName { get; set; } = string.Empty;
    
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;
}

public class RoomInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("room_number")]
    public string RoomNumber { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("capacity")]
    public int Capacity { get; set; }
    
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}

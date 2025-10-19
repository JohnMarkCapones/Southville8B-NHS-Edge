using System;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class RoomDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("floor_id")]
    public string FloorId { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    
    [JsonPropertyName("room_number")]
    public string RoomNumber { get; set; } = string.Empty;
    
    [JsonPropertyName("capacity")]
    public int? Capacity { get; set; }
    
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    
    [JsonPropertyName("display_order")]
    public int? DisplayOrder { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Relations
    [JsonIgnore] // Break circular reference Floor ↔ Room
    public FloorDto? Floor { get; set; }
    
    [JsonIgnore] // Break circular reference Building ↔ Room
    public BuildingDto? Building { get; set; }
}


using System;

namespace Southville8BEdgeUI.Models.Api;

public class RoomDto
{
    public string Id { get; set; } = string.Empty;
    public string FloorId { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Relations
    public FloorDto? Floor { get; set; }
    public BuildingDto? Building { get; set; }
}


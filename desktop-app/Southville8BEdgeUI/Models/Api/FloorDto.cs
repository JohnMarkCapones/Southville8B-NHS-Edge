using System;
using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class FloorDto
{
    public string Id { get; set; } = string.Empty;
    public string BuildingId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Relations
    public BuildingDto? Building { get; set; }
    public List<RoomDto>? Rooms { get; set; }
}

public class BuildingInfo
{
    public string Id { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class RoomInfo
{
    public string Id { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
}

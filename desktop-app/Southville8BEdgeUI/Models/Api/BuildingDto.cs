using System;
using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class BuildingDto
{
    public string Id { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Relations
    public List<FloorDto>? Floors { get; set; }
    public BuildingStatsDto? Stats { get; set; }
}

public class FloorInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
    public int? RoomsCount { get; set; }
}

public class BuildingStatsDto
{
    public int TotalFloors { get; set; }
    public int TotalRooms { get; set; }
    public int TotalCapacity { get; set; }
    public double UtilizationRate { get; set; }
}

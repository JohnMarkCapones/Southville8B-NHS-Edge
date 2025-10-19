namespace Southville8BEdgeUI.Models.Api;

public class UpdateBuildingDto
{
    public string BuildingName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int? Capacity { get; set; }
}
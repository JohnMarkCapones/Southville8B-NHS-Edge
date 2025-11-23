namespace Southville8BEdgeUI.Models.Api;

public class CreateBuildingDto
{
    public string BuildingName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int? Capacity { get; set; }
}

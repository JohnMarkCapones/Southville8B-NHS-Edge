namespace Southville8BEdgeUI.Models.Api;

public class CreateFloorDto
{
    public string BuildingId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
}

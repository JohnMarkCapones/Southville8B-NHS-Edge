namespace Southville8BEdgeUI.Models.Api;

public class CreateRoomDto
{
    public string FloorId { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string? Name { get; set; }
    public int? Capacity { get; set; }
    public string Status { get; set; } = "Available";
    public int? DisplayOrder { get; set; }
}

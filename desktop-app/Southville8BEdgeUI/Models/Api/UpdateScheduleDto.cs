namespace Southville8BEdgeUI.Models.Api;

public class UpdateScheduleDto
{
    public string? SubjectId { get; set; }
    public string? TeacherId { get; set; }
    public string? SectionId { get; set; }
    public string? RoomId { get; set; }
    public string? BuildingId { get; set; }
    public string? DayOfWeek { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? SchoolYear { get; set; }
    public string? Semester { get; set; }
}

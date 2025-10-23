using System.ComponentModel.DataAnnotations;

namespace Southville8BEdgeUI.Models.Api;

public class CreateScheduleDto
{
    [Required]
    public string SubjectId { get; set; } = string.Empty;

    [Required]
    public string TeacherId { get; set; } = string.Empty;

    [Required]
    public string SectionId { get; set; } = string.Empty;

    [Required]
    public string RoomId { get; set; } = string.Empty;

    [Required]
    public string BuildingId { get; set; } = string.Empty;

    [Required]
    public string DayOfWeek { get; set; } = string.Empty; // Monday, Tuesday, etc.

    [Required]
    public string StartTime { get; set; } = string.Empty; // HH:mm:ss

    [Required]
    public string EndTime { get; set; } = string.Empty; // HH:mm:ss

    [Required]
    public string SchoolYear { get; set; } = string.Empty; // 2024-2025

    [Required]
    public string Semester { get; set; } = string.Empty; // 1st, 2nd
}

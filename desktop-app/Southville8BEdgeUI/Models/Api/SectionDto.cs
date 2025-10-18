using System;

namespace Southville8BEdgeUI.Models.Api;

public class SectionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? GradeLevel { get; set; }
    public string? TeacherId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? RoomId { get; set; }
    public string? BuildingId { get; set; }
    
    // Relations
    public TeacherInfo? Teacher { get; set; }
    public StudentInfo[]? Students { get; set; }
}

public class TeacherInfo
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class StudentInfo
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
}

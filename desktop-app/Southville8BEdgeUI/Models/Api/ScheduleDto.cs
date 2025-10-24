using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class ScheduleDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("subjectId")]
    public string SubjectId { get; set; } = string.Empty;

    [JsonPropertyName("teacherId")]
    public string TeacherId { get; set; } = string.Empty;

    [JsonPropertyName("sectionId")]
    public string SectionId { get; set; } = string.Empty;

    [JsonPropertyName("roomId")]
    public string RoomId { get; set; } = string.Empty;

    [JsonPropertyName("buildingId")]
    public string BuildingId { get; set; } = string.Empty;

    [JsonPropertyName("dayOfWeek")]
    public string DayOfWeek { get; set; } = string.Empty;

    [JsonPropertyName("startTime")]
    public string StartTime { get; set; } = string.Empty;

    [JsonPropertyName("endTime")]
    public string EndTime { get; set; } = string.Empty;

    [JsonPropertyName("schoolYear")]
    public string SchoolYear { get; set; } = string.Empty;

    [JsonPropertyName("semester")]
    public string Semester { get; set; } = string.Empty;

    [JsonPropertyName("created_at")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("updated_at")]
    public string UpdatedAt { get; set; } = string.Empty;

    // Relations
    [JsonPropertyName("subject")]
    public SubjectDto? Subject { get; set; }

    [JsonPropertyName("teacher")]
    public TeacherDto? Teacher { get; set; }

    [JsonPropertyName("section")]
    public SectionDto? Section { get; set; }

    [JsonPropertyName("room")]
    public RoomDto? Room { get; set; }

    [JsonPropertyName("building")]
    public BuildingDto? Building { get; set; }

    [JsonPropertyName("students")]
    public List<StudentDto>? Students { get; set; }
}

public class SubjectDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("subjectName")]
    public string SubjectName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("gradeLevel")]
    public int? GradeLevel { get; set; }

    [JsonPropertyName("colorHex")]
    public string? ColorHex { get; set; }
}

public class TeacherDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("middleName")]
    public string? MiddleName { get; set; }

    [JsonPropertyName("user")]
    public UserDto? User { get; set; }
}

public class StudentDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }

    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("lrn_id")]
    public string LrnId { get; set; } = string.Empty;

    [JsonPropertyName("grade_level")]
    public string? GradeLevel { get; set; }
}


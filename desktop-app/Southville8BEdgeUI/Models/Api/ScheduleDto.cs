using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class ScheduleDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("subject_id")]
    public string SubjectId { get; set; } = string.Empty;

    [JsonPropertyName("teacher_id")]
    public string TeacherId { get; set; } = string.Empty;

    [JsonPropertyName("section_id")]
    public string SectionId { get; set; } = string.Empty;

    [JsonPropertyName("room_id")]
    public string RoomId { get; set; } = string.Empty;

    [JsonPropertyName("building_id")]
    public string BuildingId { get; set; } = string.Empty;

    [JsonPropertyName("day_of_week")]
    public string DayOfWeek { get; set; } = string.Empty;

    [JsonPropertyName("start_time")]
    public string StartTime { get; set; } = string.Empty;

    [JsonPropertyName("end_time")]
    public string EndTime { get; set; } = string.Empty;

    [JsonPropertyName("school_year")]
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

    [JsonPropertyName("subject_name")]
    public string SubjectName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("grade_level")]
    public int? GradeLevel { get; set; }

    [JsonPropertyName("color_hex")]
    public string? ColorHex { get; set; }
}

public class TeacherDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("middle_name")]
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


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

    [JsonPropertyName("start_time")]
    public string StartTimeSnake 
    { 
        get => StartTime;
        set => StartTime = value; 
    }

    [JsonPropertyName("endTime")]
    public string EndTime { get; set; } = string.Empty;

    [JsonPropertyName("end_time")]
    public string EndTimeSnake 
    { 
        get => EndTime;
        set => EndTime = value; 
    }

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

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

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
    
    [JsonPropertyName("enrollment_year")]
    public int? EnrollmentYear { get; set; }
    
    [JsonPropertyName("honor_status")]
    public string? HonorStatus { get; set; }
    
    [JsonPropertyName("rank")]
    public int? Rank { get; set; }
    
    [JsonPropertyName("section_id")]
    public string? SectionId { get; set; }
    
    [JsonPropertyName("age")]
    public int? Age { get; set; }
    
    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }
    
    [JsonPropertyName("deleted_at")]
    public string? DeletedAt { get; set; }
}


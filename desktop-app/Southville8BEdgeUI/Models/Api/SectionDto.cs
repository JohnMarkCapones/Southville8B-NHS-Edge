using System;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class SectionDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("grade_level")]
    public string? GradeLevel { get; set; }
    
    [JsonPropertyName("teacher_id")]
    public string? TeacherId { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    [JsonPropertyName("room_id")]
    public string? RoomId { get; set; }
    
    [JsonPropertyName("building_id")]
    public string? BuildingId { get; set; }
    
    // Relations
    [JsonPropertyName("teacher")]
    public TeacherInfo? Teacher { get; set; }
    
    [JsonPropertyName("students")]
    public StudentInfo[]? Students { get; set; }
}

public class TeacherInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}

public class StudentInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;
    
    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;
    
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;
}

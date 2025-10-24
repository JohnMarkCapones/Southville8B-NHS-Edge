using System;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class SectionDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("gradeLevel")]
    public string? GradeLevel { get; set; }
    
    [JsonPropertyName("teacherId")]
    public string? TeacherId { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    [JsonPropertyName("roomId")]
    public string? RoomId { get; set; }
    
    [JsonPropertyName("buildingId")]
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
    
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}

public class StudentInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;
    
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;
    
    [JsonPropertyName("studentId")]
    public string StudentId { get; set; } = string.Empty;
}

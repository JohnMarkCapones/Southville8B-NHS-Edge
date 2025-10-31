using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UserDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public RoleDto? Role { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("lastLogin")]
    public string? LastLogin { get; set; }

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("department")]
    public string? Department { get; set; }

    // Student specific fields
    [JsonPropertyName("studentId")]
    public string? StudentId { get; set; }

    [JsonPropertyName("gradeLevel")]
    public string? GradeLevel { get; set; }

    // Teacher specific fields
    [JsonPropertyName("employeeId")]
    public string? EmployeeId { get; set; }

    [JsonPropertyName("subjectSpecialization")]
    public string? SubjectSpecialization { get; set; }

    [JsonPropertyName("teacher")]
    public TeacherData? Teacher { get; set; }

    [JsonPropertyName("emailConfirmedAt")]
    public string? EmailConfirmedAt { get; set; }

    [JsonPropertyName("userMetadata")]
    public Dictionary<string, object>? UserMetadata { get; set; }
}

public class TeacherData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }
}

public class RoleDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

using System;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UserDetailResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("full_name")]
    public string? FullName { get; set; }
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = "";
    
    [JsonPropertyName("status")]
    public string? Status { get; set; }
    
    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public string? UpdatedAt { get; set; }
    
    [JsonPropertyName("last_login")]
    public string? LastLogin { get; set; }
    
    [JsonPropertyName("role")]
    public RoleInfo? Role { get; set; }
    
    [JsonPropertyName("teacher")]
    public TeacherDetail? Teacher { get; set; }
    
    [JsonPropertyName("admin")]
    public AdminDetail? Admin { get; set; }
    
    [JsonPropertyName("student")]
    public StudentDetail? Student { get; set; }
}

public class StudentDetail
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = "";
    
    [JsonPropertyName("lrn_id")]
    public string LrnId { get; set; } = "";
    
    [JsonPropertyName("grade_level")]
    public string? GradeLevel { get; set; }
    
    [JsonPropertyName("enrollment_year")]
    public int? EnrollmentYear { get; set; }
    
    [JsonPropertyName("honor_status")]
    public string? HonorStatus { get; set; }
    
    [JsonPropertyName("rank")]
    public int? Rank { get; set; }
    
    [JsonPropertyName("age")]
    public int? Age { get; set; }
    
    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }
    
    [JsonPropertyName("section")]
    public SectionInfo? Section { get; set; }
}

public class TeacherDetail
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }
    
    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }
    
    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }
    
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
    
    [JsonPropertyName("age")]
    public int? Age { get; set; }
    
    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }
    
    [JsonPropertyName("department")]
    public DepartmentInfo? Department { get; set; }
    
    [JsonPropertyName("subject_specialization")]
    public SubjectInfo? SubjectSpecialization { get; set; }
    
    [JsonPropertyName("advisory_section")]
    public SectionInfo? AdvisorySection { get; set; }
}

public class AdminDetail
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
    
    [JsonPropertyName("role_description")]
    public string? RoleDescription { get; set; }
}

public class DepartmentInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("department_name")]
    public string DepartmentName { get; set; } = "";
}

public class SubjectInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("subject_name")]
    public string SubjectName { get; set; } = "";
}

public class SectionInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = "";
    
    [JsonPropertyName("grade_level")]
    public string? GradeLevel { get; set; }
}

using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class CreateStudentDto
{
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("middleName")]
    public string? MiddleName { get; set; }

    [JsonPropertyName("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("lrnId")]
    public string LrnId { get; set; } = string.Empty;

    [JsonPropertyName("birthday")]
    public string Birthday { get; set; } = string.Empty;

    [JsonPropertyName("gradeLevel")]
    public string GradeLevel { get; set; } = string.Empty;

    [JsonPropertyName("enrollmentYear")]
    public int EnrollmentYear { get; set; }

    [JsonPropertyName("honorStatus")]
    public string? HonorStatus { get; set; }

    [JsonPropertyName("age")]
    public int? Age { get; set; }

    [JsonPropertyName("sectionId")]
    public string? SectionId { get; set; }
}

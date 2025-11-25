using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UpdateStudentDto
{
    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }

    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }

    [JsonPropertyName("middleName")]
    public string? MiddleName { get; set; }

    [JsonPropertyName("studentId")]
    public string? StudentId { get; set; }

    [JsonPropertyName("lrnId")]
    public string? LrnId { get; set; }

    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }

    [JsonPropertyName("gradeLevel")]
    public string? GradeLevel { get; set; }

    [JsonPropertyName("enrollmentYear")]
    public int? EnrollmentYear { get; set; }

    [JsonPropertyName("honorStatus")]
    public string? HonorStatus { get; set; }

    [JsonPropertyName("age")]
    public int? Age { get; set; }

    [JsonPropertyName("sectionId")]
    public string? SectionId { get; set; }
}


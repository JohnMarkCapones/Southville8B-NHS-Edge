using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UpdateTeacherDto
{
    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }

    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }

    [JsonPropertyName("middleName")]
    public string? MiddleName { get; set; }

    [JsonPropertyName("birthday")]
    public string? Birthday { get; set; }

    [JsonPropertyName("age")]
    public int? Age { get; set; }

    [JsonPropertyName("subjectSpecializationId")]
    public string? SubjectSpecializationId { get; set; }

    [JsonPropertyName("departmentId")]
    public string? DepartmentId { get; set; }

    [JsonPropertyName("advisorySectionId")]
    public string? AdvisorySectionId { get; set; }
}


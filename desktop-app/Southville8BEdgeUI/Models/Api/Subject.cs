using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class Subject
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("subject_name")]
    public string SubjectName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("grade_level")]
    public int? GradeLevel { get; set; }

    [JsonPropertyName("department_id")]
    public string? DepartmentId { get; set; }

    [JsonPropertyName("color_hex")]
    public string? ColorHex { get; set; }
}

public class SubjectsResponse
{
    [JsonPropertyName("data")]
    public List<Subject> Data { get; set; } = new();

    [JsonPropertyName("total")]
    public int Total { get; set; }
}

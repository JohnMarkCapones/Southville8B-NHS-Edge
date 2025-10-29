using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class StudentDistributionDto
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("grades")]
    public List<StudentDistributionGradeDto> Grades { get; set; } = new();
}

public class StudentDistributionGradeDto
{
    [JsonPropertyName("grade")]
    public string Grade { get; set; } = string.Empty;

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

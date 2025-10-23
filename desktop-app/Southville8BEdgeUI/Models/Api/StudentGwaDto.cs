using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class StudentGwaDto
{
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("student_name")]
    public string StudentName { get; set; } = string.Empty;

    [JsonPropertyName("student_number")]
    public string StudentNumber { get; set; } = string.Empty;

    [JsonPropertyName("gwa")]
    public decimal? Gwa { get; set; }

    [JsonPropertyName("remarks")]
    public string? Remarks { get; set; }

    [JsonPropertyName("honor_status")]
    public string HonorStatus { get; set; } = "None";

    [JsonPropertyName("gwa_id")]
    public string? GwaId { get; set; } // null if no GWA entry exists yet
}

public class StudentGwaListResponse
{
    [JsonPropertyName("section_id")]
    public string SectionId { get; set; } = string.Empty;

    [JsonPropertyName("students")]
    public List<StudentGwaDto> Students { get; set; } = new();

    [JsonPropertyName("section_name")]
    public string SectionName { get; set; } = string.Empty;

    [JsonPropertyName("grade_level")]
    public string GradeLevel { get; set; } = string.Empty;
}

public class CreateGwaDto
{
    [JsonPropertyName("student_id")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("gwa")]
    public decimal Gwa { get; set; }

    [JsonPropertyName("grading_period")]
    public string GradingPeriod { get; set; } = string.Empty;

    [JsonPropertyName("school_year")]
    public string SchoolYear { get; set; } = string.Empty;

    [JsonPropertyName("remarks")]
    public string? Remarks { get; set; }

    [JsonPropertyName("honor_status")]
    public string HonorStatus { get; set; } = "None";
}

public class UpdateGwaDto
{
    [JsonPropertyName("gwa")]
    public decimal? Gwa { get; set; }

    [JsonPropertyName("remarks")]
    public string? Remarks { get; set; }

    [JsonPropertyName("honor_status")]
    public string? HonorStatus { get; set; }
}

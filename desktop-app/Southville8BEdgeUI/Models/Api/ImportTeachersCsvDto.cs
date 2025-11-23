using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class CsvTeacherRowDto
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [StringLength(50)]
    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }

    [Range(18, 80)]
    [JsonPropertyName("age")]
    public int? Age { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    [JsonPropertyName("subject_specialization_id")]
    public string SubjectSpecializationId { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    [JsonPropertyName("department_id")]
    public string DepartmentId { get; set; } = string.Empty;

    [StringLength(100)]
    [JsonPropertyName("advisory_section_id")]
    public string? AdvisorySectionId { get; set; }

    [EmailAddress]
    [StringLength(100)]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [Required]
    [JsonPropertyName("birthday")]
    public string Birthday { get; set; } = string.Empty;
}

public class ImportTeachersCsvDto
{
    [Required]
    [JsonPropertyName("teachers")]
    public List<CsvTeacherRowDto> Teachers { get; set; } = new();
}


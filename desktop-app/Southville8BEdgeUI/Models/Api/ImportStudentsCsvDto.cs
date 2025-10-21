using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Southville8BEdgeUI.Models.Api;

public class CsvStudentRowDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string full_name { get; set; } = string.Empty;

    [Required]
    public string role { get; set; } = string.Empty;

    [Required]
    public string status { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string first_name { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string last_name { get; set; } = string.Empty;

    [StringLength(50)]
    public string? middle_name { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 5)]
    public string student_id { get; set; } = string.Empty;

    [Required]
    [StringLength(15, MinimumLength = 5)]
    public string lrn_id { get; set; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 2)]
    public string grade_level { get; set; } = string.Empty;

    [Required]
    [Range(2000, 2030)]
    public int enrollment { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string section { get; set; } = string.Empty;

    [Range(5, 25)]
    public int? age { get; set; }

    [Required]
    public DateTime birthday { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string guardian_name { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string relationship { get; set; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 10)]
    public string phone_number { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(100)]
    public string? email { get; set; }

    [StringLength(500)]
    public string? address { get; set; }

    public bool? is_primary { get; set; }
}

public class ImportStudentsCsvDto
{
    [Required]
    public List<CsvStudentRowDto> Students { get; set; } = new();
}

public class BulkImportResultDto
{
    public int Success { get; set; }
    public int Failed { get; set; }
    public List<object> Results { get; set; } = new();
    public List<object> Errors { get; set; } = new();
}

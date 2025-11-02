using System;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class AcademicYearDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("year_name")]
    public string? YearName { get; set; }
    
    [JsonPropertyName("start_date")]
    public string? StartDate { get; set; }
    
    [JsonPropertyName("end_date")]
    public string? EndDate { get; set; }
    
    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; }
    
    [JsonPropertyName("structure")]
    public string? Structure { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }
    
    /// <summary>
    /// Gets the display name for the academic year.
    /// Prefers YearName field, otherwise extracts years from StartDate and EndDate
    /// </summary>
    public string GetDisplayName()
    {
        if (!string.IsNullOrWhiteSpace(YearName))
        {
            return YearName;
        }
        
        // Try to extract years from start_date and end_date
        if (!string.IsNullOrWhiteSpace(StartDate) && !string.IsNullOrWhiteSpace(EndDate))
        {
            if (DateTime.TryParse(StartDate, out var startDt) && DateTime.TryParse(EndDate, out var endDt))
            {
                return $"{startDt.Year}-{endDt.Year}";
            }
        }
        
        // Fallback: try start_date only
        if (!string.IsNullOrWhiteSpace(StartDate))
        {
            if (DateTime.TryParse(StartDate, out var startDt))
            {
                return $"{startDt.Year}-{startDt.Year + 1}";
            }
        }
        
        return "N/A";
    }
}


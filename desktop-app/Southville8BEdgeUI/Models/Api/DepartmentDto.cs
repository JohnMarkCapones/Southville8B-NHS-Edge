using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class DepartmentDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("department_name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("description")]
    public string? Description { get; set; }
}


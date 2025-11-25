using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class Department
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("department_name")]
    public string DepartmentName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; }
}

public class DepartmentsResponse
{
    [JsonPropertyName("data")]
    public List<Department> Data { get; set; } = new();

    [JsonPropertyName("total")]
    public int Total { get; set; }
}

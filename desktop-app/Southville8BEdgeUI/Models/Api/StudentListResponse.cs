using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class StudentListResponse
{
    [JsonPropertyName("data")]
    public List<StudentDto> Data { get; set; } = new();
    
    [JsonPropertyName("pagination")]
    public PaginationDto Pagination { get; set; } = new();
}


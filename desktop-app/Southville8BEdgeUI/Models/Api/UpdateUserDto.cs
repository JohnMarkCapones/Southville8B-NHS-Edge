using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UpdateUserDto
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("fullName")]
    public string? FullName { get; set; }
}


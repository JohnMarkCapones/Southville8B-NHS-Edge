using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class CreateAdminDto
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = "Admin";

    [JsonPropertyName("userType")]
    public string UserType { get; set; } = "admin";

    [JsonPropertyName("birthday")]
    public string Birthday { get; set; } = string.Empty;

    [JsonPropertyName("roleDescription")]
    public string? RoleDescription { get; set; }

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; set; }
}

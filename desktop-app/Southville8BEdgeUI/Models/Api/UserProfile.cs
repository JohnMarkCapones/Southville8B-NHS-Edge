using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class UserProfile
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    
    [JsonPropertyName("full_name")]
    public string? FullName { get; set; }
    
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    
    [JsonPropertyName("created_at")]
    public string CreatedAt { get; set; } = string.Empty;
    
    [JsonPropertyName("role")]
    public RoleInfo? Role { get; set; }
}

public class RoleInfo
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

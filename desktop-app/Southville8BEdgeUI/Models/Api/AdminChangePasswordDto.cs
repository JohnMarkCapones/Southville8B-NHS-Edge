using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class AdminChangePasswordRequestDto
{
    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("new_password")]
    public string NewPassword { get; set; } = string.Empty;
}

public class AdminChangePasswordResponseDto
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}


using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class ChangePasswordRequestDto
{
    [JsonPropertyName("currentPassword")]
    public string CurrentPassword { get; set; } = string.Empty;

    [JsonPropertyName("newPassword")]
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangePasswordResponseDto
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}


using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class ResetPasswordResponseDto
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
    
    [JsonPropertyName("temporaryPassword")]
    public string? TemporaryPassword { get; set; }
}

public class ResetPasswordRequestDto
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;
}


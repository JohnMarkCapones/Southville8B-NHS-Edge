using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class ForgotPasswordRequestDto
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}

public class ForgotPasswordResponseDto
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}


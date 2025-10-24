using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class LoginResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("user")]
    public LoginUserDto? User { get; set; }

    [JsonPropertyName("session")]
    public SessionDto? Session { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}

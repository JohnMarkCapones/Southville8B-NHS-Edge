using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class LoginRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

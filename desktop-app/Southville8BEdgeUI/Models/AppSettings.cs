using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models;

public class AppSettings
{
    [JsonPropertyName("ApiSettings")]
    public ApiSettings ApiSettings { get; set; } = new();

    [JsonPropertyName("AccessControl")]
    public AccessControlSettings AccessControl { get; set; } = new();
}

public class ApiSettings
{
    [JsonPropertyName("BaseUrl")]
    public string BaseUrl { get; set; } = string.Empty;

    [JsonPropertyName("Timeout")]
    public int Timeout { get; set; } = 30;

    [JsonPropertyName("Environment")]
    public string Environment { get; set; } = "Development";
}

public class AccessControlSettings
{
    [JsonPropertyName("AllowedRoles")]
    public string[] AllowedRoles { get; set; } = Array.Empty<string>();

    [JsonPropertyName("BlockedRoles")]
    public string[] BlockedRoles { get; set; } = Array.Empty<string>();

    [JsonPropertyName("AccessDeniedMessage")]
    public string AccessDeniedMessage { get; set; } = string.Empty;
}

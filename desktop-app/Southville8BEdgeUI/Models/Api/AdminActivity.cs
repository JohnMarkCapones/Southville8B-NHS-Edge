using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class AdminActivity
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;
    
    [JsonPropertyName("userName")]
    public string UserName { get; set; } = string.Empty;
    
    [JsonPropertyName("actionType")]
    public string ActionType { get; set; } = string.Empty;
    
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    
    [JsonPropertyName("entityType")]
    public string? EntityType { get; set; }
    
    [JsonPropertyName("entityId")]
    public string? EntityId { get; set; }
    
    [JsonPropertyName("metadata")]
    public Dictionary<string, object>? Metadata { get; set; }
    
    [JsonPropertyName("icon")]
    public string? Icon { get; set; }
    
    [JsonPropertyName("color")]
    public string? Color { get; set; }
    
    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;
}

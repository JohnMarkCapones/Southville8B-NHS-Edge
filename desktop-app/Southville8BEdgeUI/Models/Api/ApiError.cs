using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class ApiError
{
    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("message")]
    [JsonConverter(typeof(MessageConverter))]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("error")]
    public string Error { get; set; } = string.Empty;
}

/// <summary>
/// Custom JSON converter to handle message field that can be either a string or an array of strings
/// </summary>
public class MessageConverter : JsonConverter<string>
{
    public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            return reader.GetString() ?? string.Empty;
        }
        else if (reader.TokenType == JsonTokenType.StartArray)
        {
            var messages = new List<string>();
            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndArray)
                    break;
                
                if (reader.TokenType == JsonTokenType.String)
                {
                    messages.Add(reader.GetString() ?? string.Empty);
                }
            }
            
            // Join multiple messages with newlines for better readability
            return string.Join("\n", messages);
        }
        
        return string.Empty;
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}

using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class PaginationDto
{
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("limit")]
    public int Limit { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("pages")]
    public int Pages { get; set; }
}

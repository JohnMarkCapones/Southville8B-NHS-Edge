using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Southville8BEdgeUI.Models.Api;

public class EventListResponse
{
    [JsonPropertyName("data")]
    public List<EventDto> Data { get; set; } = new();

    [JsonPropertyName("pagination")]
    public PaginationDto Pagination { get; set; } = new();
}

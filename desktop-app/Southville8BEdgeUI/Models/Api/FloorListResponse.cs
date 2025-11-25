using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class FloorListResponse
{
    public List<FloorDto> Data { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = new();
}

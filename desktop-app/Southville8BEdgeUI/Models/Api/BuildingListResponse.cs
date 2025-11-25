using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class BuildingListResponse
{
    public List<BuildingDto> Data { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = new();
}

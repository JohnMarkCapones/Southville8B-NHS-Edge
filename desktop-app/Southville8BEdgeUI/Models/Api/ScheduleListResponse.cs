using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class ScheduleListResponse
{
    public List<ScheduleDto> Data { get; set; } = new();
    public PaginationDto Pagination { get; set; } = new();
}

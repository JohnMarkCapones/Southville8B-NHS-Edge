using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class RoomListResponse
{
    public List<RoomDto> Data { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = new();
}

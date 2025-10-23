using System.Collections.Generic;

namespace Southville8BEdgeUI.Models.Api;

public class ConflictCheckResult
{
    public bool HasConflicts { get; set; }
    public List<ScheduleConflict> Conflicts { get; set; } = new();
}

public class ScheduleConflict
{
    public string Type { get; set; } = string.Empty; // teacher, room, student
    public string Message { get; set; } = string.Empty;
    public ScheduleDto? ConflictingSchedule { get; set; }
}

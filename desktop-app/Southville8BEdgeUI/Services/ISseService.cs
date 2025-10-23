using System;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public interface ISseService
{
    Task StartAsync(string endpoint);
    Task StopAsync();
    bool IsConnected { get; }
    event EventHandler<SidebarMetrics>? MetricsUpdated;
    event EventHandler<AdminDashboardMetrics>? DashboardMetricsUpdated;
    event EventHandler<TeacherSidebarMetrics>? TeacherMetricsUpdated;
    event EventHandler<string>? ConnectionStatusChanged;
}

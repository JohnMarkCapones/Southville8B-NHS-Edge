using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public class SseService : ISseService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private CancellationTokenSource? _cancellationTokenSource;
    private bool _isConnected = false;
    private DateTime _lastTeacherMetricsEmittedUtc = DateTime.MinValue;
    private static readonly TimeSpan TeacherEmitInterval = TimeSpan.FromSeconds(30);
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public bool IsConnected => _isConnected;
    public event EventHandler<SidebarMetrics>? MetricsUpdated;
    public event EventHandler<AdminDashboardMetrics>? DashboardMetricsUpdated;
    public event EventHandler<TeacherSidebarMetrics>? TeacherMetricsUpdated;
    public event EventHandler<IReadOnlyList<AdminActivity>>? AdminActivitiesUpdated;
    public event EventHandler<string>? ConnectionStatusChanged;

    public SseService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task StartAsync(string endpoint)
    {
        try
        {
            _cancellationTokenSource = new CancellationTokenSource();
            _isConnected = false;
            OnConnectionStatusChanged("Connecting...");

            var apiSettings = _configuration.GetSection("ApiSettings");
            var baseUrl = apiSettings["BaseUrl"] ?? "http://localhost:3000/api/v1";
            
            if (!baseUrl.EndsWith("/"))
            {
                baseUrl += "/";
            }

            var fullUrl = $"{baseUrl}{endpoint}";
            
            using var response = await _httpClient.GetAsync(fullUrl, HttpCompletionOption.ResponseHeadersRead, _cancellationTokenSource.Token);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"SSE request failed with status: {response.StatusCode}");
            }

            _isConnected = true;
            OnConnectionStatusChanged("Connected");

            using var stream = await response.Content.ReadAsStreamAsync();
            using var reader = new StreamReader(stream, Encoding.UTF8);

            var dataBuffer = new StringBuilder();
            string? currentEventType = null;
            
            while (!_cancellationTokenSource.Token.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync();

                // Handle empty lines as SSE event separators
                if (string.IsNullOrEmpty(line))
                {
                    // Flush buffered data when we encounter an empty line (event separator)
                    if (dataBuffer.Length > 0)
                    {
                        var json = dataBuffer.ToString().Trim();
                        
                        // Ignore heartbeat/non-final frames if present
                        if (json.Contains("\"heartbeat\"", StringComparison.OrdinalIgnoreCase))
                        {
                            dataBuffer.Clear();
                            currentEventType = null;
                            continue;
                        }
                        if (json.Contains("\"isFinal\":false", StringComparison.OrdinalIgnoreCase))
                        {
                            dataBuffer.Clear();
                            currentEventType = null;
                            continue;
                        }

                        try
                        {
                            if (!string.IsNullOrWhiteSpace(currentEventType))
                            {
                                if (currentEventType.Equals("metrics-update", StringComparison.OrdinalIgnoreCase))
                                {
                                    var sidebarMetrics = JsonSerializer.Deserialize<SidebarMetrics>(json, JsonOptions);
                                    if (sidebarMetrics != null)
                                    {
                                        MetricsUpdated?.Invoke(this, sidebarMetrics);
                                        dataBuffer.Clear();
                                        currentEventType = null;
                                        continue;
                                    }
                                }
                                else if (currentEventType.Equals("teacher-metrics-update", StringComparison.OrdinalIgnoreCase))
                                {
                                    var teacherMetrics = JsonSerializer.Deserialize<TeacherSidebarMetrics>(json, JsonOptions);
                                    if (teacherMetrics != null)
                                    {
                                        var now = DateTime.UtcNow;
                                        if (now - _lastTeacherMetricsEmittedUtc >= TeacherEmitInterval)
                                        {
                                            _lastTeacherMetricsEmittedUtc = now;
                                            TeacherMetricsUpdated?.Invoke(this, teacherMetrics);
                                        }

                                        dataBuffer.Clear();
                                        currentEventType = null;
                                        continue;
                                    }
                                }
                                else if (currentEventType.Equals("dashboard-metrics-update", StringComparison.OrdinalIgnoreCase))
                                {
                                    var dashboardMetrics = JsonSerializer.Deserialize<AdminDashboardMetrics>(json, JsonOptions);
                                    if (dashboardMetrics != null)
                                    {
                                        DashboardMetricsUpdated?.Invoke(this, dashboardMetrics);
                                        dataBuffer.Clear();
                                        currentEventType = null;
                                        continue;
                                    }
                                }
                                else if (currentEventType.Equals("dashboard-activities-update", StringComparison.OrdinalIgnoreCase))
                                {
                                    var activities = JsonSerializer.Deserialize<List<AdminActivity>>(json, JsonOptions);
                                    if (activities != null)
                                    {
                                        AdminActivitiesUpdated?.Invoke(this, activities);
                                        dataBuffer.Clear();
                                        currentEventType = null;
                                        continue;
                                    }
                                }
                            }

                            // Try to parse as SidebarMetrics first
                            var fallbackSidebarMetrics = JsonSerializer.Deserialize<SidebarMetrics>(json, JsonOptions);
                            if (fallbackSidebarMetrics != null)
                            {
                                MetricsUpdated?.Invoke(this, fallbackSidebarMetrics);
                                dataBuffer.Clear();
                                currentEventType = null;
                                continue;
                            }
                        }
                        catch (JsonException)
                        {
                            // Continue to next parsing attempt
                        }

                        try
                        {
                            // Try parsing as TeacherSidebarMetrics
                            var fallbackTeacherMetrics = JsonSerializer.Deserialize<TeacherSidebarMetrics>(json, JsonOptions);
                            if (fallbackTeacherMetrics != null)
                            {
                                var now = DateTime.UtcNow;
                                if (now - _lastTeacherMetricsEmittedUtc >= TeacherEmitInterval)
                                {
                                    _lastTeacherMetricsEmittedUtc = now;
                                    TeacherMetricsUpdated?.Invoke(this, fallbackTeacherMetrics);
                                }
                                // Whether throttled or emitted, clear and continue
                                dataBuffer.Clear();
                                currentEventType = null;
                                continue;
                            }
                        }
                        catch (JsonException)
                        {
                            // Continue to next parsing attempt
                        }

                        try
                        {
                            // Try parsing as AdminDashboardMetrics
                            var fallbackDashboardMetrics = JsonSerializer.Deserialize<AdminDashboardMetrics>(json, JsonOptions);
                            if (fallbackDashboardMetrics != null)
                            {
                                DashboardMetricsUpdated?.Invoke(this, fallbackDashboardMetrics);
                                dataBuffer.Clear();
                                currentEventType = null;
                                continue;
                            }
                        }
                        catch (JsonException ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Error parsing SSE data: {ex.Message}");
                        }
                        
                        // Clear the buffer after processing
                        dataBuffer.Clear();
                        currentEventType = null;
                    }
                    continue;
                }

                // Handle SSE format: data: {json}
                if (line.StartsWith("data: "))
                {
                    var dataContent = line.Substring(6);
                    
                    // Accumulate multi-line data frames
                    if (dataBuffer.Length > 0)
                    {
                        dataBuffer.AppendLine();
                    }
                    dataBuffer.Append(dataContent);
                }
                // Handle other SSE event types
                else if (line.StartsWith("event: "))
                {
                    currentEventType = line.Substring(7).Trim();
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Expected when stopping
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"SSE connection error: {ex.Message}");
            OnConnectionStatusChanged($"Error: {ex.Message}");
        }
        finally
        {
            _isConnected = false;
            OnConnectionStatusChanged("Disconnected");
        }
    }

    public async Task StopAsync()
    {
        _cancellationTokenSource?.Cancel();
        _cancellationTokenSource?.Dispose();
        _cancellationTokenSource = null;
        _isConnected = false;
        OnConnectionStatusChanged("Disconnected");
        
        // This method doesn't need await since it's just cleanup
        await Task.CompletedTask;
    }

    private void OnConnectionStatusChanged(string status)
    {
        ConnectionStatusChanged?.Invoke(this, status);
    }
}

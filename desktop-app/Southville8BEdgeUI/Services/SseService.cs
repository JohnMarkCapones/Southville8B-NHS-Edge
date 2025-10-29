using System;
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

    public bool IsConnected => _isConnected;
    public event EventHandler<SidebarMetrics>? MetricsUpdated;
    public event EventHandler<AdminDashboardMetrics>? DashboardMetricsUpdated;
    public event EventHandler<TeacherSidebarMetrics>? TeacherMetricsUpdated;
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
                        
                        try
                        {
                            // Try to parse as SidebarMetrics first
                            var sidebarMetrics = JsonSerializer.Deserialize<SidebarMetrics>(json);
                            if (sidebarMetrics != null)
                            {
                                MetricsUpdated?.Invoke(this, sidebarMetrics);
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
                            var teacherMetrics = JsonSerializer.Deserialize<TeacherSidebarMetrics>(json);
                            if (teacherMetrics != null)
                            {
                                TeacherMetricsUpdated?.Invoke(this, teacherMetrics);
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
                            var dashboardMetrics = JsonSerializer.Deserialize<AdminDashboardMetrics>(json);
                            if (dashboardMetrics != null)
                            {
                                DashboardMetricsUpdated?.Invoke(this, dashboardMetrics);
                                continue;
                            }
                        }
                        catch (JsonException ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Error parsing SSE data: {ex.Message}");
                        }
                        
                        // Clear the buffer after processing
                        dataBuffer.Clear();
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
                    var eventType = line.Substring(7).Trim();
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

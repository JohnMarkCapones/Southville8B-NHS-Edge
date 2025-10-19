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
            
            System.Diagnostics.Debug.WriteLine($"Starting SSE connection to: {fullUrl}");
            
            using var response = await _httpClient.GetAsync(fullUrl, HttpCompletionOption.ResponseHeadersRead, _cancellationTokenSource.Token);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"SSE request failed with status: {response.StatusCode}");
            }

            _isConnected = true;
            OnConnectionStatusChanged("Connected");
            System.Diagnostics.Debug.WriteLine("SSE connection established successfully");

            using var stream = await response.Content.ReadAsStreamAsync();
            using var reader = new StreamReader(stream, Encoding.UTF8);

            var dataBuffer = new StringBuilder();
            
            while (!_cancellationTokenSource.Token.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync();
                
                System.Diagnostics.Debug.WriteLine($"SSE received: {line ?? "(null)"}");

                // Handle empty lines as SSE event separators
                if (string.IsNullOrEmpty(line))
                {
                    // Flush buffered data when we encounter an empty line (event separator)
                    if (dataBuffer.Length > 0)
                    {
                        var json = dataBuffer.ToString().Trim();
                        System.Diagnostics.Debug.WriteLine($"Processing buffered SSE data: {json}");
                        
                        try
                        {
                            // Try to parse as SidebarMetrics first
                            var sidebarMetrics = JsonSerializer.Deserialize<SidebarMetrics>(json);
                            if (sidebarMetrics != null)
                            {
                                System.Diagnostics.Debug.WriteLine($"Parsed sidebar metrics: Events={sidebarMetrics.Events}, Teachers={sidebarMetrics.Teachers}, Students={sidebarMetrics.Students}, Sections={sidebarMetrics.Sections}");
                                MetricsUpdated?.Invoke(this, sidebarMetrics);
                            }
                        }
                        catch (JsonException)
                        {
                            // Try parsing as AdminDashboardMetrics
                            try
                            {
                                var dashboardMetrics = JsonSerializer.Deserialize<AdminDashboardMetrics>(json);
                                if (dashboardMetrics != null)
                                {
                                    System.Diagnostics.Debug.WriteLine($"Parsed dashboard metrics: Students={dashboardMetrics.TotalStudents}, Teachers={dashboardMetrics.ActiveTeachers}, Sections={dashboardMetrics.TotalSections}");
                                    DashboardMetricsUpdated?.Invoke(this, dashboardMetrics);
                                }
                            }
                            catch (JsonException ex)
                            {
                                System.Diagnostics.Debug.WriteLine($"Error parsing SSE data: {ex.Message}");
                                System.Diagnostics.Debug.WriteLine($"Raw JSON: {json}");
                            }
                        }
                        
                        // Clear the buffer after processing
                        dataBuffer.Clear();
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("SSE separator line received (no buffered data)");
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
                    
                    System.Diagnostics.Debug.WriteLine($"Accumulated SSE data: {dataContent}");
                }
                // Handle other SSE event types
                else if (line.StartsWith("event: "))
                {
                    var eventType = line.Substring(7).Trim();
                    System.Diagnostics.Debug.WriteLine($"SSE event type: {eventType}");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"SSE unknown line format: {line}");
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Expected when stopping
            System.Diagnostics.Debug.WriteLine("SSE connection cancelled");
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
            System.Diagnostics.Debug.WriteLine("SSE connection closed");
        }
    }

    public async Task StopAsync()
    {
        System.Diagnostics.Debug.WriteLine("Stopping SSE connection...");
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

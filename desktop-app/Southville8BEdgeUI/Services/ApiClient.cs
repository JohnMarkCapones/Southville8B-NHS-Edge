using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public class ApiClient : IApiClient
{
    private readonly HttpClient _httpClient;
    private readonly ITokenStorageService _tokenStorage;
    private readonly IConfiguration _configuration;
    private readonly JsonSerializerOptions _jsonOptions;
    private string? _currentAccessToken;

    public ApiClient(HttpClient httpClient, ITokenStorageService tokenStorage, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;
        _configuration = configuration;

        // Configure HttpClient
        var apiSettings = _configuration.GetSection("ApiSettings");
        var baseUrl = apiSettings["BaseUrl"] ?? "http://localhost:3000/api";
        
        // Ensure base URL ends with a slash for proper URL combination
        if (!baseUrl.EndsWith("/"))
        {
            baseUrl += "/";
        }
        
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(int.Parse(apiSettings["Timeout"] ?? "30"));
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // Debug logging
        System.Diagnostics.Debug.WriteLine($"=== ApiClient Configuration ===");
        System.Diagnostics.Debug.WriteLine($"Base URL: {baseUrl}");
        System.Diagnostics.Debug.WriteLine($"Full BaseAddress: {_httpClient.BaseAddress}");
        System.Diagnostics.Debug.WriteLine($"Timeout: {_httpClient.Timeout}");
        System.Diagnostics.Debug.WriteLine($"Accept Header: {_httpClient.DefaultRequestHeaders.Accept}");

        // Configure JSON serialization
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<T?> GetAsync<T>(string endpoint) where T : class
    {
        return await ExecuteRequestAsync<T>(HttpMethod.Get, endpoint);
    }

    public async Task<T?> PostAsync<T>(string endpoint, object? data = null) where T : class
    {
        return await ExecuteRequestAsync<T>(HttpMethod.Post, endpoint, data);
    }

    public async Task<T?> PutAsync<T>(string endpoint, object? data = null) where T : class
    {
        return await ExecuteRequestAsync<T>(HttpMethod.Put, endpoint, data);
    }

    public async Task<T?> DeleteAsync<T>(string endpoint) where T : class
    {
        return await ExecuteRequestAsync<T>(HttpMethod.Delete, endpoint);
    }

    public async Task<bool> PostAsync(string endpoint, object? data = null)
    {
        return await ExecuteRequestAsync(HttpMethod.Post, endpoint, data);
    }

    public async Task<bool> PutAsync(string endpoint, object? data = null)
    {
        return await ExecuteRequestAsync(HttpMethod.Put, endpoint, data);
    }

    public async Task<bool> DeleteAsync(string endpoint)
    {
        return await ExecuteRequestAsync(HttpMethod.Delete, endpoint);
    }

    public async Task<UserProfile?> GetUserProfileAsync(string userId)
    {
        return await GetAsync<UserProfile>($"users/{userId}/profile");
    }

    public async Task<UserProfile?> GetUserProfileAsync(string userId, string accessToken)
    {
        // Create temporary request with token override
        using var request = new HttpRequestMessage(HttpMethod.Get, $"users/{userId}/profile");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        
        using var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        
        if (response.IsSuccessStatusCode)
        {
            return JsonSerializer.Deserialize<UserProfile>(content, _jsonOptions);
        }
        
        await HandleErrorResponseAsync(response, content);
        return null;
    }

    public async Task<AdminDashboardMetrics?> GetAdminDashboardMetricsAsync()
    {
        return await GetAsync<AdminDashboardMetrics>("desktop-admin-dashboard/metrics");
    }

    // User Management Methods
    public async Task<UserListResponse?> GetUsersAsync(string? role = null, string? status = null)
    {
        var queryParams = new List<string>();
        if (!string.IsNullOrEmpty(role)) queryParams.Add($"role={Uri.EscapeDataString(role)}");
        if (!string.IsNullOrEmpty(status)) queryParams.Add($"status={Uri.EscapeDataString(status)}");
        
        // Request all users by setting a high limit
        queryParams.Add("limit=1000");
        
        var endpoint = "users";
        if (queryParams.Any())
        {
            endpoint += "?" + string.Join("&", queryParams);
        }
        
        return await GetAsync<UserListResponse>(endpoint);
    }

    public async Task<CreateUserResponse?> CreateStudentAsync(CreateStudentDto dto)
    {
        return await PostAsync<CreateUserResponse>("users/student", dto);
    }

    public async Task<CreateUserResponse?> CreateTeacherAsync(CreateTeacherDto dto)
    {
        return await PostAsync<CreateUserResponse>("users/teacher", dto);
    }

    public async Task<CreateUserResponse?> CreateAdminAsync(CreateAdminDto dto)
    {
        return await PostAsync<CreateUserResponse>("users/admin", dto);
    }

    public async Task<bool> UpdateUserStatusAsync(string userId, string status)
    {
        try
        {
            var updateData = new { status };
            await PutAsync($"users/{userId}/status", updateData);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        try
        {
            await DeleteAsync($"users/{userId}");
            return true;
        }
        catch
        {
            return false;
        }
    }

    // Section Management Methods
    public async Task<SectionListResponse?> GetSectionsAsync(int limit = 100)
    {
        return await GetAsync<SectionListResponse>($"sections?limit={limit}");
    }

    // Building Management Methods
    public async Task<BuildingListResponse?> GetBuildingsAsync(int limit = 100)
    {
        return await GetAsync<BuildingListResponse>($"buildings?limit={limit}");
    }

    public async Task<BuildingDto?> GetBuildingByIdAsync(string id)
    {
        return await GetAsync<BuildingDto>($"buildings/{id}");
    }

    public async Task<BuildingDto?> CreateBuildingAsync(CreateBuildingDto dto)
    {
        return await PostAsync<BuildingDto>("buildings", dto);
    }

    public async Task<BuildingDto?> UpdateBuildingAsync(string id, UpdateBuildingDto dto)
    {
        return await PutAsync<BuildingDto>($"buildings/{id}", dto);
    }

    public async Task<bool> DeleteBuildingAsync(string id)
    {
        try
        {
            await DeleteAsync($"buildings/{id}");
            return true;
        }
        catch
        {
            return false;
        }
    }

    // Floor Management Methods
    public async Task<FloorListResponse?> GetFloorsAsync(string? buildingId = null, int limit = 100)
    {
        var endpoint = $"floors?limit={limit}";
        if (!string.IsNullOrEmpty(buildingId))
        {
            endpoint += $"&buildingId={Uri.EscapeDataString(buildingId)}";
        }
        return await GetAsync<FloorListResponse>(endpoint);
    }

    public async Task<FloorDto?> GetFloorByIdAsync(string id)
    {
        return await GetAsync<FloorDto>($"floors/{id}");
    }

    public async Task<FloorDto?> CreateFloorAsync(CreateFloorDto dto)
    {
        return await PostAsync<FloorDto>("floors", dto);
    }

    public async Task<FloorDto?> UpdateFloorAsync(string id, UpdateFloorDto dto)
    {
        return await PutAsync<FloorDto>($"floors/{id}", dto);
    }

    public async Task<bool> DeleteFloorAsync(string id)
    {
        try
        {
            await DeleteAsync($"floors/{id}");
            return true;
        }
        catch
        {
            return false;
        }
    }

    // Room Management Methods
    public async Task<RoomListResponse?> GetRoomsAsync(string? floorId = null, string? buildingId = null, string? status = null, int limit = 100)
    {
        var queryParams = new List<string> { $"limit={limit}" };
        if (!string.IsNullOrEmpty(floorId)) queryParams.Add($"floorId={Uri.EscapeDataString(floorId)}");
        if (!string.IsNullOrEmpty(buildingId)) queryParams.Add($"buildingId={Uri.EscapeDataString(buildingId)}");
        if (!string.IsNullOrEmpty(status)) queryParams.Add($"status={Uri.EscapeDataString(status)}");

        var endpoint = "rooms?" + string.Join("&", queryParams);
        return await GetAsync<RoomListResponse>(endpoint);
    }

    public async Task<RoomDto?> GetRoomByIdAsync(string id)
    {
        return await GetAsync<RoomDto>($"rooms/{id}");
    }

    public async Task<RoomDto?> CreateRoomAsync(CreateRoomDto dto)
    {
        return await PostAsync<RoomDto>("rooms", dto);
    }

    public async Task<List<RoomDto>?> CreateRoomsBulkAsync(string floorId, List<CreateRoomDto> rooms)
    {
        return await PostAsync<List<RoomDto>>("rooms/bulk", rooms);
    }

    public async Task<RoomDto?> UpdateRoomAsync(string id, UpdateRoomDto dto)
    {
        return await PutAsync<RoomDto>($"rooms/{id}", dto);
    }

    public async Task<bool> DeleteRoomAsync(string id)
    {
        try
        {
            await DeleteAsync($"rooms/{id}");
            return true;
        }
        catch
        {
            return false;
        }
    }

    // Department Management Methods
    public async Task<DepartmentsResponse?> GetDepartmentsAsync(int page = 1, int limit = 100)
    {
        var response = await _httpClient.GetAsync($"departments?page={page}&limit={limit}");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<DepartmentsResponse>(content, _jsonOptions);
    }

    // Subject Management Methods
    public async Task<SubjectsResponse?> GetSubjectsByDepartmentAsync(string departmentId, int page = 1, int limit = 100)
    {
        var response = await _httpClient.GetAsync($"subjects?departmentId={departmentId}&page={page}&limit={limit}");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<SubjectsResponse>(content, _jsonOptions);
    }

    public void SetAccessToken(string accessToken)
    {
        _currentAccessToken = accessToken;
        if (!string.IsNullOrEmpty(accessToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            System.Diagnostics.Debug.WriteLine($"Access token set directly: Bearer {accessToken.Substring(0, Math.Min(20, accessToken.Length))}...");
        }
        else
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
            System.Diagnostics.Debug.WriteLine("Access token cleared");
        }
    }

    private async Task<T?> ExecuteRequestAsync<T>(HttpMethod method, string endpoint, object? data = null) where T : class
    {
        try
        {
            // Debug logging
            System.Diagnostics.Debug.WriteLine($"=== API Request ===");
            System.Diagnostics.Debug.WriteLine($"Method: {method}");
            System.Diagnostics.Debug.WriteLine($"Endpoint: {endpoint}");
            System.Diagnostics.Debug.WriteLine($"Full URL: {_httpClient.BaseAddress}{endpoint}");
            System.Diagnostics.Debug.WriteLine($"Data: {(data != null ? JsonSerializer.Serialize(data, _jsonOptions) : "null")}");

            await EnsureAuthenticatedAsync();

            using var request = new HttpRequestMessage(method, endpoint);

            if (data != null && (method == HttpMethod.Post || method == HttpMethod.Put))
            {
                var json = JsonSerializer.Serialize(data, _jsonOptions);
                request.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                System.Diagnostics.Debug.WriteLine($"Request Body: {json}");
            }

            System.Diagnostics.Debug.WriteLine($"Sending request to: {request.RequestUri}");
            using var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            System.Diagnostics.Debug.WriteLine($"=== API Response ===");
            System.Diagnostics.Debug.WriteLine($"Status Code: {response.StatusCode}");
            System.Diagnostics.Debug.WriteLine($"Response Content: {content}");

            if (response.IsSuccessStatusCode)
            {
                if (typeof(T) == typeof(string))
                {
                    return content as T;
                }

                if (string.IsNullOrEmpty(content))
                {
                    return null;
                }

                return JsonSerializer.Deserialize<T>(content, _jsonOptions);
            }

            await HandleErrorResponseAsync(response, content);
            return null;
        }
        catch (HttpRequestException ex)
        {
            System.Diagnostics.Debug.WriteLine($"HTTP request failed: {ex.Message}");
            throw new ApiException("Network error occurred. Please check your internet connection.", ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            System.Diagnostics.Debug.WriteLine($"Request timeout: {ex.Message}");
            throw new ApiException("Request timed out. Please try again.", ex);
        }
        catch (JsonException ex)
        {
            System.Diagnostics.Debug.WriteLine($"JSON deserialization failed: {ex.Message}");
            throw new ApiException("Invalid response format from server.", ex);
        }
        catch (ApiException)
        {
            // Re-throw ApiException and its subclasses (UnauthorizedException, etc.) without wrapping
            throw;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Unexpected error: {ex.Message}");
            throw new ApiException("An unexpected error occurred.", ex);
        }
    }

    private async Task<bool> ExecuteRequestAsync(HttpMethod method, string endpoint, object? data = null)
    {
        try
        {
            await EnsureAuthenticatedAsync();

            using var request = new HttpRequestMessage(method, endpoint);

            if (data != null && (method == HttpMethod.Post || method == HttpMethod.Put))
            {
                var json = JsonSerializer.Serialize(data, _jsonOptions);
                request.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            }

            using var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            await HandleErrorResponseAsync(response, content);
            return false;
        }
        catch (HttpRequestException ex)
        {
            System.Diagnostics.Debug.WriteLine($"HTTP request failed: {ex.Message}");
            throw new ApiException("Network error occurred. Please check your internet connection.", ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            System.Diagnostics.Debug.WriteLine($"Request timeout: {ex.Message}");
            throw new ApiException("Request timed out. Please try again.", ex);
        }
        catch (ApiException)
        {
            // Re-throw ApiException and its subclasses without wrapping
            throw;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Unexpected error: {ex.Message}");
            throw new ApiException("An unexpected error occurred.", ex);
        }
    }

    private async Task EnsureAuthenticatedAsync()
    {
        // Use cached token first, then fall back to storage
        var accessToken = _currentAccessToken ?? await _tokenStorage.GetAccessTokenAsync();
        System.Diagnostics.Debug.WriteLine($"=== Token Check ===");
        System.Diagnostics.Debug.WriteLine($"Cached token present: {!string.IsNullOrEmpty(_currentAccessToken)}");
        System.Diagnostics.Debug.WriteLine($"Access token present: {!string.IsNullOrEmpty(accessToken)}");
        System.Diagnostics.Debug.WriteLine($"Token length: {accessToken?.Length ?? 0}");
        
        if (!string.IsNullOrEmpty(accessToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            System.Diagnostics.Debug.WriteLine($"Authorization header set: Bearer {accessToken.Substring(0, Math.Min(20, accessToken.Length))}...");
        }
        else
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
            System.Diagnostics.Debug.WriteLine("No authorization header set");
        }
    }

    private async Task HandleErrorResponseAsync(HttpResponseMessage response, string content)
    {
        ApiError? apiError = null;
        string errorMessage = "Unknown error occurred";

        try
        {
            if (!string.IsNullOrEmpty(content))
            {
                System.Diagnostics.Debug.WriteLine($"Attempting to parse error response: {content}");
                apiError = JsonSerializer.Deserialize<ApiError>(content, _jsonOptions);
                
                if (apiError != null)
                {
                    errorMessage = apiError.Message;
                    System.Diagnostics.Debug.WriteLine($"Parsed error message: {errorMessage}");
                }
            }
        }
        catch (JsonException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to parse error response as ApiError: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Raw content: {content}");
            
            // Try to extract a meaningful error message from the raw content
            if (!string.IsNullOrEmpty(content))
            {
                // Look for common error patterns in the response
                if (content.Contains("\"message\""))
                {
                    // Try to extract message value manually
                    var messageStart = content.IndexOf("\"message\":");
                    if (messageStart >= 0)
                    {
                        var messageEnd = content.IndexOf("\"", messageStart + 10);
                        if (messageEnd > messageStart + 10)
                        {
                            var extractedMessage = content.Substring(messageStart + 10, messageEnd - messageStart - 10);
                            if (!string.IsNullOrEmpty(extractedMessage))
                            {
                                errorMessage = extractedMessage.Trim('"', '[', ']');
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Unexpected error parsing response: {ex.Message}");
        }

        // Fallback to status code reason phrase if we still don't have a meaningful message
        if (string.IsNullOrEmpty(errorMessage) || errorMessage == "Unknown error occurred")
        {
            errorMessage = response.ReasonPhrase ?? $"HTTP {response.StatusCode}";
        }

        System.Diagnostics.Debug.WriteLine($"Final error message: {errorMessage}");

        switch (response.StatusCode)
        {
            case System.Net.HttpStatusCode.Unauthorized:
                // Clear tokens on 401
                await _tokenStorage.ClearTokensAsync();
                throw new UnauthorizedException(errorMessage);
            case System.Net.HttpStatusCode.TooManyRequests:
                throw new TooManyRequestsException(errorMessage);
            case System.Net.HttpStatusCode.BadRequest:
                throw new BadRequestException(errorMessage);
            case System.Net.HttpStatusCode.NotFound:
                throw new NotFoundException("The requested resource was not found.");
            case System.Net.HttpStatusCode.InternalServerError:
                throw new ServerException("Server error occurred. Please try again later.");
            default:
                throw new ApiException($"Request failed with status {response.StatusCode}: {errorMessage}");
        }
    }
}

// Custom exception classes for better error handling
public class ApiException : Exception
{
    public ApiException(string message) : base(message) { }
    public ApiException(string message, Exception innerException) : base(message, innerException) { }
}

public class UnauthorizedException : ApiException
{
    public UnauthorizedException(string message) : base(message) { }
}

public class TooManyRequestsException : ApiException
{
    public TooManyRequestsException(string message) : base(message) { }
}

public class BadRequestException : ApiException
{
    public BadRequestException(string message) : base(message) { }
}

public class NotFoundException : ApiException
{
    public NotFoundException(string message) : base(message) { }
}

public class ServerException : ApiException
{
    public ServerException(string message) : base(message) { }
}

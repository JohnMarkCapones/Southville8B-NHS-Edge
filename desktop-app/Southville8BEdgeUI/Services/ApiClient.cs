using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Southville8BEdgeUI.Models.Api;
using System.IdentityModel.Tokens.Jwt;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace Southville8BEdgeUI.Services;

public class ApiClient : IApiClient
{
    private readonly HttpClient _httpClient;
    private readonly ITokenStorageService _tokenStorage;
    private readonly IConfiguration _configuration;
    private readonly JsonSerializerOptions _jsonOptions;
    private string? _currentAccessToken;

    // In-flight de-duplication (GET only)
    private readonly ConcurrentDictionary<string, Task<HttpStringResult>> _inFlightGets = new();

    // Simple in-memory cache (GET only)
    private readonly ConcurrentDictionary<string, CacheEntry> _cache = new();

    public ApiClient(HttpClient httpClient, ITokenStorageService tokenStorage, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;
        _configuration = configuration;

        // Configure HttpClient
        var apiSettings = _configuration.GetSection("ApiSettings");
        var baseUrl = apiSettings["BaseUrl"] ?? "https://southville-nhs-api.onrender.com/api/v1";
        
        // Ensure base URL ends with a slash for proper URL combination
        if (!baseUrl.EndsWith("/"))
        {
            baseUrl += "/";
        }
        
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(int.Parse(apiSettings["Timeout"] ?? "120"));
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
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull // avoid sending nulls in PATCH/POST
        };
    }

    public async Task<T?> GetAsync<T>(string endpoint) where T : class
    {
        return await ExecuteGetWithCacheAsync<T>(endpoint);
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

    public async Task<T?> PatchAsync<T>(string endpoint, object? data = null) where T : class
    {
        return await ExecuteRequestAsync<T>(HttpMethod.Patch, endpoint, data);
    }

    public async Task<bool> PatchAsync(string endpoint, object? data = null)
    {
        return await ExecuteRequestAsync(HttpMethod.Patch, endpoint, data);
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

    public async Task<List<AdminActivity>?> GetAdminActivitiesAsync(int limit = 10)
    {
        return await GetAsync<List<AdminActivity>>($"desktop-admin-dashboard/activities?limit={limit}");
    }

    // User Management Methods
    public async Task<UserListResponse?> GetUsersAsync(string? role = null, string? status = null, string? search = null, int page = 1, int limit = 25)
    {
        var queryParams = new List<string>();
  
        if (!string.IsNullOrEmpty(role) && role != "All Roles")
            queryParams.Add($"role={Uri.EscapeDataString(role)}");
        
        if (!string.IsNullOrEmpty(status) && status != "All Status")
            queryParams.Add($"status={Uri.EscapeDataString(status)}");
        
        // ✅ NEW: Add search parameter
        if (!string.IsNullOrEmpty(search))
            queryParams.Add($"search={Uri.EscapeDataString(search)}");
        
        queryParams.Add($"page={page}");
        queryParams.Add($"limit={limit}");
        
        var queryString = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
        
        System.Diagnostics.Debug.WriteLine($"[ApiClient] GetUsersAsync URL: users{queryString}");
        
        return await GetAsync<UserListResponse>($"users{queryString}");
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

    public async Task<bool> UpdateUserAsync(string userId, UpdateUserDto dto)
    {
        try
        {
            await PatchAsync($"users/{userId}", dto);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateStudentAsync(string userId, UpdateStudentDto dto)
    {
        try
        {
            await PatchAsync($"students/{userId}", dto);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateTeacherAsync(string userId, UpdateTeacherDto dto)
    {
        try
        {
            await PatchAsync($"teachers/{userId}", dto);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateAdminAsync(string userId, UpdateAdminDto dto)
    {
        try
        {
            await PatchAsync($"admins/{userId}", dto);
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

    public async Task<BulkImportResultDto?> ImportStudentsCsvAsync(ImportStudentsCsvDto dto)
    {
        try
        {
            return await PostAsync<BulkImportResultDto>("users/import-students-csv", dto);
        }
        catch
        {
            return null;
        }
    }

    public async Task<BulkImportResultDto?> ImportTeachersCsvAsync(ImportTeachersCsvDto dto)
    {
        try
        {
            return await PostAsync<BulkImportResultDto>("users/import-teachers-csv", dto);
        }
        catch
        {
            return null;
        }
    }

    public async Task<ResetPasswordResponseDto?> ResetPasswordAsync(string userId)
    {
        try
        {
            var request = new ResetPasswordRequestDto { UserId = userId };
            return await PostAsync<ResetPasswordResponseDto>("auth/reset-password", request);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error resetting password: {ex.Message}");
            return null;
        }
    }

    public async Task<ChangePasswordResponseDto?> ChangePasswordAsync(string currentPassword, string newPassword)
    {
        try
        {
            var request = new ChangePasswordRequestDto 
            { 
                CurrentPassword = currentPassword, 
                NewPassword = newPassword 
            };
            return await PostAsync<ChangePasswordResponseDto>("auth/change-password", request);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error changing password: {ex.Message}");
            return null;
        }
    }

    public async Task<AdminChangePasswordResponseDto?> AdminChangePasswordAsync(string userId, string newPassword)
    {
        try
        {
            var request = new AdminChangePasswordRequestDto 
            { 
                UserId = userId, 
                NewPassword = newPassword 
            };
            return await PostAsync<AdminChangePasswordResponseDto>("auth/admin-change-password", request);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error changing password as admin: {ex.Message}");
            return null;
        }
    }

    public async Task<ForgotPasswordResponseDto?> SendPasswordResetEmailAsync(string email)
    {
        try
        {
            var request = new ForgotPasswordRequestDto 
            { 
                Email = email 
            };
            return await PostAsync<ForgotPasswordResponseDto>("auth/forgot-password", request);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error sending password reset email: {ex.Message}");
            return null;
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
        return await PatchAsync<BuildingDto>($"buildings/{id}", dto);
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

    public async Task<List<RoomDto>?> CreateRoomsBulkAsync(List<CreateRoomDto> rooms)
    {
        return await PostAsync<List<RoomDto>>("rooms/bulk", rooms);
    }

    public async Task<RoomDto?> UpdateRoomAsync(string id, UpdateRoomDto dto)
    {
        return await PatchAsync<RoomDto>($"rooms/{id}", dto);
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
        return await GetAsync<DepartmentsResponse>($"departments?page={page}&limit={limit}");
    }

    // Subject Management Methods
    public async Task<SubjectsResponse?> GetSubjectsByDepartmentAsync(string departmentId, int page = 1, int limit = 100)
    {
        return await GetAsync<SubjectsResponse>($"subjects?departmentId={departmentId}&page={page}&limit={limit}");
    }

    // Event Management Methods
    public async Task<EventListResponse?> GetEventsAsync(int page = 1, int limit = 10, string? status = null, string? search = null, string? tagId = null)
    {
        try
        {
            var queryParams = new List<string> { $"page={page}", $"limit={limit}" };
            
            if (!string.IsNullOrEmpty(status))
                queryParams.Add($"status={Uri.EscapeDataString(status)}");
            
            if (!string.IsNullOrEmpty(search))
                queryParams.Add($"search={Uri.EscapeDataString(search)}");
            
            if (!string.IsNullOrEmpty(tagId))
                queryParams.Add($"tagId={Uri.EscapeDataString(tagId)}");

            var endpoint = $"events?{string.Join("&", queryParams)}";
            return await GetAsync<EventListResponse>(endpoint);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching events: {ex.Message}");
            return null;
        }
    }

    public async Task<EventStatisticsDto?> GetEventStatisticsAsync()
    {
        try
        {
            return await GetAsync<EventStatisticsDto>("events/statistics");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching event statistics: {ex.Message}");
            return null;
        }
    }

    public async Task<List<TagDto>?> GetEventTagsAsync()
    {
        try
        {
            return await GetAsync<List<TagDto>>("events/tags");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching event tags: {ex.Message}");
            return null;
        }
    }

    public async Task<EventDto?> GetEventByIdAsync(string id)
    {
        try
        {
            return await GetAsync<EventDto>($"events/{id}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching event by ID: {ex.Message}");
            return null;
        }
    }

    public async Task<EventDto?> CreateEventAsync(CreateEventDto dto)
    {
        try
        {
            return await PostAsync<EventDto>("events", dto);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error creating event: {ex.Message}");
            return null;
        }
    }

    public async Task<EventDto?> UpdateEventAsync(string id, UpdateEventDto dto)
    {
        try
        {
            return await PatchAsync<EventDto>($"events/{id}", dto);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating event: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteEventAsync(string id)
    {
        try
        {
            return await DeleteAsync($"events/{id}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting event: {ex.Message}");
            return false;
        }
    }

    // Event FAQ Management Methods
    public async Task<EventFaqDto?> AddEventFaqAsync(string eventId, CreateEventFaqDto dto)
    {
        try
        {
            return await PostAsync<EventFaqDto>($"events/{eventId}/faq", dto);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error adding FAQ: {ex.Message}");
            return null;
        }
    }

    public async Task<EventFaqDto?> UpdateEventFaqAsync(string eventId, string faqId, UpdateEventFaqDto dto)
    {
        try
        {
            return await PatchAsync<EventFaqDto>($"events/{eventId}/faq/{faqId}", dto);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating FAQ: {ex.Message}");
            return null;
        }
    }

    public async Task DeleteEventFaqAsync(string eventId, string faqId)
    {
        try
        {
            await DeleteAsync($"events/{eventId}/faq/{faqId}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting FAQ: {ex.Message}");
            throw;
        }
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

            if (data != null && (method == HttpMethod.Post || method == HttpMethod.Put || method == HttpMethod.Patch))
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

    private sealed class HttpStringResult
    {
        public int StatusCode { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ETag { get; set; }
    }

    private sealed class CacheEntry
    {
        public DateTime ExpiresAt { get; set; }
        public string RawJson { get; set; } = string.Empty;
        public string? ETag { get; set; }
    }

    private TimeSpan GetTtlForEndpoint(string endpoint)
    {
        // Normalize just by path prefix
        var key = endpoint.ToLowerInvariant();
        if (key.StartsWith("users/")) return TimeSpan.FromMinutes(5);
        if (key.StartsWith("buildings")) return TimeSpan.FromMinutes(10);
        if (key.StartsWith("rooms")) return TimeSpan.FromMinutes(10);
        if (key.StartsWith("departments")) return TimeSpan.FromMinutes(10);
        if (key.StartsWith("events")) return TimeSpan.FromMinutes(2);
        if (key.StartsWith("schedules")) return TimeSpan.FromMinutes(1);
        if (key.StartsWith("desktop-sidebar/student-distribution")) return TimeSpan.FromMinutes(2);
        return TimeSpan.Zero;
    }

    public void InvalidateCachePrefix(string prefix)
    {
        if (string.IsNullOrWhiteSpace(prefix)) return;
        var normalized = prefix.ToLowerInvariant();
        foreach (var key in _cache.Keys.ToList())
        {
            if (key.StartsWith(normalized))
            {
                _cache.TryRemove(key, out _);
                Debug.WriteLine($"[ApiClient][Cache] INVALIDATE {key}");
            }
        }
    }

    private async Task<T?> ExecuteGetWithCacheAsync<T>(string endpoint) where T : class
    {
        await EnsureAuthenticatedAsync();

        var cacheKey = endpoint.ToLowerInvariant();
        var ttl = GetTtlForEndpoint(endpoint);

        // Lookup existing cache entry (may be null)
        CacheEntry? cached = null;
        if (ttl > TimeSpan.Zero)
        {
            _cache.TryGetValue(cacheKey, out cached);
        }

        // Serve from cache when valid
        if (ttl > TimeSpan.Zero && cached != null && cached.ExpiresAt > DateTime.UtcNow)
        {
            Debug.WriteLine($"[ApiClient][Cache] HIT {endpoint}");
            return string.IsNullOrEmpty(cached.RawJson)
                ? null
                : JsonSerializer.Deserialize<T>(cached.RawJson, _jsonOptions);
        }

        // De-duplicate concurrent identical GETs
        var task = _inFlightGets.GetOrAdd(cacheKey, _ => SendGetReturningStringAsync(endpoint, cached?.ETag));
        HttpStringResult result;
        try
        {
            result = await task;
        }
        finally
        {
            _inFlightGets.TryRemove(cacheKey, out _);
        }

        // Handle 304 Not Modified via cached content
        if (result.StatusCode == 304 && cached != null)
        {
            Debug.WriteLine($"[ApiClient][Cache] 304 for {endpoint} – reusing cached body");
            if (ttl > TimeSpan.Zero)
            {
                cached.ExpiresAt = DateTime.UtcNow.Add(ttl);
                _cache[cacheKey] = cached;
            }
            return string.IsNullOrEmpty(cached.RawJson)
                ? null
                : JsonSerializer.Deserialize<T>(cached.RawJson, _jsonOptions);
        }

        // Non-success codes fall back to normal error handling path
        if (result.StatusCode < 200 || result.StatusCode >= 300)
        {
            await HandleErrorResponseAsync(new HttpResponseMessage((System.Net.HttpStatusCode)result.StatusCode), result.Content);
            return null;
        }

        // Cache successful responses
        if (ttl > TimeSpan.Zero)
        {
            _cache[cacheKey] = new CacheEntry
            {
                RawJson = result.Content,
                ExpiresAt = DateTime.UtcNow.Add(ttl),
                ETag = result.ETag
            };
            Debug.WriteLine($"[ApiClient][Cache] SET {endpoint} ttl={ttl.TotalSeconds}s etag={(result.ETag ?? "-")}");
        }

        if (typeof(T) == typeof(string))
            return result.Content as T;
        if (string.IsNullOrEmpty(result.Content))
            return null;
        return JsonSerializer.Deserialize<T>(result.Content, _jsonOptions);
    }

    private async Task<HttpStringResult> SendGetReturningStringAsync(string endpoint, string? priorEtag)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        if (!string.IsNullOrEmpty(priorEtag))
        {
            request.Headers.IfNoneMatch.Clear();
            request.Headers.IfNoneMatch.Add(new EntityTagHeaderValue($"\"{priorEtag}\""));
        }

        Debug.WriteLine($"[ApiClient][HTTP] GET {request.RequestUri} (If-None-Match={(priorEtag ?? "-")})");

        using var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        string? etag = response.Headers.ETag?.Tag?.Trim('"');

        Debug.WriteLine($"[ApiClient][HTTP] {response.StatusCode} (ETag={(etag ?? "-")})");

        return new HttpStringResult
        {
            StatusCode = (int)response.StatusCode,
            Content = content,
            ETag = etag
        };
    }

    private async Task<bool> ExecuteRequestAsync(HttpMethod method, string endpoint, object? data = null)
    {
        try
        {
            await EnsureAuthenticatedAsync();

            using var request = new HttpRequestMessage(method, endpoint);

            if (data != null && (method == HttpMethod.Post || method == HttpMethod.Put || method == HttpMethod.Patch))
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

    public string? GetCurrentUserId()
    {
        try
        {
            var token = GetCachedToken();
            if (string.IsNullOrEmpty(token))
                return null;

            // Parse JWT token
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);

            // Extract user ID from 'sub' claim (standard JWT claim for subject/user ID)
            var userId = jsonToken.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                // Fallback: try 'user_id' claim
                userId = jsonToken.Claims.FirstOrDefault(x => x.Type == "user_id")?.Value;
            }

            return userId;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error extracting user ID from token: {ex.Message}");
            return null;
        }
    }

    public async Task<string?> UploadEventImageAsync(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                Debug.WriteLine($"File not found: {filePath}");
                return null;
            }

            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(File.ReadAllBytes(filePath));
            fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(GetMimeType(filePath));
            content.Add(fileContent, "image", Path.GetFileName(filePath));

            var response = await _httpClient.PostAsync("events/upload-image", content);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var json = JsonSerializer.Deserialize<JsonElement>(result);
                return json.GetProperty("url").GetString();
            }

            Debug.WriteLine($"Upload failed: {response.StatusCode}");
            return null;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error uploading image: {ex.Message}");
            return null;
        }
    }

    private string GetMimeType(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }

    public string? GetCachedToken()
    {
        return _currentAccessToken ?? _tokenStorage.GetAccessTokenAsync().Result;
    }

    // Alerts API
    public async Task<AlertListResponse?> GetAlertsAsync(int page = 1, int limit = 50)
    {
        try
        {
            return await GetAsync<AlertListResponse>($"alerts?page={page}&limit={limit}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching alerts: {ex.Message}");
            return null;
        }
    }

    public async Task<AlertDto?> CreateAlertAsync(CreateAlertDto dto)
    {
        try
        {
            return await PostAsync<AlertDto>("alerts", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error creating alert: {ex.Message}");
            return null;
        }
    }

    public async Task<AlertDto?> UpdateAlertAsync(string id, UpdateAlertDto dto)
    {
        try
        {
            return await PatchAsync<AlertDto>($"alerts/{id}", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error updating alert: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteAlertAsync(string id)
    {
        try
        {
            return await DeleteAsync($"alerts/{id}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting alert: {ex.Message}");
            return false;
        }
    }

    public async Task<AlertListResponse?> GetMyAlertsAsync(int page = 1, int limit = 50)
    {
        try
        {
            return await GetAsync<AlertListResponse>($"alerts/my?page={page}&limit={limit}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching my alerts: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> MarkAlertAsReadAsync(string alertId)
    {
        try
        {
            var result = await PostAsync<MarkAlertReadResponse>($"alerts/{alertId}/read", new { });
            return result?.Success ?? false;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error marking alert as read: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> MarkAllAlertsAsReadAsync()
    {
        try
        {
            // Fetch all unread alerts
            var alertsResponse = await GetMyAlertsAsync(1, 1000); // Large limit to get all
            if (alertsResponse?.Data == null)
                return false;

            var unreadAlerts = alertsResponse.Data.Where(a => !a.IsRead).ToList();
            if (unreadAlerts.Count == 0)
                return true;

            // Mark each as read
            var tasks = unreadAlerts.Select(alert => MarkAlertAsReadAsync(alert.Id));
            var results = await Task.WhenAll(tasks);

            return results.All(r => r);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error marking all alerts as read: {ex.Message}");
            return false;
        }
    }

    // Notifications API
    public async Task<NotificationListResponse?> GetMyNotificationsAsync(int page = 1, int limit = 50)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Fetching notifications: page={page}, limit={limit}");
            var response = await GetAsync<NotificationListResponse>($"notifications/my?page={page}&limit={limit}");
            if (response != null)
            {
                System.Diagnostics.Debug.WriteLine($"[ApiClient] Notifications response: Found {response.Data?.Count ?? 0} notifications");
                System.Diagnostics.Debug.WriteLine($"[ApiClient] Total: {response.Total}, Page: {response.Page}, Limit: {response.Limit}, TotalPages: {response.TotalPages}");
                if (response.Data != null && response.Data.Count > 0)
                {
                    System.Diagnostics.Debug.WriteLine($"[ApiClient] First notification: Id={response.Data[0].Id}, Title={response.Data[0].Title}, Type={response.Data[0].Type}, IsRead={response.Data[0].IsRead}");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"[ApiClient] Notifications response is null");
            }
            return response;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Error fetching my notifications: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Stack trace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<bool> MarkNotificationAsReadAsync(string notificationId)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Marking notification as read: {notificationId}");
            var result = await PatchAsync<MarkNotificationReadResponse>($"notifications/{notificationId}/read", new { });
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Mark notification result: {result?.Success ?? false}");
            return result?.Success ?? false;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error marking notification as read: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> MarkAllNotificationsAsReadAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Marking all notifications as read");
            var result = await PostAsync<MarkNotificationReadResponse>("notifications/mark-all-read", new { });
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Mark all notifications result: {result?.Success ?? false}");
            return result?.Success ?? false;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error marking all notifications as read: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteNotificationAsync(string notificationId)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Deleting notification: {notificationId}");
            var result = await DeleteAsync($"notifications/{notificationId}");
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Delete notification result: {result}");
            return result;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting notification: {ex.Message}");
            return false;
        }
    }

    public async Task<int> GetUnreadNotificationCountAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Getting unread notification count");
            var response = await GetAsync<UnreadNotificationCountResponse>("notifications/unread-count");
            System.Diagnostics.Debug.WriteLine($"[ApiClient] Unread count: {response?.Count ?? 0}");
            return response?.Count ?? 0;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error getting unread notification count: {ex.Message}");
            return 0;
        }
    }

    // Teacher-specific API methods
    public async Task<TeacherSidebarMetrics?> GetTeacherMetricsAsync(string teacherId)
    {
        try
        {
            return await GetAsync<TeacherSidebarMetrics>($"desktop-sidebar/teacher/kpi");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting teacher metrics: {ex.Message}");
            return null;
        }
    }

    public async Task<List<ScheduleDto>?> GetTeacherTodaySchedulesAsync(string teacherId)
    {
        try
        {
            return await GetAsync<List<ScheduleDto>>($"schedules/teacher/today");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting teacher today schedules: {ex.Message}");
            return null;
        }
    }

    public async Task<List<TeacherActivityDto>?> GetTeacherRecentActivitiesAsync(string teacherId)
    {
        try
        {
            return await GetAsync<List<TeacherActivityDto>>($"teacher-activity/recent");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting teacher recent activities: {ex.Message}");
            return null;
        }
    }

    public async Task<List<TeacherActivityDto>?> GetMyTeacherActivitiesAsync(int limit = 10)
    {
        try
        {
            Debug.WriteLine($"=== GetMyTeacherActivitiesAsync called with limit={limit} ===");
            var response = await GetAsync<List<TeacherOwnActivityDto>>($"desktop-teacher-dashboard/activities?limit={limit}");
            
            Debug.WriteLine($"API response: {(response == null ? "NULL" : $"{response.Count} items")}");
            
            if (response == null)
            {
                Debug.WriteLine("Response is null, returning null");
                return null;
            }
            
            if (response.Count > 0)
            {
                Debug.WriteLine($"First activity - UserName: {response[0].UserName}, Description: {response[0].Description}");
            }
            
            // Map to TeacherActivityDto for display
            var result = response.Select(a => new TeacherActivityDto
            {
                StudentName = a.UserName ?? "Unknown User",
                StudentInitials = GetInitials(a.UserName ?? "U"),
                Activity = a.Description ?? "No description",
                TimeAgo = FormatTimeAgo(a.CreatedAt)
            }).ToList();
            
            Debug.WriteLine($"Mapped {result.Count} activities");
            return result;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting my teacher activities: {ex.Message}");
            Debug.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    private string GetInitials(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "U";
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "U";
        if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }

    private string FormatTimeAgo(DateTime timestamp)
    {
        var now = DateTime.Now;
        var diff = now - timestamp;
        
        if (diff.TotalMinutes < 60)
            return $"{(int)diff.TotalMinutes}min ago";
        if (diff.TotalHours < 24)
            return $"{(int)diff.TotalHours}hr{((int)diff.TotalHours > 1 ? "s" : "")} ago";
        if (diff.TotalDays < 7)
            return $"{(int)diff.TotalDays}day{((int)diff.TotalDays > 1 ? "s" : "")} ago";
        return timestamp.ToString("MMM dd");
    }

    // GWA Management Methods
    public async Task<StudentGwaListResponse?> GetAdvisoryStudentsWithGwaAsync(string gradingPeriod, string schoolYear)
    {
        try
        {
            var endpoint = $"gwa/teacher/advisory-students?grading_period={Uri.EscapeDataString(gradingPeriod)}&school_year={Uri.EscapeDataString(schoolYear)}";
            Debug.WriteLine($"GetAdvisoryStudentsWithGwaAsync: Calling endpoint: {endpoint}");
            
            var result = await GetAsync<StudentGwaListResponse>(endpoint);
            
            Debug.WriteLine($"GetAdvisoryStudentsWithGwaAsync: Result is null? {result == null}");
            if (result != null)
            {
                Debug.WriteLine($"GetAdvisoryStudentsWithGwaAsync: Students count: {result.Students?.Count ?? 0}");
                Debug.WriteLine($"GetAdvisoryStudentsWithGwaAsync: Section: {result.SectionName}");
            }
            
            return result;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"GetAdvisoryStudentsWithGwaAsync: Exception - {ex.Message}");
            return null;
        }
    }

    public async Task<StudentGwaDto?> CreateGwaEntryAsync(CreateGwaDto dto)
    {
        try
        {
            Debug.WriteLine($"CreateGwaEntryAsync: Creating GWA entry for student {dto.StudentId}");
            Debug.WriteLine($"CreateGwaEntryAsync: GWA={dto.Gwa}, Period={dto.GradingPeriod}, Year={dto.SchoolYear}");
            Debug.WriteLine($"CreateGwaEntryAsync: Remarks={dto.Remarks}, HonorStatus={dto.HonorStatus}");
            
            var result = await PostAsync<StudentGwaDto>("gwa", dto);
            
            if (result != null)
            {
                Debug.WriteLine($"CreateGwaEntryAsync: ✅ Success - Created GWA entry with ID: {result.GwaId}");
            }
            else
            {
                Debug.WriteLine($"CreateGwaEntryAsync: ❌ Failed - API returned null");
            }
            
            return result;
        }
        catch (ApiException)
        {
            // Re-throw ApiException to preserve the error message
            throw;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"CreateGwaEntryAsync: 💥 Exception - {ex.Message}");
            Debug.WriteLine($"CreateGwaEntryAsync: 💥 Stack trace - {ex.StackTrace}");
            return null;
        }
    }

    public async Task<StudentGwaDto?> UpdateGwaEntryAsync(string id, UpdateGwaDto dto)
    {
        try
        {
            Debug.WriteLine($"UpdateGwaEntryAsync: Updating GWA entry {id} with PATCH method");
            return await PatchAsync<StudentGwaDto>($"gwa/{id}", dto);
        }
        catch (ApiException)
        {
            // Re-throw ApiException to preserve the error message
            throw;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error updating GWA entry: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteGwaEntryAsync(string id)
    {
        try
        {
            return await DeleteAsync($"gwa/{id}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting GWA entry: {ex.Message}");
            return false;
        }
    }

    // Schedule Management Methods
    public async Task<ScheduleListResponse?> GetSchedulesAsync(int page = 1, int limit = 20, string? sectionId = null, string? teacherId = null, string? dayOfWeek = null, string? schoolYear = null, string? semester = null)
    {
        try
        {
            var queryParams = new List<string>();
            queryParams.Add($"page={page}");
            queryParams.Add($"limit={limit}");
            
            if (!string.IsNullOrEmpty(sectionId))
                queryParams.Add($"sectionId={Uri.EscapeDataString(sectionId)}");
            if (!string.IsNullOrEmpty(teacherId))
                queryParams.Add($"teacherId={Uri.EscapeDataString(teacherId)}");
            if (!string.IsNullOrEmpty(dayOfWeek))
                queryParams.Add($"dayOfWeek={Uri.EscapeDataString(dayOfWeek)}");
            if (!string.IsNullOrEmpty(schoolYear))
                queryParams.Add($"schoolYear={Uri.EscapeDataString(schoolYear)}");
            if (!string.IsNullOrEmpty(semester))
                queryParams.Add($"semester={Uri.EscapeDataString(semester)}");

            var endpoint = $"schedules?{string.Join("&", queryParams)}";
            return await GetAsync<ScheduleListResponse>(endpoint);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting schedules: {ex.Message}");
            return null;
        }
    }

    public async Task<ScheduleDto?> GetScheduleByIdAsync(string scheduleId)
    {
        try
        {
            return await GetAsync<ScheduleDto>($"schedules/{scheduleId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting schedule by ID: {ex.Message}");
            return null;
        }
    }

    public async Task<ScheduleDto?> CreateScheduleAsync(CreateScheduleDto dto)
    {
        try
        {
            return await PostAsync<ScheduleDto>("schedules", dto);
        }
        catch (ApiException)
        {
            throw; // Re-throw ApiException to preserve error details
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error creating schedule: {ex.Message}");
            return null;
        }
    }

    public async Task<ScheduleDto?> UpdateScheduleAsync(string scheduleId, UpdateScheduleDto dto)
    {
        try
        {
            return await PatchAsync<ScheduleDto>($"schedules/{scheduleId}", dto);
        }
        catch (ApiException)
        {
            throw; // Re-throw ApiException to preserve error details
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error updating schedule: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteScheduleAsync(string scheduleId)
    {
        try
        {
            return await DeleteAsync($"schedules/{scheduleId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting schedule: {ex.Message}");
            return false;
        }
    }

    public async Task<List<ScheduleDto>?> BulkCreateSchedulesAsync(List<CreateScheduleDto> schedules)
    {
        try
        {
            return await PostAsync<List<ScheduleDto>>("schedules/bulk", schedules);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error bulk creating schedules: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> AssignStudentsToScheduleAsync(string scheduleId, AssignStudentsDto dto)
    {
        try
        {
            return await PostAsync($"schedules/{scheduleId}/assign-students", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error assigning students to schedule: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> RemoveStudentsFromScheduleAsync(string scheduleId, List<string> studentIds)
    {
        try
        {
            var dto = new AssignStudentsDto { StudentIds = studentIds };
            return await PostAsync($"schedules/{scheduleId}/remove-students", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error removing students from schedule: {ex.Message}");
            return false;
        }
    }

    public async Task<ConflictCheckResult?> CheckScheduleConflictsAsync(CreateScheduleDto dto)
    {
        try
        {
            return await PostAsync<ConflictCheckResult>("schedules/conflict-check", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error checking schedule conflicts: {ex.Message}");
            return null;
        }
    }

    public async Task<List<Subject>?> GetSubjectsAsync()
    {
        try
        {
            var response = await GetAsync<SubjectsResponse>("subjects");
            return response?.Data;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting subjects: {ex.Message}");
            return null;
        }
    }

    public async Task<List<SectionDto>?> GetSectionsAsync()
    {
        try
        {
            var response = await GetAsync<SectionListResponse>("sections?limit=100");
            return response?.Data;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting sections: {ex.Message}");
            return null;
        }
    }

    public async Task<List<UserDto>?> GetTeachersAsync()
    {
        try
        {
            var response = await GetAsync<UserListResponse>("users?role=teacher&limit=100");
            return response?.Users;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting teachers: {ex.Message}");
            return null;
        }
    }

    public async Task<List<RoomDto>?> GetRoomsAsync()
    {
        try
        {
            var response = await GetAsync<RoomListResponse>("rooms?limit=100");
            return response?.Data;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting rooms: {ex.Message}");
            return null;
        }
    }

    public async Task<List<BuildingDto>?> GetBuildingsAsync()
    {
        try
        {
            var response = await GetAsync<BuildingListResponse>("buildings?limit=100");
            return response?.Data;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting buildings: {ex.Message}");
            return null;
        }
    }

    // Announcement Management Methods
    public async Task<AnnouncementListResponse?> GetAnnouncementsAsync(
        string? teacherId = null,
        string? sectionId = null,
        string? visibility = null,
        string? type = null,
        bool? includeExpired = null,
        int page = 1,
        int limit = 100)
    {
        try
        {
            var queryParams = new List<string>();
            if (!string.IsNullOrEmpty(teacherId)) queryParams.Add($"teacherId={teacherId}");
            if (!string.IsNullOrEmpty(sectionId)) queryParams.Add($"sectionId={sectionId}");
            if (!string.IsNullOrEmpty(visibility)) queryParams.Add($"visibility={visibility}");
            if (!string.IsNullOrEmpty(type)) queryParams.Add($"type={type}");
            if (includeExpired.HasValue) queryParams.Add($"includeExpired={includeExpired.Value}");
            queryParams.Add($"page={page}");
            queryParams.Add($"limit={limit}");

            var queryString = string.Join("&", queryParams);
            var endpoint = $"announcements{(string.IsNullOrEmpty(queryString) ? "" : $"?{queryString}")}";
            
            return await GetAsync<AnnouncementListResponse>(endpoint);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting announcements: {ex.Message}");
            return null;
        }
    }

    public async Task<AnnouncementDto?> GetAnnouncementByIdAsync(string id)
    {
        try
        {
            return await GetAsync<AnnouncementDto>($"announcements/{id}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting announcement by id: {ex.Message}");
            return null;
        }
    }

    public async Task<AnnouncementDto?> CreateAnnouncementAsync(CreateAnnouncementDto dto)
    {
        try
        {
            return await PostAsync<AnnouncementDto>("announcements", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error creating announcement: {ex.Message}");
            return null;
        }
    }

    public async Task<AnnouncementDto?> UpdateAnnouncementAsync(string id, UpdateAnnouncementDto dto)
    {
        try
        {
            return await PatchAsync<AnnouncementDto>($"announcements/{id}", dto);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error updating announcement: {ex.Message}");
            return null;
        }
    }

    public async Task DeleteAnnouncementAsync(string id)
    {
        try
        {
            await DeleteAsync($"announcements/{id}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting announcement: {ex.Message}");
            throw;
        }
    }

    public async Task<AnnouncementStatsDto?> GetAnnouncementStatsAsync(string teacherId)
    {
        try
        {
            return await GetAsync<AnnouncementStatsDto>($"announcements/stats?teacherId={teacherId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting announcement stats: {ex.Message}");
            return null;
        }
    }

    public async Task<List<SectionDto>?> GetMySectionsAsync()
    {
        try
        {
            return await GetAsync<List<SectionDto>>("sections/my-sections");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting my sections: {ex.Message}");
            return null;
        }
    }
    
    public async Task<DepartmentDto?> GetDepartmentAsync(string departmentId)
    {
        try
        {
            return await GetAsync<DepartmentDto>($"departments/{departmentId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting department: {ex.Message}");
            return null;
        }
    }
    
    public async Task<SubjectDto?> GetSubjectAsync(string subjectId)
    {
        try
        {
            return await GetAsync<SubjectDto>($"subjects/{subjectId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting subject: {ex.Message}");
            return null;
        }
    }
    
    public async Task<SectionDto?> GetSectionAsync(string sectionId)
    {
        try
        {
            return await GetAsync<SectionDto>($"sections/{sectionId}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting section: {ex.Message}");
            return null;
        }
    }

    public async Task<AcademicYearDto?> GetActiveAcademicYearAsync()
    {
        try
        {
            // Get raw response first to see what the API actually returns
            var result = await SendGetReturningStringAsync("academic-years/active", null);
            
            Debug.WriteLine($"[GetActiveAcademicYearAsync] Raw API Response:");
            Debug.WriteLine($"Status Code: {result.StatusCode}");
            Debug.WriteLine($"Response Content: {result.Content}");
            
            if (result.StatusCode < 200 || result.StatusCode >= 300)
            {
                if (result.StatusCode == 404)
                {
                    Debug.WriteLine("No active academic year found (404)");
                    return null;
                }
                await HandleErrorResponseAsync(new HttpResponseMessage((System.Net.HttpStatusCode)result.StatusCode), result.Content);
                return null;
            }
            
            if (string.IsNullOrEmpty(result.Content))
            {
                Debug.WriteLine("Empty response from academic-years/active");
                return null;
            }
            
            var dto = JsonSerializer.Deserialize<AcademicYearDto>(result.Content, _jsonOptions);
            return dto;
        }
        catch (NotFoundException)
        {
            // Handle 404 (no active academic year found) gracefully
            Debug.WriteLine("No active academic year found");
            return null;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting active academic year: {ex.Message}");
            Debug.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<AcademicDashboardOverviewDto?> GetAcademicDashboardOverviewAsync()
    {
        try
        {
            return await GetAsync<AcademicDashboardOverviewDto>("academic-years/dashboard/overview");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting academic dashboard overview: {ex.Message}");
            return null;
        }
    }

    public async Task<StudentDistributionDto?> GetStudentDistributionAsync()
    {
        try
        {
            return await GetAsync<StudentDistributionDto>("desktop-sidebar/student-distribution");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching student distribution: {ex.Message}");
            return null;
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

public class UnreadNotificationCountResponse
{
    [JsonPropertyName("count")] public int Count { get; set; }
}

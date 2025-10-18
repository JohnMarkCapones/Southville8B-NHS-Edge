using System;
using System.Collections.Generic;
using System.IO;
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
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Unexpected error: {ex.Message}");
            throw new ApiException("An unexpected error occurred.", ex);
        }
    }

    private async Task EnsureAuthenticatedAsync()
    {
        var accessToken = await _tokenStorage.GetAccessTokenAsync();
        if (!string.IsNullOrEmpty(accessToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        }
        else
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
        }
    }

    private async Task HandleErrorResponseAsync(HttpResponseMessage response, string content)
    {
        ApiError? apiError = null;

        try
        {
            if (!string.IsNullOrEmpty(content))
            {
                apiError = JsonSerializer.Deserialize<ApiError>(content, _jsonOptions);
            }
        }
        catch
        {
            // If we can't parse the error, we'll use the status code
        }

        var errorMessage = apiError?.Message ?? response.ReasonPhrase ?? "Unknown error occurred";

        switch (response.StatusCode)
        {
            case System.Net.HttpStatusCode.Unauthorized:
                // Clear tokens on 401
                await _tokenStorage.ClearTokensAsync();
                throw new UnauthorizedException("Invalid credentials. Please login again.");
            case System.Net.HttpStatusCode.TooManyRequests:
                throw new TooManyRequestsException("Too many requests. Please wait before trying again.");
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

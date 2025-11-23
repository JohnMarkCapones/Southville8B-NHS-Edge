using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public interface IChatService
{
    Task<ConversationsResponseDto?> GetConversationsAsync(int page = 1, int limit = 20);
    Task<ConversationDto?> CreateDirectConversationAsync(string targetUserId);
    Task<MessageDto?> SendMessageAsync(string conversationId, string content, string? messageType = null);
    Task<MessagesResponseDto?> GetMessagesAsync(string conversationId, int page = 1, int limit = 50);
    Task<bool> MarkAsReadAsync(string conversationId);
    Task<int> GetUnreadCountAsync();
    Task<bool> DeleteConversationAsync(string conversationId);
    void InvalidateCachePrefix(string prefix);
}

public class ChatService : IChatService
{
    private readonly HttpClient _httpClient;
    private readonly ITokenStorageService _tokenStorage;
    private readonly JsonSerializerOptions _jsonOptions;

    // In-flight de-duplication (GET only)
    private readonly ConcurrentDictionary<string, Task<HttpStringResult>> _inFlightGets = new();

    // Simple in-memory cache (GET only)
    private readonly ConcurrentDictionary<string, CacheEntry> _cache = new();

    public ChatService(HttpClient httpClient, ITokenStorageService tokenStorage)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;

        // Configure JSON serialization (camelCase for NestJS backend)
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
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

    private async Task<T?> GetAsync<T>(string endpoint) where T : class
    {
        try
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
                Debug.WriteLine($"[ChatService][Cache] HIT {endpoint}");
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
                Debug.WriteLine($"[ChatService][Cache] 304 for {endpoint} – reusing cached body");
                if (ttl > TimeSpan.Zero)
                {
                    cached.ExpiresAt = DateTime.UtcNow.Add(ttl);
                    _cache[cacheKey] = cached;
                }
                return string.IsNullOrEmpty(cached.RawJson)
                    ? null
                    : JsonSerializer.Deserialize<T>(cached.RawJson, _jsonOptions);
            }

            // Non-success codes - return null
            if (result.StatusCode < 200 || result.StatusCode >= 300)
            {
                Debug.WriteLine($"[ChatService] GET {endpoint} failed: {result.StatusCode} - {result.Content}");
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
                Debug.WriteLine($"[ChatService][Cache] SET {endpoint} ttl={ttl.TotalSeconds}s etag={(result.ETag ?? "-")}");
            }

            if (typeof(T) == typeof(string))
                return result.Content as T;
            if (string.IsNullOrEmpty(result.Content))
                return null;
            return JsonSerializer.Deserialize<T>(result.Content, _jsonOptions);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[ChatService] Error in GET {endpoint}: {ex.Message}");
            return null;
        }
    }

    private async Task<HttpStringResult> SendGetReturningStringAsync(string endpoint, string? priorEtag)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        if (!string.IsNullOrEmpty(priorEtag))
        {
            request.Headers.IfNoneMatch.Clear();
            request.Headers.IfNoneMatch.Add(new EntityTagHeaderValue($"\"{priorEtag}\""));
        }

        Debug.WriteLine($"[ChatService][HTTP] GET {request.RequestUri} (If-None-Match={(priorEtag ?? "-")})");

        using var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        string? etag = response.Headers.ETag?.Tag?.Trim('"');

        Debug.WriteLine($"[ChatService][HTTP] {response.StatusCode} (ETag={(etag ?? "-")})");

        return new HttpStringResult
        {
            StatusCode = (int)response.StatusCode,
            Content = content,
            ETag = etag
        };
    }

    private async Task<T?> PostAsync<T>(string endpoint, object? data = null) where T : class
    {
        try
        {
            await EnsureAuthenticatedAsync();
            
            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
            
            if (data != null)
            {
                var json = JsonSerializer.Serialize(data, _jsonOptions);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            using var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                if (string.IsNullOrEmpty(content))
                    return null;
                return JsonSerializer.Deserialize<T>(content, _jsonOptions);
            }

            System.Diagnostics.Debug.WriteLine($"[ChatService] POST {endpoint} failed: {response.StatusCode} - {content}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ChatService] Error in POST {endpoint}: {ex.Message}");
            return null;
        }
    }

    private async Task<bool> PostAsync(string endpoint, object? data = null)
    {
        try
        {
            await EnsureAuthenticatedAsync();
            
            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
            
            if (data != null)
            {
                var json = JsonSerializer.Serialize(data, _jsonOptions);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            using var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ChatService] Error in POST {endpoint}: {ex.Message}");
            return false;
        }
    }

    private async Task<bool> DeleteAsync(string endpoint)
    {
        try
        {
            await EnsureAuthenticatedAsync();
            
            using var request = new HttpRequestMessage(HttpMethod.Delete, endpoint);
            using var response = await _httpClient.SendAsync(request);
            
            Debug.WriteLine($"[ChatService] DELETE {endpoint} - {response.StatusCode}");
            
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[ChatService] Error in DELETE {endpoint}: {ex.Message}");
            return false;
        }
    }

    public async Task<ConversationsResponseDto?> GetConversationsAsync(int page = 1, int limit = 20)
    {
        var endpoint = $"chat/conversations?page={page}&limit={limit}";
        return await GetAsync<ConversationsResponseDto>(endpoint);
    }

    public async Task<ConversationDto?> CreateDirectConversationAsync(string targetUserId)
    {
        var endpoint = "chat/conversations";
        var request = new CreateConversationRequestDto
        {
            Type = "direct",
            TargetUserId = targetUserId
        };
        var result = await PostAsync<ConversationDto>(endpoint, request);
        
        // Invalidate conversations list cache when a new conversation is created
        if (result != null)
        {
            InvalidateCachePrefix("chat/conversations");
        }
        
        return result;
    }

    public async Task<MessageDto?> SendMessageAsync(string conversationId, string content, string? messageType = null)
    {
        var endpoint = "chat/messages";
        var request = new SendMessageRequestDto
        {
            ConversationId = conversationId,
            Content = content,
            MessageType = messageType ?? "text"
        };
        var result = await PostAsync<MessageDto>(endpoint, request);
        
        // Invalidate cache when a message is sent
        if (result != null)
        {
            // Invalidate conversations list (to update last message info)
            InvalidateCachePrefix("chat/conversations");
            // Invalidate messages for this specific conversation
            InvalidateCachePrefix($"chat/conversations/{conversationId}/messages");
            // Invalidate unread count
            InvalidateCachePrefix("chat/unread-count");
        }
        
        return result;
    }

    public async Task<MessagesResponseDto?> GetMessagesAsync(string conversationId, int page = 1, int limit = 50)
    {
        var endpoint = $"chat/conversations/{conversationId}/messages?page={page}&limit={limit}";
        return await GetAsync<MessagesResponseDto>(endpoint);
    }

    public async Task<bool> MarkAsReadAsync(string conversationId)
    {
        var endpoint = $"chat/conversations/{conversationId}/read";
        var result = await PostAsync(endpoint);
        
        // Invalidate cache when conversation is marked as read
        if (result)
        {
            // Invalidate conversations list (to update unread count)
            InvalidateCachePrefix("chat/conversations");
            // Invalidate unread count
            InvalidateCachePrefix("chat/unread-count");
        }
        
        return result;
    }

    public async Task<int> GetUnreadCountAsync()
    {
        var endpoint = "chat/unread-count";
        var response = await GetAsync<UnreadCountResponseDto>(endpoint);
        return response?.UnreadCount ?? 0;
    }

    public async Task<bool> DeleteConversationAsync(string conversationId)
    {
        var endpoint = $"chat/conversations/{conversationId}";
        var result = await DeleteAsync(endpoint);
        
        // Invalidate cache after successful deletion
        if (result)
        {
            // Invalidate conversations list
            InvalidateCachePrefix("chat/conversations");
            // Invalidate unread count
            InvalidateCachePrefix("chat/unread-count");
        }
        
        return result;
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
                Debug.WriteLine($"[ChatService][Cache] INVALIDATE {key}");
            }
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
        if (key.StartsWith("chat/conversations") && key.Contains("/messages"))
        {
            // Messages for a specific conversation - 1 minute TTL
            return TimeSpan.FromMinutes(1);
        }
        if (key.StartsWith("chat/conversations"))
        {
            // Conversations list - 2 minutes TTL
            return TimeSpan.FromMinutes(2);
        }
        if (key.StartsWith("chat/unread-count"))
        {
            // Unread count - 30 seconds TTL (needs to be fresh)
            return TimeSpan.FromSeconds(30);
        }
        return TimeSpan.Zero;
    }
}


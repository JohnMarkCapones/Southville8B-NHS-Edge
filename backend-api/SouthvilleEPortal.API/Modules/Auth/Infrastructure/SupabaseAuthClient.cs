using System.Net.Http.Json;

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure;

public interface ISupabaseAuthClient
{
    Task<string> PasswordGrantAsync(string email, string password, CancellationToken ct);
}

public class SupabaseAuthClient : ISupabaseAuthClient
{
    private readonly HttpClient _http;
    public SupabaseAuthClient(HttpClient http) => _http = http;

    public async Task<string> PasswordGrantAsync(string email, string password, CancellationToken ct)
    {
        var payload = new { email, password };
        var resp = await _http.PostAsJsonAsync("token?grant_type=password", payload, ct);
        if (!resp.IsSuccessStatusCode)
            throw new InvalidOperationException("Invalid credentials");
        return await resp.Content.ReadAsStringAsync(ct);
    }
}

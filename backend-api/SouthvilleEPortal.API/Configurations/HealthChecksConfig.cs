using Microsoft.Extensions.Diagnostics.HealthChecks;
using HealthChecks.NpgSql; // Added for AddNpgSql extension

namespace SouthvilleEPortal.API.Configurations;

public static class HealthChecksConfig
{
    public static IServiceCollection AddCustomHealthChecks(this IServiceCollection services, string? supabaseDb, string? redisConn)
    {
        var hc = services.AddHealthChecks();
        if (!string.IsNullOrWhiteSpace(supabaseDb))
        {
            hc.AddNpgSql(supabaseDb, name: "supabase-db", timeout: TimeSpan.FromSeconds(5));
        }
        if (!string.IsNullOrWhiteSpace(redisConn))
        {
            // Custom ping using StackExchange.Redis
            hc.AddCheck("redis", () => HealthCheckResult.Healthy(), tags: new []{"cache"}); // placeholder, replace with proper Redis ping implementation
        }
        return services;
    }
}

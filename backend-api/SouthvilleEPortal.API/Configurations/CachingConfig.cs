namespace SouthvilleEPortal.API.Configurations;

public static class CachingConfig
{
    public static IServiceCollection AddRedisCaching(this IServiceCollection services, string? redisConnection)
    {
        if (!string.IsNullOrWhiteSpace(redisConnection))
        {
            // TODO: Register ConnectionMultiplexer (StackExchange.Redis) and IDistributedCache implementation if needed.
        }
        return services;
    }
}

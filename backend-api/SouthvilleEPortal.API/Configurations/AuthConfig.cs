using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace SouthvilleEPortal.API.Configurations;

public static class AuthConfig
{
    public static IServiceCollection AddSupabaseAuthentication(this IServiceCollection services, string jwksUrl, string supabaseUrl)
    {
        // JWKS configuration manager with caching and automatic refresh
        var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
            jwksUrl,
            new JsonWebKeySetRetriever(),
            new HttpDocumentRetriever { RequireHttps = supabaseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) }
        );

        services.AddSingleton<IConfigurationManager<OpenIdConnectConfiguration>>(configurationManager);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = true;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = $"{supabaseUrl.TrimEnd('/')}/auth/v1",
                ValidateAudience = false, // Adjust if you enforce audience
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(2)
            };
            // Retrieve signing keys dynamically via JWKS
            options.ConfigurationManager = configurationManager;
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    // Map custom claims / role extraction if needed
                    // Example: ensure role claim present
                    var claimsPrincipal = context.Principal;
                    // Add any transformation or additional claims mapping here.
                    return Task.CompletedTask;
                },
                OnAuthenticationFailed = context =>
                {
                    context.Response.Headers["X-Auth-Error"] = "Invalid or expired token"; // replaced Add with indexer
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization(options =>
        {
            // Strict role-based policies (Supabase custom JWT claim 'role')
            options.AddPolicy("Admin", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireClaim("role", "admin");
            });
            options.AddPolicy("Teacher", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireClaim("role", "teacher", "admin"); // admin inherits
            });
            options.AddPolicy("Student", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireClaim("role", "student", "admin"); // admin inherits
            });
        });

        return services;
    }
}

// Simplified JWKS retriever; could be replaced by OpenIdConnectConfigurationRetriever if full OIDC metadata is available
public sealed class JsonWebKeySetRetriever : IConfigurationRetriever<OpenIdConnectConfiguration>
{
    public async Task<OpenIdConnectConfiguration> GetConfigurationAsync(string address, IDocumentRetriever retriever, CancellationToken cancel)
    {
        var json = await retriever.GetDocumentAsync(address, cancel);
        var keys = new JsonWebKeySet(json);
        var config = new OpenIdConnectConfiguration();
        foreach (var key in keys.Keys)
        {
            config.SigningKeys.Add(key);
        }
        return config;
    }
}

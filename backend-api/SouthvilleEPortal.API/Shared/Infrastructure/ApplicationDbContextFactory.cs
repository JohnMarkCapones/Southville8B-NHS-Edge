using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SouthvilleEPortal.API.Shared.Infrastructure;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production";

        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .AddUserSecrets<ApplicationDbContextFactory>(optional: true)
            .Build();

        // Preferred: ConnectionStrings:SupabaseDb (matches user-secrets listing) then SUPABASE_DB_CONNECTION env fallback
        var cs = config.GetConnectionString("SupabaseDb")
                 ?? config["SUPABASE_DB_CONNECTION"]
                 ?? config["ConnectionStrings:SupabaseDb"]
                 ?? throw new InvalidOperationException("Missing Supabase connection string for design-time (set ConnectionStrings:SupabaseDb or SUPABASE_DB_CONNECTION)");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(cs, npgsql => npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null));
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}

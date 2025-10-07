using System.Reflection;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using SouthvilleEPortal.API.Middleware;
using SouthvilleEPortal.API.Filters;
using SouthvilleEPortal.API.Modules.Students.Application.Services;
using SouthvilleEPortal.API.Modules.Students.Infrastructure.Repositories;
using SouthvilleEPortal.API.Modules.Students.Infrastructure;
using SouthvilleEPortal.API.Shared.Infrastructure;
using SouthvilleEPortal.API.Shared.Application;
using SouthvilleEPortal.API.Shared.Security;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using SouthvilleEPortal.API.Modules.Auth.Application;
using SouthvilleEPortal.API.Modules.Auth.Infrastructure; // token store
using SouthvilleEPortal.API.Configurations; // for AddCustomHealthChecks
using System.Net.Http; // added
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options; // added for options configuration

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
if (builder.Environment.IsDevelopment()) builder.Configuration.AddUserSecrets<Program>();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.Debug()
    .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Secrets / config (fail-fast)
var connectionString = builder.Configuration.GetConnectionString("SupabaseDb") ?? builder.Configuration["SUPABASE_DB_CONNECTION"];
var supabaseServiceRoleKey = builder.Configuration["Supabase:ServiceRoleKey"] ?? builder.Configuration["SUPABASE_SERVICE_ROLE_KEY"];
var supabaseUrl = builder.Configuration["SUPABASE_URL"];
var supabaseAnonKey = builder.Configuration["Supabase:AnonKey"] ?? builder.Configuration["SUPABASE_ANON_KEY"];
var apiSigningKey = builder.Configuration["API_SIGNING_KEY"];
if (string.IsNullOrWhiteSpace(connectionString)) throw new InvalidOperationException("Missing Supabase DB connection string");
if (string.IsNullOrWhiteSpace(supabaseServiceRoleKey)) throw new InvalidOperationException("Missing Supabase service role key");
if (string.IsNullOrWhiteSpace(supabaseUrl)) throw new InvalidOperationException("Missing SUPABASE_URL");
if (string.IsNullOrWhiteSpace(supabaseAnonKey)) throw new InvalidOperationException("Missing Supabase anon key");

// Enhance connection string with optimized pooling and timeout settings
if (!connectionString.Contains("Timeout=", StringComparison.OrdinalIgnoreCase))
    connectionString += ";Timeout=10";
if (!connectionString.Contains("Maximum Pool Size", StringComparison.OrdinalIgnoreCase))
    connectionString += ";Maximum Pool Size=50";
if (!connectionString.Contains("Keepalive", StringComparison.OrdinalIgnoreCase))
    connectionString += ";Keepalive=30";
if (!connectionString.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
    connectionString += ";SSL Mode=Require;Trust Server Certificate=true";

var supabaseStatus = new SupabaseConnectivityStatus();
builder.Services.AddSingleton(supabaseStatus);

// DbContextPool for better connection pooling and reduced overhead
builder.Services.AddDbContextPool<ApplicationDbContext>((sp, o) =>
{
    o.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null);
        npgsql.CommandTimeout(60);
    });
    if (builder.Environment.IsDevelopment())
    {
        o.EnableSensitiveDataLogging();
        o.EnableDetailedErrors();
    }
});

builder.Services.AddCustomHealthChecks(connectionString, builder.Configuration["REDIS_CONNECTION"]);

builder.Services.AddMemoryCache();

// Rate limiting (global + specific policies)
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    o.AddFixedWindowLimiter("auth-login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    o.AddFixedWindowLimiter("auth-refresh", opt =>
    {
        opt.PermitLimit = 30;
        opt.Window = TimeSpan.FromMinutes(5);
    });
});

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

builder.Services.AddControllers(opts =>
{
    opts.Filters.Add<ValidationFilter>();
    opts.Filters.Add<ExceptionFilter>();
});

// API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
})
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Swagger
builder.Services.AddSwaggerGen(SouthvilleEPortal.API.Configurations.SwaggerConfig.Configure);

// Auth module services
builder.Services.AddSingleton<IJwtKeyRing, FileSystemJwtKeyRing>();
builder.Services.AddScoped<IInternalTokenService, InternalTokenService>();
builder.Services.AddHttpClient<ISupabaseAuthClient, SupabaseAuthClient>(client =>
{
    client.BaseAddress = new Uri(supabaseUrl!.TrimEnd('/') + "/auth/v1/");
    client.DefaultRequestHeaders.Add("apikey", supabaseAnonKey);
});
builder.Services.AddScoped<IRefreshTokenStore, PersistentRefreshTokenStore>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddHostedService<JwtKeyRotationService>();

// JWT auth (RSA key ring) - remove BuildServiceProvider usage (ASP0000) and configure via options/DI
builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer();

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IJwtKeyRing>((opts, keyRing) =>
    {
        opts.RequireHttpsMetadata = true;
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "internal-api",
            ValidateAudience = true,
            ValidAudience = "internal-clients",
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            // Dynamically resolve keys so rotations are picked up without rebuilding service provider
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) => keyRing.GetAllKeys().Cast<SecurityKey>()
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", p => p.RequireAuthenticatedUser().RequireClaim("role", "admin"));
    options.AddPolicy("Teacher", p => p.RequireAuthenticatedUser().RequireClaim("role", "teacher", "admin"));
    options.AddPolicy("Student", p => p.RequireAuthenticatedUser().RequireClaim("role", "student", "admin"));
});

// Students module services
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<RefreshTokenCleanupService>();

// Antiforgery (CSRF) configuration for future cookie use
builder.Services.AddAntiforgery(o =>
{
    o.Cookie.Name = "svep_csrf";
    o.Cookie.HttpOnly = false; // double-submit pattern
    o.HeaderName = "X-CSRF-TOKEN";
});

var app = builder.Build();

var antiforgery = app.Services.GetRequiredService<Microsoft.AspNetCore.Antiforgery.IAntiforgery>();
app.Use(async (ctx, next) =>
{
    if (HttpMethods.IsGet(ctx.Request.Method) && !ctx.Request.Path.StartsWithSegments("/.well-known"))
    {
        var tokens = antiforgery.GetAndStoreTokens(ctx);
        ctx.Response.Headers["X-CSRF-TOKEN"] = tokens.RequestToken!;
    }
    await next();
});

// Connectivity probe function
async Task ProbeSupabaseAsync(IServiceProvider sp, SupabaseConnectivityStatus status, CancellationToken ct)
{
    status.LastCheckedUtc = DateTime.UtcNow;
    status.Errors.Clear();
    using var scope = sp.CreateScope();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        status.PostgresConnected = await db.Database.CanConnectAsync(ct);
        if (!status.PostgresConnected)
            status.Errors.Add("Postgres: CanConnect returned false");
    }
    catch (Exception ex)
    {
        status.PostgresConnected = false;
        status.Errors.Add($"Postgres error: {ex.GetBaseException().Message}");
    }
    try
    {
        var httpFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
        var http = httpFactory.CreateClient();
        http.BaseAddress = new Uri(supabaseUrl!.TrimEnd('/') + "/auth/v1/");
        http.DefaultRequestHeaders.Add("apikey", supabaseAnonKey);
        using var resp = await http.GetAsync("health", ct);
        status.AuthHealthy = resp.IsSuccessStatusCode;
        if (!resp.IsSuccessStatusCode)
            status.Errors.Add($"Auth health status {(int)resp.StatusCode}");
    }
    catch (Exception ex)
    {
        status.AuthHealthy = false;
        status.Errors.Add($"Auth error: {ex.GetBaseException().Message}");
    }
}

await ProbeSupabaseAsync(app.Services, supabaseStatus, CancellationToken.None);

app.UseSerilogRequestLogging();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.MapGet("/", (SupabaseConnectivityStatus status) => Results.Ok(new
{
    message = "SouthvilleEPortal API running",
    supabase = new
    {
        postgres = status.PostgresConnected ? "Connected" : "Unavailable",
        auth = status.AuthHealthy ? "Healthy" : "Unavailable",
        errors = status.Errors,
        checkedUtc = status.LastCheckedUtc
    }
})).RequireRateLimiting("fixed");

app.Run();

public partial class Program { }

public sealed class SupabaseConnectivityStatus
{
    public bool PostgresConnected { get; set; }
    public bool AuthHealthy { get; set; }
    public List<string> Errors { get; } = new();
    public DateTime LastCheckedUtc { get; set; } = DateTime.UtcNow;
}

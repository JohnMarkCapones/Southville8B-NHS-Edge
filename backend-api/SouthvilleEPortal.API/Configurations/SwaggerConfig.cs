using Microsoft.OpenApi.Models;

namespace SouthvilleEPortal.API.Configurations;

public static class SwaggerConfig
{
    public static void Configure(Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions c)
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "SouthvilleEPortal API",
            Version = "v1",
            Description = "Modular Monolith (Students module initial) using Supabase Auth & Postgres."
        });

        // JWT Bearer Scheme (Supabase)
        var securityScheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Description = "Enter Supabase JWT (Bearer <token>)",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        };
        c.AddSecurityDefinition("Bearer", securityScheme);
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            { securityScheme, new List<string>() }
        });
    }
}

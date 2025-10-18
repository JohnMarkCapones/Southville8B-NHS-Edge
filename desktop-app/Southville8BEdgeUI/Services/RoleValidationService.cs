using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace Southville8BEdgeUI.Services;

public interface IRoleValidationService
{
    bool IsRoleAllowed(string role);
    string GetAccessDeniedMessage(string role);
}

public class RoleValidationService : IRoleValidationService
{
    private readonly IConfiguration _configuration;

    public RoleValidationService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool IsRoleAllowed(string role)
    {
        if (string.IsNullOrEmpty(role))
            return false;

        var allowedRoles = _configuration.GetSection("AccessControl:AllowedRoles").Get<string[]>() ?? Array.Empty<string>();
        return allowedRoles.Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase));
    }

    public string GetAccessDeniedMessage(string role)
    {
        var defaultMessage = _configuration["AccessControl:AccessDeniedMessage"] ?? 
                           "This application is restricted to administrators and teachers only.";

        if (string.IsNullOrEmpty(role))
            return defaultMessage;

        var roleLower = role.ToLowerInvariant();
        
        return roleLower switch
        {
            "student" => "Access Denied: This application is for administrators and teachers only. " +
                        "Students should use the web portal to access their account.",
            _ => defaultMessage
        };
    }
}

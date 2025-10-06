using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SouthvilleEPortal.API.Filters;

public class ExceptionFilter : IExceptionFilter
{
    private readonly ILogger<ExceptionFilter> _logger;
    public ExceptionFilter(ILogger<ExceptionFilter> logger) => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "Unhandled exception (filter)");
        context.Result = new ObjectResult(new { error = context.Exception.Message, traceId = context.HttpContext.TraceIdentifier })
        {
            StatusCode = StatusCodes.Status500InternalServerError
        };
    }
}

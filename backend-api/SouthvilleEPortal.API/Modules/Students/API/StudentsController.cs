using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using SouthvilleEPortal.API.Modules.Students.API.DTOs.Requests;
using SouthvilleEPortal.API.Modules.Students.API.DTOs.Responses;
using SouthvilleEPortal.API.Modules.Students.Application.Services;

namespace SouthvilleEPortal.API.Modules.Students.API;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/students")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly StudentService _service;
    public StudentsController(StudentService service) => _service = service;

    [HttpPost]
    [ProducesResponseType(typeof(StudentResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Register([FromBody] RegisterStudentRequest request, CancellationToken ct)
    {
        var id = await _service.RegisterAsync(request.FirstName, request.LastName, request.Email, ct);
        var entity = await _service.GetByIdAsync(id, ct);
        var response = new StudentResponse(entity.Id, entity.Name.FirstName, entity.Name.LastName, entity.Email, entity.CreatedAtUtc, entity.UpdatedAtUtc ?? entity.CreatedAtUtc);
        return CreatedAtAction(nameof(GetById), new { id = response.Id, version = "1" }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<StudentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var all = await _service.GetAllAsync(ct);
        var response = all.Select(s => new StudentResponse(s.Id, s.Name.FirstName, s.Name.LastName, s.Email, s.CreatedAtUtc, s.UpdatedAtUtc ?? s.CreatedAtUtc));
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StudentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        try
        {
            var s = await _service.GetByIdAsync(id, ct);
            return Ok(new StudentResponse(s.Id, s.Name.FirstName, s.Name.LastName, s.Email, s.CreatedAtUtc, s.UpdatedAtUtc ?? s.CreatedAtUtc));
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}

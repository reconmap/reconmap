using System.Text.Json;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Controllers;

[Route("api/projects/{projectId:int}/members")]
[ApiController]
public class ProjectMembersController(AppDbContext dbContext, IConnectionMultiplexer redis) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddProjectMember(uint projectId, [FromBody] JsonElement body)
    {
        if (!body.TryGetProperty("userId", out var value))
            return BadRequest("Missing userId");

        uint userId;

        try
        {
            userId = value.GetUInt32();
        }
        catch
        {
            return BadRequest("Invalid userId");
        }

        var projectMember = new ProjectMember
        {
            ProjectId = projectId,
            UserId = userId
        };
        dbContext.ProjectMembers.Add(projectMember);
        await dbContext.SaveChangesAsync();

        return Accepted();
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectMembers(uint projectId)
    {
        var users = await dbContext.ProjectMembers
            .Where(pu => pu.ProjectId == projectId)
            .Join(
                dbContext.Users,
                pu => pu.UserId,
                u => u.Id,
                (pu, u) => new
                {
                    pu.Id,
                    UserId = u.Id,
                    u.FullName,
                    u.Email,
                    u.Role
                }
            )
            .ToListAsync();
        return Ok(users);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProjectMember(int id)
    {
        var deleted = await dbContext.ProjectMembers
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleted == 0) return NotFound();

        return NoContent();
    }
}

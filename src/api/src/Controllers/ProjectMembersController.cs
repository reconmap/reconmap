using System.Text.Json;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Keycloak;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Controllers;

[Route("api/projects/{projectId:int}/members")]
[ApiController]
public class ProjectMembersController(AppDbContext dbContext, IConnectionMultiplexer redis, IKeycloakUserDirectory directory) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddProjectMember(int projectId, [FromBody] JsonElement body)
    {
        if (!body.TryGetProperty("userId", out var value))
            return BadRequest("Missing userId");

        int userId;

        try
        {
            userId = value.GetInt32();
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
    public async Task<IActionResult> GetProjectMembers(int projectId)
    {
        var members = await dbContext.ProjectMembers
            .Where(pu => pu.ProjectId == projectId)
            .Join(
                dbContext.Users,
                pu => pu.UserId,
                u => u.Id,
                (pu, u) => new
                {
                    pu.Id,
                    UserId = u.Id,
                    u.SubjectId,
                    u.Role
                }
            )
            .ToListAsync();

        var identities = await directory.GetManyAsync(members.Select(m => m.SubjectId));

        return Ok(members.Select(m =>
        {
            identities.TryGetValue(m.SubjectId, out var identity);
            return new
            {
                m.Id,
                m.UserId,
                FullName = identity is null ? string.Empty : $"{identity.FirstName} {identity.LastName}".Trim(),
                Email = identity?.Email,
                m.Role
            };
        }));
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

using api_v2.Domain.Entities;
using api_v2.Infrastructure.Authentication;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_v2.Common.Extensions;
using System.Security.Cryptography;

namespace api_v2.Controllers;

[Route("api/user-api-tokens")]
[ApiController]
public class UserApiTokensController(AppDbContext dbContext) : AppController(dbContext)
{
    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var user = HttpContext.GetCurrentUser()!;
        var tokens = await dbContext.UserApiTokens
            .Where(t => t.UserId == user.Id)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.CreatedAt,
                t.ExpiresAt,
                t.Scope
            })
            .ToListAsync();
        return Ok(tokens);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] UserApiTokenRequest request)
    {
        var user = HttpContext.GetCurrentUser()!;
        var tokenValue = GenerateToken();

        var token = new UserApiToken
        {
            UserId = user.Id,
            Name = request.Name,
            ExpiresAt = DateTime.UtcNow.AddDays(request.ExpirationDays),
            Scope = request.Scope,
            Token = tokenValue
        };

        dbContext.UserApiTokens.Add(token);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            token.Id,
            token.Name,
            token.CreatedAt,
            token.ExpiresAt,
            token.Scope,
            TokenValue = tokenValue // Return only once
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var user = HttpContext.GetCurrentUser()!;
        var deleteCount = await dbContext.UserApiTokens
            .Where(t => t.Id == id && t.UserId == user.Id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        return NoContent();
    }

    private static string GenerateToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
    }
}

public class UserApiTokenRequest
{
    public string Name { get; set; } = null!;
    public int ExpirationDays { get; set; }
    public ApiTokenScope Scope { get; set; }
}

using api_v2.Common.Extensions;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using StackExchange.Redis;

namespace api_v2.Controllers;


[Route("api/[controller]")]
[ApiController]
public class SearchesController(AppDbContext dbContext, IConnectionMultiplexer redis) : ControllerBase
{
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecents([FromQuery] int? limit)
    {
        var setName = $"recent-searches-user${HttpContext.GetCurrentUser()!.Id}";

        var db = redis.GetDatabase();
        // Fetch the top 10 most recent searches (ZREVRANGE 0–9)
        RedisValue[] recentSearches = await db.SortedSetRangeByRankAsync(setName, 0, 9, Order.Descending);
        var searches = recentSearches.Select(x => (string)x).ToList();

        return Ok(searches);
    }
}

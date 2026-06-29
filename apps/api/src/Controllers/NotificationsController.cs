using System.Text.Json;
using api_v2.Domain.AuditActions;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using api_v2.Infrastructure.Sse;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationsController(AppDbContext dbContext, SseConnectionManager sseConnectionManager) : ControllerBase
{
    [HttpGet("stream")]
    public async Task GetStream(CancellationToken cancellationToken)
    {
        Response.ContentType = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";

        var id = sseConnectionManager.AddConnection(Response);

        try
        {
            await Response.WriteAsync("data: {\"type\":\"handshake\"}\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);

            await Task.Delay(Timeout.Infinite, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Client closed connection
        }
        finally
        {
            sseConnectionManager.RemoveConnection(id);
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] string? status)
    {
        var q = dbContext.Notifications.AsNoTracking();
        if (status != null) q = q.Where(n => n.Status == status);
        q = q
            .OrderByDescending(a => a.CreatedAt);

        var notifications = await q.ToListAsync();
        return Ok(notifications);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Notification")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.Notifications
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMany([FromBody] JsonElement body)
    {
        var ids = body.GetProperty("ids")
            .EnumerateArray()
            .Select(e => e.GetUInt32())
            .ToList();

        var deleteCount = await dbContext.Notifications
            .Where(n => ids.Contains(n.Id))
            .ExecuteDeleteAsync();

        return NoContent();
    }



    [HttpPatch("{id:int}")]
    public async Task<IActionResult> PatchOne(uint id, [FromBody] JsonElement body)
    {
        var notification = await dbContext.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        notification.Status = body.GetProperty("status").GetString();
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch]
    public async Task<IActionResult> PatchMany([FromBody] JsonElement body)
    {
        var ids = body.GetProperty("ids")
            .EnumerateArray()
            .Select(e => e.GetUInt32())
            .ToList();

        var status = body.GetProperty("status").GetString();

        await dbContext.Notifications
            .Where(n => ids.Contains(n.Id))
            .ExecuteUpdateAsync(upd => upd
                .SetProperty(n => n.Status, status));

        return NoContent();
    }
}

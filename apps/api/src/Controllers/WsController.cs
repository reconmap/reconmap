using System.Net.WebSockets;
using System.Text;
using api_v2.Infrastructure.Persistence;
using api_v2.Infrastructure.WebSockets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WsController(
    WebSocketConnectionManager manager,
    AppDbContext dbContext,
    ILogger<WsController> logger)
    : ControllerBase
{
    private readonly ILogger _logger = logger;

    [HttpGet]
    [AllowAnonymous]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            var connectionId = manager.AddSocket(webSocket);
            _logger.LogInformation("WebSocket connection accepted: {ConnectionId}", connectionId);
            await ReceiveLoop(connectionId, webSocket); // stays open until closed
        }
        else
        {
            _logger.LogWarning("WebSocket request not accepted");
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    private async Task ReceiveLoop(string connectionId, WebSocket socket)
    {
        var buffer = new byte[4 * 1024];
        _logger.LogInformation("Starting receive loop for {ConnectionId}", connectionId);

        try
        {
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _logger.LogInformation("Client initiated close for {ConnectionId}", connectionId);
                    break;
                }

                if (result.Count == 0 && result.CloseStatus.HasValue)
                {
                    _logger.LogInformation("Socket {ConnectionId} closing with status {Status}",
                        connectionId, result.CloseStatus);
                    break;
                }

                var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                _logger.LogDebug("Received from {ConnectionId}: {Msg}", connectionId, msg);

                // (Optionally echo or handle messages)
            }
        }
        catch (WebSocketException wse)
        {
            _logger.LogWarning(wse, "WebSocket error in ReceiveLoop for {ConnectionId}", connectionId);
        }
        catch (ConnectionAbortedException cae)
        {
            _logger.LogInformation("Connection aborted for {ConnectionId}: {Msg}", connectionId, cae.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in ReceiveLoop for {ConnectionId}", connectionId);
        }
        finally
        {
            await manager.RemoveSocketAsync(connectionId);
            _logger.LogInformation("Receive loop ended for {ConnectionId}", connectionId);
        }
    }
}

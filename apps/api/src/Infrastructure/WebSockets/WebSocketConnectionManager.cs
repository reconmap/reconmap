using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace api_v2.Infrastructure.WebSockets;

public class WebSocketConnectionManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
    public IEnumerable<WebSocket> AllSockets => _sockets.Values;

    public IEnumerable<KeyValuePair<string, WebSocket>> GetAll()
    {
        return _sockets;
    }

    public string AddSocket(WebSocket socket)
    {
        var id = Guid.NewGuid().ToString();
        _sockets.TryAdd(id, socket);
        return id;
    }

    public async Task RemoveSocketAsync(string id)
    {
        if (_sockets.TryRemove(id, out var socket))
            try
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure,
                    "Closed by manager",
                    CancellationToken.None);
            }
            catch
            {
                /* ignore */
            }
    }

    public async Task BroadcastAsync(string message)
    {
        var bytes = Encoding.UTF8.GetBytes(message);
        var toRemove = new List<string>();

        foreach (var pair in _sockets)
        {
            var id = pair.Key;
            var socket = pair.Value;

            if (socket.State != WebSocketState.Open)
            {
                toRemove.Add(id);
                continue;
            }

            try
            {
                await socket.SendAsync(new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
            }
            catch (WebSocketException)
            {
                toRemove.Add(id);
            }
            catch (ObjectDisposedException)
            {
                toRemove.Add(id);
            }
        }

        // Cleanup closed/disposed sockets
        foreach (var id in toRemove) await RemoveSocketAsync(id);
    }
}
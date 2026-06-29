using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace api_v2.Infrastructure.Sse;

public class SseConnectionManager
{
    private readonly ConcurrentDictionary<string, HttpResponse> _connections = new();

    public string AddConnection(HttpResponse response)
    {
        var id = Guid.NewGuid().ToString();
        _connections.TryAdd(id, response);
        return id;
    }

    public void RemoveConnection(string id)
    {
        _connections.TryRemove(id, out _);
    }

    public async Task BroadcastAsync(string message)
    {
        var data = $"data: {message}\n\n";
        var bytes = Encoding.UTF8.GetBytes(data);
        var toRemove = new List<string>();

        foreach (var pair in _connections)
        {
            var id = pair.Key;
            var response = pair.Value;

            try
            {
                await response.Body.WriteAsync(bytes, 0, bytes.Length);
                await response.Body.FlushAsync();
            }
            catch
            {
                toRemove.Add(id);
            }
        }

        foreach (var id in toRemove)
        {
            RemoveConnection(id);
        }
    }
}

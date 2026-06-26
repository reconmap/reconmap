namespace api_v2.Infrastructure.WebSockets;

public static class WebSocketExtensions
{
    public static void UseCustomWebSockets(this IApplicationBuilder app)
    {
        var options = new WebSocketOptions
        {
            KeepAliveInterval = TimeSpan.FromMinutes(2)
        };

        app.UseWebSockets(options);
    }
}
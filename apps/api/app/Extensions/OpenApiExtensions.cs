using Microsoft.OpenApi;

namespace api_v2.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = "Reconmap NextGen API",
                    Version = "v1",
                    Description = "API to interact with all Reconmap services and data."
                };
                return Task.CompletedTask;
            });
        });

        return services;
    }
}
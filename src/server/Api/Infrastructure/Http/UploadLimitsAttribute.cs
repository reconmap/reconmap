using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Reconmap.Api.Common;

namespace Reconmap.Api.Infrastructure.Http;

public enum UploadType
{
    Attachment,
    CommandOutput
}

/// <summary>
/// Applies the configured upload limits to an action before the request body is read, replacing the
/// framework defaults (and any hard-coded limit) so the administrator's configuration is the single source.
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class UploadLimitsAttribute(UploadType type) : Attribute, IFilterFactory
{
    public bool IsReusable => false;

    public IFilterMetadata CreateInstance(IServiceProvider serviceProvider) =>
        new UploadLimitsFilter(serviceProvider.GetRequiredService<IOptions<StorageSettings>>().Value.Uploads, type);

    private sealed class UploadLimitsFilter(UploadSettings settings, UploadType type) : IResourceFilter
    {
        private const long MultipartOverheadBytes = 1024 * 1024;

        public void OnResourceExecuting(ResourceExecutingContext context)
        {
            var maxFileSize = type == UploadType.Attachment
                ? settings.EffectiveMaxFileSizeBytes
                : settings.EffectiveMaxCommandOutputBytes;
            var maxFiles = type == UploadType.Attachment ? settings.EffectiveMaxFilesPerRequest : 1;

            var bodyLimit = context.HttpContext.Features.Get<IHttpMaxRequestBodySizeFeature>();
            if (bodyLimit is { IsReadOnly: false })
                bodyLimit.MaxRequestBodySize = maxFileSize * maxFiles + MultipartOverheadBytes;

            // MultipartBodyLengthLimit applies to each multipart section, i.e. to each file.
            context.HttpContext.Features.Set<IFormFeature>(new FormFeature(context.HttpContext.Request,
                new FormOptions { MultipartBodyLengthLimit = maxFileSize }));
        }

        public void OnResourceExecuted(ResourceExecutedContext context)
        {
        }
    }
}

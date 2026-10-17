using Reconmap.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Reconmap.Api.Controllers;

[ApiController]
[Route("/api/system/integrations")]
public class IntegrationsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMany()
    {
        var result = CommandParserDiscovery.Discover(HttpContext.RequestServices)
            .Select(i => new
            {
                name = i.Name,
                description = i.Description,
                configured = i.IsConfigured,
                externalUrl = i.ExternalUrl
            });

        return Ok(result);
    }
}

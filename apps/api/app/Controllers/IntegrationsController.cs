using api_v2.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace api_v2.Controllers;

[ApiController]
[Route("/api/system/integrations")]
public class IntegrationsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMany()
    {
        var result = ProcessorIntegrationDiscovery.Discover()
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

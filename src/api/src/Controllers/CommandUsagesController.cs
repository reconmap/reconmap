using api_v2.Application.Commands;
using api_v2.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace api_v2.Controllers;

[Route("api/commands/{commandId}/usages")]
[ApiController]
public class CommandUsagesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMany(string commandId)
    {
        var cmdDef = CommandDiscovery.FindById(commandId);
        if (cmdDef == null) return NotFound("Command not found");

        var usages = cmdDef.Usages.Select(u => new CommandUsage
        {
            Id = u.Id,
            CommandId = cmdDef.Id,
            Description = u.Description,
            ExecutablePath = u.ExecutablePath,
            DockerImage = u.DockerImage,
            Arguments = u.Arguments,
            OutputCapturingMode = u.OutputCapturingMode,
            OutputFilename = u.OutputFilename,
            OutputParser = u.OutputParser
        }).ToList();

        return Ok(usages);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetOne(string commandId, string id)
    {
        var usageDef = CommandDiscovery.FindUsageById(id);
        if (usageDef == null) return NotFound("Command usage not found");

        var usage = new CommandUsage
        {
            Id = usageDef.Id,
            CommandId = usageDef.CommandId,
            Description = usageDef.Description,
            ExecutablePath = usageDef.ExecutablePath,
            DockerImage = usageDef.DockerImage,
            Arguments = usageDef.Arguments,
            OutputCapturingMode = usageDef.OutputCapturingMode,
            OutputFilename = usageDef.OutputFilename,
            OutputParser = usageDef.OutputParser
        };

        return Ok(usage);
    }
}

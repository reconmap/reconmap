using System.Reflection;
using System.Text.RegularExpressions;
using Reconmap.Api.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace tests.Controllers;

public partial class RouteConstraintTests
{
    [GeneratedRegex(@"\{\*?(?<name>\w+)(?::(?<constraint>\w+))?[^}]*\}")]
    private static partial Regex RouteParameter();

    [Fact]
    public void Route_constraints_match_the_types_of_the_action_parameters()
    {
        var mismatches = new List<string>();

        var controllers = typeof(ProjectsController).Assembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract);

        foreach (var controller in controllers)
        {
            var classTemplate = controller.GetCustomAttribute<RouteAttribute>()?.Template ?? "";

            foreach (var action in controller.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
            {
                var templates = action.GetCustomAttributes<HttpMethodAttribute>().Select(a => a.Template)
                    .Concat(action.GetCustomAttributes<RouteAttribute>().Select(a => a.Template))
                    .Where(t => t != null)
                    .DefaultIfEmpty("")
                    .ToList();

                foreach (var template in templates)
                foreach (Match match in RouteParameter().Matches($"{classTemplate}/{template}"))
                {
                    var parameter = action.GetParameters().FirstOrDefault(p =>
                        string.Equals(p.Name, match.Groups["name"].Value, StringComparison.OrdinalIgnoreCase));
                    if (parameter == null) continue;

                    var type = Nullable.GetUnderlyingType(parameter.ParameterType) ?? parameter.ParameterType;
                    var constraint = match.Groups["constraint"].Value;
                    var expected = constraint switch { "int" => typeof(int), "guid" => typeof(Guid), _ => null };

                    var wrongConstraint = expected != null && expected != type;
                    var missingGuidConstraint = type == typeof(Guid) && constraint != "guid";
                    if (wrongConstraint || missingGuidConstraint)
                        mismatches.Add($"{controller.Name}.{action.Name}: {{{match.Groups["name"].Value}:{constraint}}} binds to {type.Name}");
                }
            }
        }

        Assert.Empty(mismatches);
    }
}

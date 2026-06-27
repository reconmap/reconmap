using System;
using System.Collections.Generic;
using System.Linq;

namespace api_v2.Application.Commands;

public static class CommandDiscovery
{
    private static readonly Lazy<List<ICommand>> PredefinedCommands = new(() =>
    {
        var commandType = typeof(ICommand);
        var types = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .Where(t => commandType.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

        var list = new List<ICommand>();
        foreach (var type in types)
        {
            try
            {
                if (Activator.CreateInstance(type) is ICommand cmd)
                {
                    foreach (var usage in cmd.Usages)
                    {
                        usage.CommandId = cmd.Id;
                    }
                    list.Add(cmd);
                }
            }
            catch
            {
                // Ignore types that cannot be instantiated
            }
        }
        return list;
    }, true);

    public static IEnumerable<ICommand> GetAll() => PredefinedCommands.Value;

    public static ICommand? FindById(string id)
    {
        return PredefinedCommands.Value.FirstOrDefault(c => c.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    }

    public static CommandUsageDefinition? FindUsageById(string usageId)
    {
        return PredefinedCommands.Value
            .SelectMany(c => c.Usages)
            .FirstOrDefault(u => u.Id.Equals(usageId, StringComparison.OrdinalIgnoreCase));
    }
}

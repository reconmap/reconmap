import { CommandInterface } from "models/Command.js";
import { CommandUsageInterface } from "models/CommandUsage.js";
import { CommandArgumentsMap } from "./commands/arguments.js";

const RmapCommandLineGenerator = {
    generateEntryPoint: (projectId: number, command: CommandInterface, usage: CommandUsageInterface) => {
        const commandParts = ["rmap", "command run"];
        if (projectId !== null) {
            commandParts.push(`-pid ${projectId}`);
        }
        commandParts.push(`-cuid ${usage.id}`);
        const entryPoint = commandParts.join(" ");

        return entryPoint;
    },

    renderArguments: (projectId: number, command: CommandInterface, commandArgs: CommandArgumentsMap) => {
        let commandArgsRendered = "";

        Object.keys(commandArgs).forEach((key) => {
            const containerArg = commandArgs[key];
            commandArgsRendered += ` -var ${containerArg.name}=${containerArg.placeholder}`;
        });

        return commandArgsRendered;
    },
};

const CommandService = {
    generateEntryPoint: (projectId: number, command: CommandInterface, usage: CommandUsageInterface) => {
        return RmapCommandLineGenerator.generateEntryPoint(projectId, command, usage);
    },

    renderArguments: (projectId: number, command: CommandInterface, commandArgs: CommandArgumentsMap) => {
        return RmapCommandLineGenerator.renderArguments(projectId, command, commandArgs);
    },
};

export default CommandService;

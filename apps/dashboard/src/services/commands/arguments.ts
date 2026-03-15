import { CommandUsageInterface } from "models/CommandUsage.js";

const argRegex = /{{{(.+?)}}}/g;

type CommandArgument = {
    name: string;
    placeholder: string;
};

type CommandArgumentsMap = Record<string, CommandArgument>;

export { CommandArgumentsMap };

const parseArguments = (command: CommandUsageInterface): CommandArgumentsMap => {
    const argumentList: CommandArgumentsMap = {};

    if (null === command || null === command.arguments || undefined === command.arguments) {
        return argumentList;
    }

    const commandArgsFound = command.arguments.match(argRegex);
    if (commandArgsFound) {
        const commandArgsParsed = commandArgsFound.reduce((accumulator: CommandArgumentsMap, current: string) => {
            const tokens = current.replaceAll("{{{", "").replaceAll("}}}", "").split("|||");
            accumulator[tokens[0]] = {
                name: tokens[0],
                placeholder: tokens[1],
            };
            return accumulator;
        }, argumentList);
        return commandArgsParsed;
    }

    return argumentList;
};

export default parseArguments;

import { useQuery } from "@tanstack/react-query";
import {
    requestCommands,
    requestSchedules,
    requestCommandUsages,
    requestCommandOutputPost,
} from "./requests/commands.js";

const useCommandsQuery = (params: any) => {
    return useQuery({
        queryKey: ["commands", params],
        queryFn: () => requestCommands(params),
    });
};

const useCommandUsagesQuery = (commandId: number) => {
    return useQuery({
        queryKey: ["commands", commandId, "usages"],
        queryFn: () => requestCommandUsages(commandId).then((res) => res.json()),
        enabled: !!commandId,
    });
};

const useSchedulesQuery = () => {
    return useQuery({
        queryKey: ["commands", "schedules"],
        queryFn: () => requestSchedules().then((res) => res.json()),
    });
};

export {
    useSchedulesQuery,
    useCommandsQuery,
    useCommandUsagesQuery,
    requestCommandOutputPost
};


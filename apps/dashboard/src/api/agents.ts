import { useQuery } from "@tanstack/react-query";
import { requestAgent, requestAgents } from "./requests/agents.js";

const useAgentsQuery = () => {
    return useQuery({
        queryKey: ["agents"],
        queryFn: requestAgents,
    });
};

export const useAgentQuery = (agentId: number) => {
    return useQuery({
        queryKey: ["agents", agentId],
        queryFn: () => requestAgent(agentId),
    });
};

export { useAgentsQuery };

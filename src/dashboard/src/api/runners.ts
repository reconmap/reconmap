import { useQuery } from "@tanstack/react-query";
import { requestRunner, requestRunners } from "./requests/runners.js";

const useRunnersQuery = () => {
    return useQuery({
        queryKey: ["runners"],
        queryFn: requestRunners,
    });
};

export const useRunnerQuery = (runnerId: number) => {
    return useQuery({
        queryKey: ["runners", runnerId],
        queryFn: () => requestRunner(runnerId),
    });
};

export { useRunnersQuery };

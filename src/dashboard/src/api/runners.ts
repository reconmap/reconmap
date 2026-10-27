import { useQuery } from "@tanstack/react-query";
import { requestRunner, requestRunners } from "./requests/runners";

const useRunnersQuery = () => {
    return useQuery({
        queryKey: ["runners"],
        queryFn: ({ signal }) => requestRunners({ signal }),
    });
};

export const useRunnerQuery = (runnerId: number) => {
    return useQuery({
        queryKey: ["runners", runnerId],
        queryFn: ({ signal }) => requestRunner(runnerId, { signal }),
    });
};

export { useRunnersQuery };

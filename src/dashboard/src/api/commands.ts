import { useQuery } from "@tanstack/react-query";
import { requestSchedules, requestCommandOutputPost } from "./requests/commands";

const useSchedulesQuery = () => {
    return useQuery({
        queryKey: ["commands", "schedules"],
        queryFn: ({ signal }) => requestSchedules({ signal }).then((res) => res.json()),
    });
};

export {
    useSchedulesQuery,
    requestCommandOutputPost
};


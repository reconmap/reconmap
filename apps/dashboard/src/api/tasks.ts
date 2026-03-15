import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestTask, requestTaskDelete, requestTasks } from "./requests/tasks.js";

const useTasksQuery = (params: any) => {
    return useQuery({
        queryKey: ["tasks", params],
        queryFn: () => requestTasks(params).then((res) => res.json()),
    });
};

const useTaskQuery = (taskId: number) => {
    return useQuery({
        queryKey: ["tasks", taskId],
        queryFn: () => requestTask(taskId).then((res) => res.json()),
    });
};

const useDeleteTaskMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskId: number) => requestTaskDelete(taskId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};

export { useDeleteTaskMutation, useTaskQuery, useTasksQuery };

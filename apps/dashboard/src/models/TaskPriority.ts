const TaskPriority = {
    Highest: "highest",
    High: "high",
    Medium: "medium",
    Low: "low",
    Lowest: "lowest",
};

export const TaskPriorityList = Object.entries(TaskPriority).map((kv) => ({ name: kv[0], value: kv[1] }));


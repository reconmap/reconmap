import { useTranslation } from "react-i18next";

const priorities: Record<string, { icon: string; label: string }> = {
    highest: { icon: "🔴", label: "Highest" },
    high: { icon: "🟠", label: "High" },
    medium: { icon: "🟡", label: "Medium" },
    low: { icon: "🟢", label: "Low" },
    lowest: { icon: "🔵", label: "Lowest" },
};

const TaskPriorityFormatter = ({ task }: any) => {
    const [t] = useTranslation();
    const priority = priorities[task.priority];

    return (
        <span>
            {priority && <span aria-hidden="true">{priority.icon} </span>}
            {priority ? t(priority.label) : task.priority}
        </span>
    );
};

export default TaskPriorityFormatter;

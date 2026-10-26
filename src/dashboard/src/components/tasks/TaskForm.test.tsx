import { fireEvent, render, screen } from "@testing-library/react";
import TaskForm from "./TaskForm";

vi.mock("api/projects", () => ({
    useProjectsQuery: () => ({
        data: { data: [{ id: 1, name: "Internal pentest", isTemplate: false }] },
        isLoading: false,
    }),
}));

describe("TaskForm", () => {
    it("renders a status dropdown with the task statuses", () => {
        render(
            <TaskForm
                task={{ projectId: 1, summary: "Scan", description: "", priority: "medium", status: "doing" }}
                taskSetter={vi.fn()}
                onFormSubmit={vi.fn()}
            />,
        );

        const status = screen.getByLabelText("Status") as HTMLSelectElement;
        expect(status.value).toBe("doing");
        expect(Array.from(status.options).map((option) => option.value)).toEqual(["todo", "doing", "done"]);
    });

    it("defaults the status dropdown to todo when the task has no status", () => {
        render(
            <TaskForm
                task={{ projectId: 1, summary: "Scan", description: "", priority: "medium", status: undefined }}
                taskSetter={vi.fn()}
                onFormSubmit={vi.fn()}
            />,
        );

        expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toBe("todo");
    });

    it("updates the task status when a new one is selected", () => {
        const taskSetter = vi.fn();
        const task = { projectId: 1, summary: "Scan", description: "", priority: "medium", status: "todo" };

        render(<TaskForm task={task} taskSetter={taskSetter} onFormSubmit={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Status"), { target: { name: "status", value: "done" } });

        expect(taskSetter).toHaveBeenCalledWith({ ...task, status: "done" });
    });
});

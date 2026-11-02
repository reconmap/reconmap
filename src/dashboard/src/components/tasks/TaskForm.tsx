import { useProjectsQuery } from "api/projects";
import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import { useEffect, type ChangeEvent } from "react";
import { TaskPriorityList } from "../../models/TaskPriority";
import TaskStatuses from "../../models/TaskStatuses";
import PrimaryButton from "../ui/buttons/PrimaryButton";

const TaskForm = ({ forTemplate = false, onFormSubmit, task, taskSetter: setTask }: any) => {
    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({ isTemplate: forTemplate });

    const onFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        setTask({ ...task, [name]: value });
    };

    useEffect(() => {
        if (!isLoadingProjects && projects.data.length && task.projectId === "") {
            setTask({ ...task, projectId: projects.data[0].id });
        }
    }, [task, isLoadingProjects, projects, setTask]);

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <FormField
                label="Project"
                htmlFor="projectId"
                control={
                    <NativeSelect
                        id="projectId"
                        name="projectId"
                        onChange={onFormChange}
                        value={task.projectId}
                        required
                    >
                        <optgroup label="Projects">
                            {!isLoadingProjects &&
                                projects.data
                                    .filter((project) => !project.isTemplate)
                                    .map((project, index) => (
                                        <option key={index} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                        </optgroup>
                        <optgroup label="Project templates">
                            {!isLoadingProjects &&
                                projects.data
                                    .filter((project) => project.isTemplate)
                                    .map((project, index) => (
                                        <option key={index} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                        </optgroup>
                    </NativeSelect>
                }
            />

            <FormField
                label="Summary"
                htmlFor="summary"
                control={
                    <NativeInput
                        id="summary"
                        name="summary"
                        type="text"
                        onChange={onFormChange}
                        required
                        autoFocus
                        value={task.summary}
                    />
                }
            />

            <FormField
                label="Description"
                htmlFor="description"
                control={
                    <MarkdownEditor
                        id="description"
                        name="description"
                        onChange={onFormChange}
                        required
                        value={task.description || ""}
                    />
                }
            />

            <FormField
                label="Priority"
                htmlFor="priority"
                control={
                    <NativeSelect
                        id="priority"
                        name="priority"
                        onChange={onFormChange}
                        value={task.priority || "medium"}
                    >
                        {TaskPriorityList.map((priority, index) => (
                            <option key={index} value={priority.value}>
                                {priority.name}
                            </option>
                        ))}
                    </NativeSelect>
                }
            />

            <FormField
                label="Status"
                htmlFor="status"
                control={
                    <NativeSelect id="status" name="status" onChange={onFormChange} value={task.status || "todo"}>
                        {TaskStatuses.map((status, index) => (
                            <option key={index} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </NativeSelect>
                }
            />

            <FormField
                label="Duration estimate"
                htmlFor="durationEstimate"
                control={
                    <NativeInput
                        id="durationEstimate"
                        name="durationEstimate"
                        type="number"
                        step="1"
                        min="0"
                        onChange={onFormChange}
                        value={task.duration_estimate}
                    />
                }
            />

            {!forTemplate && (
                <FormField
                    label="Due date"
                    htmlFor="dueDate"
                    control={
                        <NativeInput
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            onChange={onFormChange}
                            value={task.due_date}
                        />
                    }
                />
            )}

            <FormActions>
                <PrimaryButton type="submit">Save</PrimaryButton>
            </FormActions>
        </Form>
    );
};

export default TaskForm;

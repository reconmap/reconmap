import { useProjectsQuery } from "api/projects.js";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import { useEffect } from "react";
import { TaskPriorityList } from "../../models/TaskPriority.js";
import PrimaryButton from "../ui/buttons/Primary.jsx";

const TaskForm = ({ isEditForm = false, forTemplate = false, onFormSubmit, task, taskSetter: setTask }) => {
    const { data: projects, isLoading: isLoadingProjects } = useProjectsQuery({ isTemplate: forTemplate });

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.value;
        setTask({ ...task, [name]: value });
    };

    useEffect(() => {
        if (!isLoadingProjects && projects.data.length && task.projectId === "") {
            const newProjectId = projects.data[0].id;
            setTask((prevTask) => ({ ...prevTask, projectId: newProjectId }));
        }
    }, [task.projectId, projects, setTask]);

    return (
        <form onSubmit={onFormSubmit}>
            <HorizontalLabelledField
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

            <HorizontalLabelledField
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

            <HorizontalLabelledField
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

            <HorizontalLabelledField
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

            <HorizontalLabelledField
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
                <HorizontalLabelledField
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

            <PrimaryButton type="submit">{isEditForm ? "Save" : "Create"}</PrimaryButton>
        </form>
    );
};

export default TaskForm;

import { useQueryClient } from "@tanstack/react-query";
import { useAttachmentsQuery } from "api/attachments";
import { requestProject } from "api/requests/projects";
import { requestTaskPatch } from "api/requests/tasks";
import { useDeleteTaskMutation, useTaskQuery } from "api/tasks";
import { useUsersQuery } from "api/users";
import AttachmentsTable from "components/attachments/AttachmentsTable";
import AttachmentsDropzone from "components/attachments/Dropzone";
import NativeButton from "components/forms/NativeButton";
import NativeSelect from "components/forms/NativeSelect";
import NativeTabs from "components/forms/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import EmptyField from "components/ui/EmptyField";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import TimestampsSection from "components/ui/TimestampsSection";
import PageTitleHeader from "components/ui/PageTitleHeader";
import LinkButton from "components/ui/buttons/Link";
import { actionCompletedToast } from "components/ui/toast";
import UserLink from "components/users/Link";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate, useParams } from "react-router";
import { requestEntityPost } from "utilities/requests";
import TaskStatuses from "models/TaskStatuses";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import DeleteButton from "components/ui/buttons/Delete";
import TaskPriorityFormatter from "components/tasks/TaskPriorityFormatter";
import TaskStatusFormatter from "components/tasks/TaskStatusFormatter";

const TaskDetailsPage = () => {
    const [t] = useTranslation();
    const { user: loggedInUser } = useAuth() as any;
    const navigate = useNavigate();
    const { taskId } = useParams() as any;
    const { data: task } = useTaskQuery(taskId);
    const { data: users } = useUsersQuery();
    const [project, setProject] = useState<any>(null);
    const queryClient = useQueryClient();

    const [tabIndex, tabIndexSetter] = useState(0);

    const parentType = "task";
    const parentId = taskId;
    const { data: attachments } = useAttachmentsQuery({ parentType, parentId });
    const deleteTaskMutation = useDeleteTaskMutation();

    const onDeleteClick = (_id?: any) => {
        deleteTaskMutation.mutate(task.id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                navigate("/tasks");
                actionCompletedToast("The task has been deleted.");
            }
        });

    };

    const onAssigneeChange = (ev) => {
        const assigneeId = ev.target.value;

        // The API's PUT endpoint replaces the whole task and validates required fields,
        // so send the full task with the new numeric assignee instead of a partial body.
        requestTaskPatch(task.id, {
            ...task,
            assignedToId: "" === assigneeId ? null : Number(assigneeId),
        })
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                actionCompletedToast("The assignee has been updated.");
            })
            .catch((err) => console.error(err));
    };

    const cloneTask = () => {
        requestEntityPost(`/tasks/${task.id}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/tasks/${data.taskId}/edit`);
            });
    };

    const onStatusChange = (ev) => {
        const status = ev.target.value;
        requestTaskPatch(task.id, { status: status })
            .then(() => {
                actionCompletedToast("The status has been transitioned.");
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        if (task) {
            requestProject(task.projectId)
                .then((resp) => resp.json())
                .then((project) => setProject(project))
                .catch((err) => console.error(err));
        }
    }, [task]);

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/tasks">{t("Tasks")}</Link>
                    {project && <Link to={`/projects/${project.id}`}>{project.name}</Link>}
                    {task && <>{task.summary}</>}
                </Breadcrumb>

                {task && users && (
                    <div>
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <LinkButton href={`/tasks/${task.id}/edit`}>Edit</LinkButton>
                            <NativeButton onClick={cloneTask}>Clone and edit</NativeButton>
                            {1 !== task.project_is_template && (
                                <label>
                                    <NativeSelect onChange={onStatusChange} value={task.status}>
                                        {TaskStatuses.map((status, index) => (
                                            <option key={index} value={status.id}>
                                                {t("Status")} &rarr; {status.name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </label>
                            )}
                            <DeleteButton onClick={() => onDeleteClick(task.id)} />
                        </RestrictedComponent>
                    </div>
                )}
            </div>
            {!task ? (
                <Loading />
            ) : (
                <article>
                    <PageTitleHeader title={task.summary} subHeader={t("Task")} />

                    <div>
                        <NativeTabs
                            labels={[t("Details"), t("Attachments")]}
                            tabIndex={tabIndex}
                            tabIndexSetter={tabIndexSetter}
                        />
                        <div>
                            {0 === tabIndex && (
                                <div>
                                    <div className="content grid grid-two">
                                        <div>
                                            <h4>{t("Description")}</h4>
                                            {task.description ? (
                                                <ReactMarkdown>{task.description}</ReactMarkdown>
                                            ) : (
                                                <EmptyField />
                                            )}

                                            <h4>{t("Properties")}</h4>

                                            <dl>
                                                <dt>{t("Priority")}</dt>
                                                <dd><TaskPriorityFormatter task={task} /></dd>

                                                {task.durationEstimate && <>
                                                    <dt>{t("Duration estimate")}</dt>
                                                    <dd>{task.durationEstimate}</dd>
                                                </>}

                                                <dt>{t("Status")}</dt>
                                                <dd>
                                                    <TaskStatusFormatter task={task} />
                                                </dd>
                                            </dl>
                                        </div>

                                        <div>
                                            <h4>People</h4>
                                            <dl>
                                                <dt>{t("Created by")}</dt>
                                                <dd>
                                                    <UserLink userId={task.createdById}>
                                                        {task.createdBy?.fullName}
                                                    </UserLink>
                                                </dd>

                                                {1 !== task.project_is_template && (
                                                    <>
                                                        <dt>Assigned to</dt>
                                                        <dd>
                                                            {users && (
                                                                <NativeSelect
                                                                    onChange={onAssigneeChange}
                                                                    defaultValue={task.assignedToId}
                                                                >
                                                                    <option value="">(nobody)</option>
                                                                    {users.map((user, index) => (
                                                                        <option key={index} value={user.id}>
                                                                            {user.fullName}
                                                                            {user.id === loggedInUser.id
                                                                                ? " (You)"
                                                                                : ""}
                                                                        </option>
                                                                    ))}
                                                                </NativeSelect>
                                                            )}
                                                        </dd>
                                                    </>
                                                )}
                                            </dl>

                                            <TimestampsSection entity={task} />
                                            {task.due_date && (
                                                <dl>
                                                    <dt>Due date</dt>
                                                    <dd>
                                                        <RelativeDateFormatter date={task.due_date} />
                                                    </dd>
                                                </dl>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {1 === tabIndex && (
                                <div>
                                    <AttachmentsDropzone parentType={parentType} parentId={parentId} />

                                    <h4>Attachment list</h4>
                                    <AttachmentsTable attachments={attachments} />
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            )}
        </div>
    );
};

export default TaskDetailsPage;

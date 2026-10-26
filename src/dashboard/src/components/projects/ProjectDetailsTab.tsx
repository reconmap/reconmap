import { useProjectUsersQuery } from "api/projects";
import UserAvatar from "components/badges/UserAvatar";
import ClientLink from "components/clients/ClientLink";
import EmptyField from "components/ui/EmptyField";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import TimestampsSection from "components/ui/TimestampsSection";
import UserLink from "components/users/UserLink";
import VulnerabilitiesByCategoryStatsWidget from "components/dashboard/widgets/VulnerabilitiesByCategoryStatsWidget";
import VulnerabilitiesByRiskStatsWidget from "components/dashboard/widgets/VulnerabilitiesByRiskStatsWidget";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import remarkGfm from "remark-gfm";

const ProjectDetailsTab = ({ project }: any) => {
    const isTemplate = project.isTemplate === true;
    const { data: users } = useProjectUsersQuery(project.id);

    return (
        <section className="columns">
            <div className="column is-three-quarters content">
                <dl>
                    {!isTemplate && (
                        <>
                            <dt>Status</dt>
                            <dd>{project.archived ? "Archived" : "Active"}</dd>
                        </>
                    )}

                    {project.categoryId && (
                        <>
                            <dt>Category</dt>
                            <dd>{project.category?.name}</dd>
                        </>
                    )}



                    <dt>Description</dt>
                    <dd>
                        {project.description ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                        ) : (
                            <EmptyField />
                        )}
                    </dd>

                    {!isTemplate && (
                        <>
                            <dt>External ID</dt>
                            <dd>{project.externalId ?? "(none)"}</dd>
                        </>
                    )}
                </dl>

                {!isTemplate && (
                    <>
                        <h4 style={{ marginTop: 20 }}>Stats</h4>

                        <div>
                            <VulnerabilitiesByRiskStatsWidget projectId={project.id} />
                            <VulnerabilitiesByCategoryStatsWidget projectId={project.id} />
                        </div>
                    </>
                )}
            </div>

            <div className="column content">
                <h4>Relations</h4>
                <dl>
                    {!isTemplate && (
                        <>
                            <dt>Client</dt>
                            <dd>
                                <ClientLink clientId={project.clientId}>{project.client?.name}</ClientLink>
                            </dd>
                        </>
                    )}

                    <dt>Created by</dt>
                    <dd>
                        <UserLink userId={project.createdById}>{project.createdBy?.fullName}</UserLink>
                    </dd>
                </dl>

                <hr />

                <h4>Project members</h4>
                <div>
                    {(users === null || users === undefined || users.length === 0) && (
                        <p>No users assigned to this project.</p>
                    )}
                    {users &&
                        users.map((user) => (
                            <Link to={`/users/${user.id}`} key={user.id} >
                                <UserAvatar /> {user.fullName}<br />
                            </Link>
                        ))}
                </div>
                <hr />

                <TimestampsSection entity={project} />

                {(project.engagementStartDate || project.engagementEndDate) && (
                    <dl>
                        {project.engagementStartDate && (
                            <>
                                <dt>Engagement start date</dt>
                                <dd>
                                    <RelativeDateFormatter date={project.engagementStartDate} />
                                </dd>
                            </>
                        )}

                        {project.engagementEndDate && (
                            <>
                                <dt>Engagement end date</dt>
                                <dd>
                                    <RelativeDateFormatter date={project.engagementEndDate} />
                                </dd>
                            </>
                        )}
                    </dl>
                )}

                {project.archived === 1 && (
                    <dl>
                        <dt>Archived</dt>
                        <dd>
                            <RelativeDateFormatter date={project.archive_ts} />
                        </dd>
                    </dl>
                )}
            </div>
        </section>
    );
};

export default ProjectDetailsTab;

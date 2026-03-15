import { useProjectUsersQuery } from "api/projects.js";
import UserAvatar from "components/badges/UserAvatar.jsx";
import ClientLink from "components/clients/Link";
import VulnerabilitiesByCategoryStatsWidget from "components/layout/dashboard/widgets/VulnerabilitiesByCategoryStatsWidget";
import VulnerabilitiesByRiskStatsWidget from "components/layout/dashboard/widgets/VulnerabilitiesByRiskStatsWidget";
import EmptyField from "components/ui/EmptyField";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import TimestampsSection from "components/ui/TimestampsSection";
import VisibilityLegend from "components/ui/VisibilityLegend";
import UserLink from "components/users/Link";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";

const ProjectDetailsTab = ({ project }) => {
    const isTemplate = project.is_template === 1;
    const { data: users } = useProjectUsersQuery(project.id);

    return (
        <section className="columns">
            <div className="column is-three-quarters content">
                <h4>Project details</h4>
                <dl>
                    {!isTemplate && (
                        <>
                            <dt>Visibility</dt>
                            <dd>
                                <VisibilityLegend visibility={project.visibility} />
                            </dd>

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

                    {project.vulnerabilityMetrics && (
                        <>
                            <dt>Vulnerability metrics</dt>
                            <dd>{project.vulnerabilityMetrics}</dd>
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
                        <UserLink userId={project.createdByUid}>{project.createdBy?.fullName}</UserLink>
                    </dd>
                </dl>

                <hr />

                <h4>Project members</h4>
                <div>
                    {(users === null || users === undefined || users.length === 0) && (
                        <p>No users assigned to this project.</p>
                    )}
                    {users &&
                        users.map((user, index) => (
                            <Link to={`/users/${user.id}`} key={user.id} >
                                <UserAvatar email={user.email} /> {user.fullName}<br />
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

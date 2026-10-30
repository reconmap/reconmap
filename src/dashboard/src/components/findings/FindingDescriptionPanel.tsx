import { useSystemCustomFieldsQuery } from "api/system";
import CvssScore from "components/badges/CvssScore";
import RiskBadge from "components/badges/RiskBadge";
import ProjectBadge from "components/projects/ProjectBadge";
import AssetBadge from "components/asset/AssetBadge";
import EmptyField from "components/ui/EmptyField";
import ExternalLink from "components/ui/ExternalLink";
import TimestampsSection from "components/ui/TimestampsSection";
import UserLink from "components/users/UserLink";
import { Fragment } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import FindingCategorySpan from "./categories/FindingCategorySpan";
import CvssAbbr from "./CvssAbbr";
import FindingStatusBadge from "./FindingStatusBadge";

const FindingDescriptionPanel = ({ finding }: any) => {
    const { data: customFieldDefinitions } = useSystemCustomFieldsQuery();
    const customFields = JSON.parse(finding.customFields);

    const names = customFieldDefinitions && Object.fromEntries(customFieldDefinitions.map(({ name, label }) => [name, label]));

    return (
        <div className="grid grid-two">
            <div className="content">
                {finding.description ? (
                    <ReactMarkdown>{finding.description}</ReactMarkdown>
                ) : (
                    <EmptyField />
                )}

                <h4>Proof of concept</h4>
                {finding.proofOfConcept ? (
                    <ReactMarkdown>{finding.proofOfConcept}</ReactMarkdown>
                ) : (
                    <EmptyField />
                )}

                <h4>Impact</h4>
                {finding.impact ? <ReactMarkdown>{finding.impact}</ReactMarkdown> : <EmptyField />}

                <h4>Category</h4>
                <p>
                    <FindingCategorySpan
                        name={finding.category?.name}
                        parentName={finding.parent_category_name}
                    />
                </p>

                <h4>Properties</h4>
                <dl>
                    <dt>Status</dt>
                    <dd>
                        <FindingStatusBadge finding={finding} />
                    </dd>

                    <dt>Risk</dt>
                    <dd>
                        <RiskBadge risk={finding.risk} />
                    </dd>

                    {finding.cvssScore && (
                        <>
                            <dt>
                                <CvssAbbr /> score
                            </dt>
                            <dd>
                                <CvssScore score={finding.cvssScore} />
                            </dd>
                        </>
                    )}

                    {finding.cvssVector && (
                        <>
                            <dt>CVSS vector</dt>
                            <dd>
                                <ExternalLink
                                    href={`https://www.first.org/cvss/calculator/4.0#${finding.cvssVector}`}
                                >
                                    {finding.cvssVector}
                                </ExternalLink>
                            </dd>
                        </>
                    )}
                </dl>

                {customFields && names && (
                    <>
                        <h4>Custom fields</h4>

                        <dl>
                            {Object.entries(customFields).map(([k, v]) => (
                                <Fragment key={k}>
                                    <dt>{names[k]}</dt>
                                    <dd>{v as any}</dd>
                                </Fragment>
                            ))}
                        </dl>
                    </>
                )}
            </div>

            <div className="content">
                <h4>Relations</h4>
                <dl>
                    {!finding.isTemplate && (
                        <>
                            <dt>Project</dt>
                            <dd>
                                {finding.projectId ? (
                                    <ProjectBadge
                                        project={{ id: finding.projectId, name: finding.project?.name }}
                                    />
                                ) : (
                                    "-"
                                )}
                            </dd>
                        </>
                    )}

                    {finding.assetId && (
                        <>
                            <dt>Affected asset</dt>
                            <dd>
                                <Link to={`/assets/${finding.assetId}`}>
                                    <AssetBadge name={finding.asset?.name}>
                                        {finding.assetId
                                            ? `${finding.asset?.name} (${finding.asset?.type})`
                                            : "-"}
                                    </AssetBadge>
                                </Link>
                            </dd>
                        </>
                    )}

                    <dt>Created by</dt>
                    <dd>
                        <UserLink userId={finding.createdById}>{finding.createdBy?.fullName}</UserLink>
                    </dd>
                </dl>

                <TimestampsSection entity={finding} />
            </div>
        </div>
    );
};

export default FindingDescriptionPanel;

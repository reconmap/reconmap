import { useAttachmentsQuery } from "api/attachments";
import { requestVulnerabilityPatch } from "api/requests/vulnerabilities";
import { useDeleteVulnerabilityMutation, useVulnerabilityQuery } from "api/vulnerabilities";
import AttachmentsTable from "components/attachments/AttachmentsTable";
import AttachmentsDropzone from "components/attachments/Dropzone";
import NativeSelect from "components/forms/NativeSelect";
import NativeTabs from "components/forms/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Tag from "components/ui/Tag";
import Tags from "components/ui/Tags";
import LinkButton from "components/ui/buttons/Link";
import { t } from "i18next";
import VulnerabilityStatuses from "models/VulnerabilityStatuses";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import DeleteButton from "components/ui/buttons/Delete";
import { actionCompletedToast } from "components/ui/toast";
import CommentsPanel from "components/comments/CommentsPanel";
import VulnerabilityDescriptionPanel from "components/vulnerabilities/VulnerabilityDescriptionPanel";
import VulnerabilityRemediationPanel from "components/vulnerabilities/VulnerabilityRemediationPanel";
import VulnerabilityTriagePanel from "components/vulnerabilities/VulnerabilityTriagePanel";
import { requestEntityPost } from "utilities/requests";

const VulnerabilityDetails = () => {
    const navigate = useNavigate();
    const { vulnerabilityId } = useParams() as any;
    const { data: vulnerability, isLoading } = useVulnerabilityQuery(vulnerabilityId);
    const deleteVulnerabilityMutation = useDeleteVulnerabilityMutation();

    const parentType = "vulnerability";
    const parentId = vulnerabilityId;
    const { data: attachments } = useAttachmentsQuery({ parentType, parentId });

    const [tabIndex, tabIndexSetter] = useState(0);

    const cloneVulnerability = async (templateId) => {
        requestEntityPost(`/vulnerabilities/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/vulnerabilities/${data.vulnerabilityId}/edit`);
            });
    };

    const onDeleteClick = async () => {
        deleteVulnerabilityMutation.mutate(vulnerabilityId, {
            onSuccess: () => {
                actionCompletedToast("The vulnerability has been deleted.");
                navigate("/vulnerabilities");
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    const onStatusChange = (ev) => {
        const [status, substatus] = ev.target.value.split("-");

        requestVulnerabilityPatch(vulnerability.id, { status, substatus })
            .then(() => {
                actionCompletedToast("The status has been transitioned.");
            })
            .catch((err) => console.error(err));
    };

    if (isLoading) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/vulnerabilities">Vulnerabilities</Link>
                    <Link to="#">{vulnerability.summary}</Link>
                </Breadcrumb>
                <div>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/vulnerabilities/${vulnerability.id}/edit`}>Edit</LinkButton>

                        {vulnerability.isTemplate ? (
                            <LinkButton onClick={() => cloneVulnerability(vulnerability.id)}>
                                New from template
                            </LinkButton>
                        ) : null}

                        <label>
                            <NativeSelect
                                onChange={onStatusChange}
                                value={vulnerability.status + "-" + vulnerability.substatus}
                            >
                                {VulnerabilityStatuses.map((status) => (
                                    <option key={`vulnstatus_${status.id}`} value={status.id}>
                                        {t("Status")} &rarr; {status.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </label>

                        <DeleteButton onClick={onDeleteClick} />
                    </RestrictedComponent>
                </div>
            </div>
            <article>
                <PageTitleHeader
                    title={vulnerability.externalId ? `${vulnerability.externalId.toUpperCase()} ${vulnerability.summary}` : vulnerability.summary}
                    header={
                        vulnerability.externalId ? (
                            <>
                                <strong>{vulnerability.externalId.toUpperCase()}</strong>
                                &nbsp;{vulnerability.summary}
                            </>
                        ) : (
                            vulnerability.summary
                        )
                    }
                    subHeader={t("Vulnerability")}
                />
                <Tag>{vulnerability.visibility}</Tag> <Tags values={vulnerability.tags} />
                <div>
                    <NativeTabs
                        labels={[t("Description"), t("Triage"), t("Remediation"), t("Comments"), t("Attachments")]}
                        tabIndex={tabIndex}
                        tabIndexSetter={tabIndexSetter}
                    />
                    <div>
                        {0 === tabIndex && (
                            <div>
                                <VulnerabilityDescriptionPanel vulnerability={vulnerability} />
                            </div>
                        )}
                        {1 === tabIndex && (
                            <div>
                                <VulnerabilityTriagePanel vulnerability={vulnerability} />
                            </div>
                        )}
                        {2 === tabIndex && (
                            <div>
                                <VulnerabilityRemediationPanel vulnerability={vulnerability} />
                            </div>
                        )}
                        {3 === tabIndex && (
                            <div>
                                <CommentsPanel parentType="vulnerability" parentId={vulnerability.id} />
                            </div>
                        )}
                        {4 === tabIndex && (
                            <div>
                                <AttachmentsDropzone parentType={parentType} parentId={parentId} />

                                <h4>Attachment list</h4>
                                <AttachmentsTable attachments={attachments} />
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default VulnerabilityDetails;

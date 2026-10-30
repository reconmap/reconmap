import { useConfirm } from "components/ui/useConfirm";
import { useAttachmentsQuery } from "api/attachments";
import { requestFindingPatch } from "api/requests/findings";
import { useDeleteFindingMutation, useFindingQuery } from "api/findings";
import AttachmentsTable from "components/attachments/AttachmentsTable";
import AttachmentsDropzone from "components/attachments/AttachmentsDropzone";
import NativeSelect from "components/forms/NativeSelect";
import NativeTabs from "components/forms/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Tag from "components/ui/Tag";
import Tags from "components/ui/Tags";
import LinkButton from "components/ui/buttons/LinkButton";
import { t } from "i18next";
import FindingStatuses from "models/FindingStatuses";
import { useState, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import DeleteButton from "components/ui/buttons/DeleteButton";
import { toast } from "components/ui/toast";
import CommentsPanel from "components/comments/CommentsPanel";
import FindingDescriptionPanel from "components/findings/FindingDescriptionPanel";
import FindingRemediationPanel from "components/findings/FindingRemediationPanel";
import FindingTriagePanel from "components/findings/FindingTriagePanel";
import { requestEntityPost } from "utilities/requests";

const FindingDetailsPage = () => {
    const navigate = useNavigate();
    const { confirm, confirmDialog } = useConfirm();
    const { findingId } = useParams() as any;
    const { data: finding, isLoading } = useFindingQuery(findingId);
    const deleteFindingMutation = useDeleteFindingMutation();

    const parentType = "finding";
    const parentId = findingId;
    const { data: attachments } = useAttachmentsQuery({ parentType, parentId });

    const [tabIndex, tabIndexSetter] = useState(0);

    const cloneFinding = async (templateId) => {
        requestEntityPost(`/findings/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/findings/${data.findingId}/edit`);
            });
    };

    const onDeleteClick = async () => {
        if (!(await confirm("Are you sure you want to delete this finding?"))) return;
        deleteFindingMutation.mutate(findingId, {
            onSuccess: () => {
                toast.success("The finding has been deleted.");
                navigate("/findings");
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    const onStatusChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const [status, substatus] = event.target.value.split("-");

        requestFindingPatch(finding.id, { status, substatus })
            .then(() => {
                toast.success("The status has been transitioned.");
            })
            .catch((err) => console.error(err));
    };

    if (isLoading) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/findings">Findings</Link>
                    <Link to="#">{finding.summary}</Link>
                </Breadcrumb>
                <div>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/findings/${finding.id}/edit`}>Edit</LinkButton>

                        {finding.isTemplate ? (
                            <LinkButton onClick={() => cloneFinding(finding.id)}>
                                New from template
                            </LinkButton>
                        ) : null}

                        <label>
                            <NativeSelect
                                onChange={onStatusChange}
                                value={finding.status + "-" + finding.substatus}
                            >
                                {FindingStatuses.map((status) => (
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
                    title={finding.externalId ? `${finding.externalId.toUpperCase()} ${finding.summary}` : finding.summary}
                    header={
                        finding.externalId ? (
                            <>
                                <strong>{finding.externalId.toUpperCase()}</strong>
                                &nbsp;{finding.summary}
                            </>
                        ) : (
                            finding.summary
                        )
                    }
                    subHeader={t("Finding")}
                />
                <Tag>{finding.visibility}</Tag> <Tags values={finding.tags} />
                <div>
                    <NativeTabs
                        labels={[t("Description"), t("Triage"), t("Remediation"), t("Comments"), t("Attachments")]}
                        tabIndex={tabIndex}
                        tabIndexSetter={tabIndexSetter}
                    />
                    <div>
                        {0 === tabIndex && (
                            <div>
                                <FindingDescriptionPanel finding={finding} />
                            </div>
                        )}
                        {1 === tabIndex && (
                            <div>
                                <FindingTriagePanel finding={finding} />
                            </div>
                        )}
                        {2 === tabIndex && (
                            <div>
                                <FindingRemediationPanel finding={finding} />
                            </div>
                        )}
                        {3 === tabIndex && (
                            <div>
                                <CommentsPanel parentType="finding" parentId={finding.id} />
                            </div>
                        )}
                        {4 === tabIndex && (
                            <div>
                                <AttachmentsDropzone parentType={parentType} parentId={parentId} />

                                <AttachmentsTable attachments={attachments} />
                            </div>
                        )}
                    </div>
                </div>
            </article>
            {confirmDialog}
        </div>
    );
};

export default FindingDetailsPage;

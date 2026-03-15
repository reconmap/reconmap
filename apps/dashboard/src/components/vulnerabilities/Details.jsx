import { useAttachmentsQuery } from "api/attachments.js";
import { requestVulnerabilityPatch } from "api/requests/vulnerabilities.js";
import { useDeleteVulnerabilityMutation, useVulnerabilityQuery } from "api/vulnerabilities.js";
import AttachmentsTable from "components/attachments/AttachmentsTable";
import AttachmentsDropzone from "components/attachments/Dropzone";
import NativeSelect from "components/form/NativeSelect";
import NativeTabs from "components/form/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Tag from "components/ui/Tag";
import Tags from "components/ui/Tags";
import LinkButton from "components/ui/buttons/Link";
import { t } from "i18next";
import VulnerabilityStatuses from "models/VulnerabilityStatuses";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import DeleteButton from "../ui/buttons/Delete";
import { actionCompletedToast } from "../ui/toast";
import VulnerabilitiesNotesTab from "./NotesTab";
import VulnerabilityDescriptionPanel from "./VulnerabilityDescriptionPanel";
import VulnerabilityRemediationPanel from "./VulnerabilityRemediationPanel";

const VulnerabilityDetails = () => {
    const navigate = useNavigate();
    const { vulnerabilityId } = useParams();
    const { data: vulnerability, isLoading } = useVulnerabilityQuery(vulnerabilityId);
    const deleteVulnerabilityMutation = useDeleteVulnerabilityMutation();

    const parentType = "vulnerability";
    const parentId = vulnerabilityId;
    const { data: attachments } = useAttachmentsQuery({ parentType, parentId });

    const [tabIndex, tabIndexSetter] = useState(0);

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

    if (isLoading) return <Loading />;

    if (vulnerability && vulnerability.is_template) {
        return <Navigate to={`/vulnerabilities/templates/${vulnerability.id}`} />;
    }

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/vulnerabilities">Vulnerabilities</Link>
                    <Link>{vulnerability.summary}</Link>
                </Breadcrumb>
                <div>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/vulnerabilities/${vulnerability.id}/edit`}>Edit</LinkButton>

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
                <Title
                    type="Vulnerability"
                    title={
                        vulnerability.externalId ? (
                            <>
                                <strong>{vulnerability.externalId.toUpperCase()}</strong>
                                &nbsp;{vulnerability.summary}
                            </>
                        ) : (
                            vulnerability.summary
                        )
                    }
                />
                <Tag>{vulnerability.visibility}</Tag> <Tags values={vulnerability.tags} />
                <div>
                    <NativeTabs
                        labels={["Description", "Remediation", "Comments", "Attachments"]}
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
                                <VulnerabilityRemediationPanel vulnerability={vulnerability} />
                            </div>
                        )}
                        {2 === tabIndex && (
                            <div>
                                <VulnerabilitiesNotesTab vulnerability={vulnerability} />
                            </div>
                        )}
                        {3 === tabIndex && (
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

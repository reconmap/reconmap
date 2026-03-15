import { useDeleteVulnerabilityMutation, useVulnerabilityQuery } from "api/vulnerabilities.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import NativeTabs from "components/form/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/Delete";
import LinkButton from "components/ui/buttons/Link";
import PrimaryButton from "components/ui/buttons/Primary";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { requestEntityPost } from "utilities/requests.js";
import VulnerabilityDescriptionPanel from "../VulnerabilityDescriptionPanel";
import VulnerabilityRemediationPanel from "../VulnerabilityRemediationPanel";

const VulnerabilityTemplateDetails = () => {
    const navigate = useNavigate();
    const { templateId } = useParams();
    const { data: vulnerability, isLoading } = useVulnerabilityQuery(templateId);
    const deleteVulnerabilityMutation = useDeleteVulnerabilityMutation();
    const [tabIndex, tabIndexSetter] = useState(0);

    const cloneProject = async (templateId) => {
        requestEntityPost(`/vulnerabilities/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/vulnerabilities/${data.vulnerabilityId}/edit`);
            });
    };

    const onDelete = () => {
        deleteVulnerabilityMutation.mutate(templateId, {
            onSuccess: () => {
                navigate("/vulnerabilities/templates");
            },
        });
    };

    if (isLoading) return <Loading />;

    if (vulnerability && !vulnerability.is_template) {
        return <Navigate to={`/vulnerabilities/${vulnerability.id}`} />;
    }

    return (
        <>
            <div>
                <div className="heading">
                    <Breadcrumb>
                        <Link to="/vulnerabilities">Vulnerabilities</Link>
                        <Link to="/vulnerabilities/templates">Templates</Link>
                    </Breadcrumb>
                    <NativeButtonGroup>
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <LinkButton href={`/vulnerabilities/${vulnerability.id}/edit`}>Edit</LinkButton>
                        </RestrictedComponent>
                        <PrimaryButton onClick={() => cloneProject(vulnerability.id)}>Clone and edit</PrimaryButton>
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <DeleteButton onClick={onDelete} />
                        </RestrictedComponent>
                    </NativeButtonGroup>
                </div>
                <article>
                    <Title type="Vulnerability template" title={vulnerability.summary} />

                    <div>
                        <NativeTabs
                            labels={["Description", "Remediation"]}
                            tabIndex={tabIndex}
                            tabIndexSetter={tabIndexSetter}
                        />
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
                    </div>
                </article>
            </div>
        </>
    );
};

export default VulnerabilityTemplateDetails;

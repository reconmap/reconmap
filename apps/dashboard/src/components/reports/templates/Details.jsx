import { useDeleteVulnerabilityMutation, useVulnerabilityQuery } from "api/vulnerabilities.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Breadcrumb from "components/ui/Breadcrumb";
import DeleteButton from "components/ui/buttons/Delete";
import LinkButton from "components/ui/buttons/Link";
import PrimaryButton from "components/ui/buttons/Primary";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { requestEntityPost } from "utilities/requests.js";

const ReportTemplateDetails = () => {
    const navigate = useNavigate();
    const { templateId } = useParams();
    const { data: vulnerability, isLoading } = useVulnerabilityQuery(templateId);
    const deleteVulnerabilityMutation = useDeleteVulnerabilityMutation();

    const cloneProject = async (templateId) => {
        requestEntityPost(`/vulnerabilities/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/vulnerabilities/${data.vulnerabilityId}/edit`);
            });
    };

    const onDelete = () => {
        deleteVulnerabilityMutation.mutate(vulnerability.id).then(() => {
            navigate("/vulnerabilities/templates");
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
                        <PrimaryButton onClick={() => cloneProject(vulnerability.id)}>Clone and edit</PrimaryButton>

                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <LinkButton href={`/vulnerabilities/${vulnerability.id}/edit`}>Edit</LinkButton>
                            <DeleteButton onClick={onDelete} />
                        </RestrictedComponent>
                    </NativeButtonGroup>
                </div>
                <article>
                    <Title type="Vulnerability template" title={vulnerability.summary} />

                    <Tabs>
                        <TabList>
                            <Tab>Description</Tab>
                            <Tab>Remediation</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel></TabPanel>
                            <TabPanel></TabPanel>
                        </TabPanels>
                    </Tabs>
                </article>
            </div>
        </>
    );
};

export default ReportTemplateDetails;

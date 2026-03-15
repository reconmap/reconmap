import { useProjectQuery } from "api/projects.js";
import NativeTabs from "components/form/NativeTabs";
import ReportRevisions from "components/reports/Revisions";
import Configuration from "Configuration";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import KeyCloakService from "services/keycloak.js";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import Breadcrumb from "./../ui/Breadcrumb";
import "./Report.css";

const ProjectReport = () => {
    const { projectId } = useParams();
    const { data: project, isLoading } = useProjectQuery(projectId);

    const [tabIndex, tabIndexSetter] = useState(0);

    if (isLoading) return <Loading />;

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                </Breadcrumb>
            </div>
            <Title type="Report" title={project.name} />

            <NativeTabs labels={["Preview", "Revisions"]} tabIndex={tabIndex} tabIndexSetter={tabIndexSetter} />

            {0 === tabIndex && <ReportPreview projectId={projectId} />}
            {1 === tabIndex && <ReportRevisions projectId={projectId} />}
        </>
    );
};

export default ProjectReport;

const ReportPreview = ({ projectId }) => {
    const user = KeyCloakService.getUserInfo();
    let apiUrl = Configuration.getDefaultApiUrl()
    return (
        <iframe
            title="Report preview"
            style={{ width: "50%", margin: "20px auto" }}
            id="report"
            src={apiUrl + `/reports/${projectId}/preview?accessToken=${user.access_token}`}
        ></iframe>
    );
};

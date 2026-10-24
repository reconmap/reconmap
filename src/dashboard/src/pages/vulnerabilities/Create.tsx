import { requestVulnerabilityPost } from "api/requests/vulnerabilities";
import { actionCompletedToast } from "components/ui/toast";
import defaultVulnerability from "models/Vulnerability";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import VulnerabilityForm from "components/vulnerabilities/Form";
import { useTranslation } from "react-i18next";

const VulnerabilityCreate = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    const urlProjectId = query.get("projectId") || 0;
    const isTemplate = "true" === query.get("isTemplate");

    const [vulnerability, setVulnerability] = useState({
        ...defaultVulnerability,
        isTemplate: isTemplate,
        projectId: urlProjectId,
    });

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        var formData = new FormData(document.getElementById("vulnerabilityCreateForm") as HTMLFormElement);
        var fields: any = Object.fromEntries(formData);
        fields.tags = JSON.stringify(fields.tags.split(","));
        fields.assetId = null;
        fields.categoryId = null;
        if (!fields.hasOwnProperty("isTemplate")) {
            fields.isTemplate = false;
        }

        requestVulnerabilityPost(fields).then(() => {
            if (vulnerability.isTemplate) {
                navigate("/vulnerabilities/templates");
            } else {
                navigate(`/vulnerabilities`);
            }

            actionCompletedToast(`The vulnerability "${vulnerability.summary}" has been added.`);
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/vulnerabilities">Vulnerabilities</Link>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("New vulnerability")} />

            <VulnerabilityForm
                vulnerability={vulnerability}
                vulnerabilitySetter={setVulnerability}
                onFormSubmit={onFormSubmit}
            />
        </div>
    );
};

export default VulnerabilityCreate;

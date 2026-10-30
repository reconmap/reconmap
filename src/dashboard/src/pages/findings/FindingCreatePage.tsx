import { requestFindingPost } from "api/requests/findings";
import { toast } from "components/ui/toast";
import defaultFinding from "models/Finding";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import FindingForm from "components/findings/FindingForm";
import { useTranslation } from "react-i18next";

const FindingCreatePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    const urlProjectId = query.get("projectId") || 0;
    const isTemplate = "true" === query.get("isTemplate");

    const [finding, setFinding] = useState({
        ...defaultFinding,
        isTemplate: isTemplate,
        projectId: urlProjectId,
    });

    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        var formData = new FormData(document.getElementById("findingCreateForm") as HTMLFormElement);
        var fields: any = Object.fromEntries(formData);
        fields.tags = JSON.stringify(fields.tags.split(","));
        fields.assetId = null;
        fields.categoryId = null;
        if (!fields.hasOwnProperty("isTemplate")) {
            fields.isTemplate = false;
        }

        requestFindingPost(fields).then(() => {
            if (finding.isTemplate) {
                navigate("/findings/templates");
            } else {
                navigate(`/findings`);
            }

            toast.success(`The finding "${finding.summary}" has been added.`);
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/findings">Findings</Link>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("New finding")} />

            <FindingForm
                finding={finding}
                findingSetter={setFinding}
                onFormSubmit={onFormSubmit}
            />
        </div>
    );
};

export default FindingCreatePage;

import { useQueryClient } from "@tanstack/react-query";
import { useFindingQuery } from "api/findings";
import { normalizeFindingForSave } from "api/requests/findings";
import { Link, useNavigate, useParams } from "react-router";
import { requestEntityPut } from "utilities/requests";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import FindingForm from "components/findings/FindingForm";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

const FindingEditPage = () => {
    const [t] = useTranslation();
    const { findingId } = useParams() as any;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: serverFinding } = useFindingQuery(findingId);
    const [findingEdits, setClientFinding] = useState<any>(null);
    const clientFinding = findingEdits ?? serverFinding;

    const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await requestEntityPut(`/findings/${findingId}`, normalizeFindingForSave(clientFinding))
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["findings"] });
                toast.success(`The finding "${clientFinding.summary}" has been updated.`);

                if (clientFinding.is_template) {
                    navigate(`/findings/templates/${findingId}`);
                } else {
                    navigate(`/findings/${findingId}`);
                }
            })
            .catch((err) => {
                toast.error(err.message);
            });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/findings">Findings</Link>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("Edit finding")} />
            {!clientFinding ? (
                <Loading />
            ) : (
                <FindingForm
                    finding={clientFinding}
                    findingSetter={setClientFinding}
                    onFormSubmit={onFormSubmit}
                />
            )}
        </div>
    );
};

export default FindingEditPage;

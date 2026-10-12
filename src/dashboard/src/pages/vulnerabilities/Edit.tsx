import { useQueryClient } from "@tanstack/react-query";
import { useVulnerabilityQuery } from "api/vulnerabilities";
import { normalizeVulnerabilityForSave } from "api/requests/vulnerabilities";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { requestEntityPut } from "utilities/requests";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import VulnerabilityForm from "components/vulnerabilities/Form";

const VulnerabilityEdit = () => {
    const { vulnerabilityId } = useParams() as any;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: serverVulnerability } = useVulnerabilityQuery(vulnerabilityId);
    const [clientVulnerability, setClientVulnerability] = useState<any>(null);

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        await requestEntityPut(`/vulnerabilities/${vulnerabilityId}`, normalizeVulnerabilityForSave(clientVulnerability))
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["vulnerabilities"] });
                actionCompletedToast(`The vulnerability "${clientVulnerability.summary}" has been updated.`);

                if (clientVulnerability.is_template) {
                    navigate(`/vulnerabilities/templates/${vulnerabilityId}`);
                } else {
                    navigate(`/vulnerabilities/${vulnerabilityId}`);
                }
            })
            .catch((err) => {
                errorToast(err.message);
            });
    };

    useEffect(() => {
        if (serverVulnerability) setClientVulnerability(serverVulnerability);
    }, [serverVulnerability]);

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/vulnerabilities">Vulnerabilities</Link>
                </Breadcrumb>
            </div>
            <Title title="Vulnerability details" />
            {!clientVulnerability ? (
                <Loading />
            ) : (
                <VulnerabilityForm
                    isEditForm={true}
                    vulnerability={clientVulnerability}
                    vulnerabilitySetter={setClientVulnerability}
                    onFormSubmit={onFormSubmit}
                />
            )}
        </div>
    );
};

export default VulnerabilityEdit;

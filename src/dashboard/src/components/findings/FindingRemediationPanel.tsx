import PrimaryButton from "components/ui/buttons/PrimaryButton";
import CssIcon from "components/ui/CssIcon";
import EmptyField from "components/ui/EmptyField";
import TabToolbar from "components/ui/TabToolbar";
import { toast } from "components/ui/toast";
import ReactMarkdown from "react-markdown";
import { requestEntityPut } from "utilities/requests";

const FindingRemediationPanel = ({ finding }: any) => {
    const generateRemediation = () => {
        requestEntityPut(`/findings/${finding.id}/remediation`, {});
        toast.success("AI job queued. Please come back here later");
    };

    return (
        <>
            {!finding.isTemplate && !finding.remediation && (
                <TabToolbar
                    start={
                        <PrimaryButton onClick={generateRemediation}>
                            <CssIcon name="brain" />
                            &nbsp; Generate remediation instructions with AI
                        </PrimaryButton>
                    }
                />
            )}
            <div className="grid grid-two">
                <div className="content">
                    {finding.remediation ? (
                        <ReactMarkdown>{finding.remediation}</ReactMarkdown>
                    ) : (
                        <EmptyField />
                    )}
                </div>

                <div className="content">
                    <h4>Properties</h4>
                    <dl>
                        <dt>Priority</dt>
                        <dd>{finding.remediation_priority ?? <EmptyField />}</dd>

                        <dt>Complexity</dt>
                        <dd>{finding.remediation_complexity ?? <EmptyField />}</dd>
                    </dl>
                </div>
            </div>
        </>
    );
};

export default FindingRemediationPanel;

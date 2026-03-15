import { useProjectQuery } from "api/projects.js";
import { useReportsQuery } from "api/reports.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import NativeTextArea from "components/form/NativeTextArea";
import Loading from "components/ui/Loading";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { requestEntityPost } from "utilities/requests.js";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";
import PrimaryButton from "../ui/buttons/Primary";

const SendReport = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { data: project, isLoading: isProjectLoading } = useProjectQuery(projectId);
    const { data: revisions } = useReportsQuery({ projectId });
    const [recipientsGroup, setRecipientsGroup] = useState("all_contacts");

    const deliverySettings = {
        report_id: null,
        recipients: null,
        subject: "[CONFIDENTIAL] Security report attached",
        body: "Please review attachment containing a security report.",
    };

    const handleSend = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        if (ev.target.checkValidity() === false) {
            return;
        }

        const formData = new FormData(ev.target);
        const formObject = Object.fromEntries(formData.entries());

        requestEntityPost(`/reports/${formObject.report_id}/send`, formObject)
            .then(() => {
                navigate(`/projects/${project.id}/report`);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const updateRecipientsGroup = (ev) => {
        setRecipientsGroup(ev.target.value);
    };

    if (isProjectLoading) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    {project && <Link to={`/projects/${project.id}`}>{project.name}</Link>}
                    {project && <Link to={`/projects/${project.id}/report`}>Report</Link>}
                </Breadcrumb>
            </div>
            <form onSubmit={handleSend}>
                <Title title="Send report" />
                <HorizontalLabelledField
                    label="Revision"
                    htmlFor="reportId"
                    control={
                        <NativeSelect id="reportId" name="report_id">
                            {revisions &&
                                revisions.map((revision) => (
                                    <option value={revision.id}>{revision.versionName}</option>
                                ))}
                        </NativeSelect>
                    }
                />
                <HorizontalLabelledField
                    label="Recipients group"
                    htmlFor="recipientsGroup"
                    control={
                        <NativeSelect id="recipientsGroup" name="recipientsGroup" onChange={updateRecipientsGroup}>
                            <option value="all_contacts">All contacts</option>
                            <option value="all_general_contacts">All general contacts</option>
                            <option value="all_technical_contacts">All technical contacts</option>
                            <option value="all_billing_contacts">All billing contacts</option>
                            <option value="specific_emails">Specific email addresses</option>
                        </NativeSelect>
                    }
                />
                {recipientsGroup === "specific_emails" && (
                    <>
                        <HorizontalLabelledField
                            label={
                                <>
                                    Recipients
                                    <div style={{ fontSize: "x-small", color: "gray" }}>
                                        Comma separated list of email addresses.
                                    </div>
                                </>
                            }
                            htmlFor="recipients"
                            control={
                                <NativeInput
                                    type="text"
                                    id="recipients"
                                    name="recipients"
                                    autoFocus
                                    required
                                    placeholder="foo@bar.sec"
                                />
                            }
                        />
                    </>
                )}

                <HorizontalLabelledField
                    label="Email subject"
                    htmlFor="emailSubject"
                    control={
                        <NativeInput
                            type="text"
                            id="emailSubject"
                            name="subject"
                            defaultValue={deliverySettings.subject}
                            required
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Email body"
                    htmlFor="emailBody"
                    control={<NativeTextArea id="emailBody" name="body" defaultValue={deliverySettings.body} />}
                />

                <PrimaryButton type="submit">Send</PrimaryButton>
            </form>
        </div>
    );
};

export default SendReport;

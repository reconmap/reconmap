import { useProjectQuery } from "api/projects";
import { useReportsQuery } from "api/reports";
import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import NativeTextArea from "components/forms/NativeTextArea";
import { toast } from "components/ui/toast";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { requestEntityPost } from "utilities/requests";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import { useTranslation } from "react-i18next";

const ReportSendPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams() as any;
    const { data: project, isLoading: isProjectLoading } = useProjectQuery(projectId);
    const { data: revisions } = useReportsQuery({ projectId });
    const [recipientsGroup, setRecipientsGroup] = useState("all_contacts");

    const deliverySettings = {
        report_id: null,
        recipients: null,
        subject: "[CONFIDENTIAL] Security report attached",
        body: "Please review attachment containing a security report.",
    };

    const handleSend = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.checkValidity() === false) {
            return;
        }

        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());

        requestEntityPost(`/reports/${formObject.report_id}/send`, formObject as any)
            .then(async (response) => {
                if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    throw new Error(payload?.message ?? "Unable to queue the report email.");
                }

                toast.success("Report email queued for background delivery");
                navigate(`/projects/${project.id}/report`);
            })
            .catch((err) => {
                toast.error(err.message ?? "Unable to queue the report email.");
            });
    };

    const updateRecipientsGroup = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setRecipientsGroup(event.target.value);
    };

    if (isProjectLoading) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    {project && <Link to={`/projects/${project.id}`}>{project.name}</Link>}
                    {project && <Link to={`/projects/${project.id}/report`}>Report</Link>}
                </Breadcrumb>
            </div>
            <Form layout="horizontal" onSubmit={handleSend}>
                <PageTitleHeader title={t("Send report")} />
                <FormField
                    label="Revision"
                    htmlFor="reportId"
                    control={
                        <NativeSelect id="reportId" name="report_id">
                            {revisions &&
                                revisions.map((revision) => (
                                    <option key={revision.id} value={revision.id}>{revision.versionName}</option>
                                ))}
                        </NativeSelect>
                    }
                />
                <FormField
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
                        <FormField
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

                <FormField
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

                <FormField
                    label="Email body"
                    htmlFor="emailBody"
                    control={<NativeTextArea id="emailBody" name="body" defaultValue={deliverySettings.body} />}
                />

                <FormActions>
                    <PrimaryButton type="submit">Send</PrimaryButton>
                </FormActions>
            </Form>
        </div>
    );
};

export default ReportSendPage;

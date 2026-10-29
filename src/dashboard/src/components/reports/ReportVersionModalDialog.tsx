import { type FormEvent, type SyntheticEvent } from "react";
import { useReportsTemplatesQuery } from "api/reports";
import { requestReportPost } from "api/requests/reports";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";
import TargetIcon from "components/ui/TargetIcon";
import { toast } from "components/ui/toast";

const ReportVersionModalDialog = ({ projectId, isOpen, onSubmit, onCancel }: any) => {
    const defaultFormValues = {
        reportTemplateId: "",
        versionName: "",
        versionDescription: "",
    };
    const { data: templates } = useReportsTemplatesQuery({});

    const beforeCancelCallback = (event: SyntheticEvent<HTMLDialogElement>) => {
        event.currentTarget.closest("dialog")?.querySelector("form")?.reset();
        onCancel(event);
    };

    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const reportForm = event.currentTarget;
        const formData = new FormData(reportForm);
        const data = Object.fromEntries(formData.entries());

        requestReportPost(data)
            .then((resp) => {
                if (resp.ok) {
                    onSubmit();
                    reportForm.reset();
                    toast.success(`The report version "${data.versionName}" has been added.`);
                } else {
                    throw new Error(resp.statusText);
                }
            })
            .catch((err) => {
                toast.error(err.message);
                console.error(err);
            })
            .finally(() => {

            });
    };

    return (
        <ModalDialog
            title={
                <>
                    <TargetIcon /> New report version
                </>
            }
            visible={isOpen}
            onModalClose={beforeCancelCallback}
            footer={
                <>
                    <NativeButton onClick={beforeCancelCallback}>Cancel</NativeButton>
                    <PrimaryButton form="reportVersionReportForm" type="submit">
                        Save
                    </PrimaryButton>
                </>
            }
        >
            <div>
                <div>
                    <div></div>
                </div>
                <Form layout="vertical" id="reportVersionReportForm" onSubmit={onFormSubmit}>
                    <div>
                        <input type="hidden" name="projectId" value={projectId} />
                        {templates && (
                            <FormField
                                label="Template"
                                control={
                                    <NativeSelect
                                        name="reportTemplateId"
                                        defaultValue={defaultFormValues.reportTemplateId}
                                    >
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.versionName}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                }
                            />
                        )}

                        <FormField
                            label="Name"
                            control={
                                <NativeInput
                                    type="text"
                                    name="versionName"
                                    defaultValue={defaultFormValues.versionName}
                                    placeholder="eg 1.0, 202103"
                                    autoFocus
                                    required
                                />
                            }
                        />

                        <FormField
                            label="Description"
                            control={
                                <NativeInput
                                    type="text"
                                    name="versionDescription"
                                    defaultValue={defaultFormValues.versionDescription}
                                    placeholder="eg Initial version, Draft"
                                    required
                                />
                            }
                        />
                    </div>
                </Form>
            </div>
        </ModalDialog>
    );
};

export default ReportVersionModalDialog;

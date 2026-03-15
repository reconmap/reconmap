import { useReportsTemplatesQuery } from "api/reports.js";
import { requestReportPost } from "api/requests/reports.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField";
import NativeButton from "components/form/NativeButton";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import ModalDialog from "components/ui/ModalDIalog";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import TargetIcon from "images/icons/target.svg?react";

const ReportVersionModalDialog = ({ projectId, isOpen, onSubmit, onCancel }) => {
    const defaultFormValues = {
        reportTemplateId: 0,
        versionName: "",
        versionDescription: "",
    };
    const { data: templates } = useReportsTemplatesQuery();

    const beforeCancelCallback = (ev) => {
        ev.target.closest("form").reset();
        onCancel(ev);
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        const reportForm = ev.target;
        const formData = new FormData(reportForm);
        const data = Object.fromEntries(formData.entries());

        requestReportPost(data)
            .then((resp) => {
                if (resp.ok) {
                    onSubmit();
                    reportForm.reset();
                    actionCompletedToast(`The report version "${data.versionName}" has been added.`);
                } else {
                    throw new Error(resp.statusText);
                }
            })
            .catch((err) => {
                errorToast(err.message);
                console.error(err);
            })
            .finally(() => {

            });
    };

    return (
        <ModalDialog
            title={
                <>
                    <TargetIcon style={{ width: "24px" }} /> New report version details
                </>
            }
            visible={isOpen}
            onClose={beforeCancelCallback}
        >
            <div>
                <div>
                    <div></div>
                </div>
                <form id="reportVersionReportForm" onSubmit={onFormSubmit}>
                    <div>
                        <input type="hidden" name="projectId" value={projectId} />
                        {templates && (
                            <HorizontalLabelledField
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

                        <HorizontalLabelledField
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

                        <HorizontalLabelledField
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

                    <div>
                        <NativeButton onClick={beforeCancelCallback}>Cancel</NativeButton>
                        <PrimaryButton form="reportVersionReportForm" type="submit">
                            Save
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </ModalDialog>
    );
};

export default ReportVersionModalDialog;

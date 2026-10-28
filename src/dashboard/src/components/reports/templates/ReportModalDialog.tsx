import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";
import { toast } from "components/ui/toast";
import { useRef, useState } from "react";
import { requestEntityPost } from "utilities/requests";

const ReportModalDialog = ({ isOpen, onSubmit, onCancel }: any) => {
    const fileRef = useRef<any>(null);

    const emptyReportTemplate = {
        versionName: "",
        versionDescription: null,
        resultFile: null,
    };
    const [reportTemplate, setReportTemplate] = useState(emptyReportTemplate);

    const onCreateReportFormSubmit = (ev) => {
        ev.preventDefault();

        const formData = new FormData();
        formData.append("versionName", reportTemplate.versionName);
        formData.append("versionDescription", reportTemplate.versionDescription as any);
        formData.append("resultFile", fileRef.current.files[0]);

        requestEntityPost(`/reports/templates`, formData)
            .then(() => {
                onSubmit();
                toast.success(`The report template "${reportTemplate.versionName}" has been added.`);
            })
            .catch((err) => {
                toast.error(err);
            })
            .finally(() => {
                setReportTemplate(emptyReportTemplate);
            });
    };

    const onFormChange = (ev) => {
        setReportTemplate({ ...reportTemplate, [ev.target.name]: ev.target.value });
    };

    return (
        <ModalDialog visible={isOpen} onClose={onCancel} title="New report template details">
            <div>
                <div>
                    <Form layout="vertical" id="reportTemplateForm" onSubmit={onCreateReportFormSubmit}>
                        <div>
                            <FormField
                                label="Version name"
                                control={
                                    <NativeInput
                                        type="text"
                                        name="versionName"
                                        onChange={onFormChange}
                                        autoFocus
                                        required
                                    />
                                }
                            />
                        </div>
                        <div>
                            <FormField
                                label="Version description"
                                control={<NativeInput type="text" name="versionDescription" onChange={onFormChange} />}
                            />
                        </div>
                        <div>
                            <FormField
                                label="File"
                                control={
                                    <NativeInput
                                        type="file"
                                        ref={fileRef}
                                        name="resultFile"
                                        onChange={onFormChange}
                                        required
                                    />
                                }
                            />
                        </div>
                    </Form>
                </div>

                <div>
                    <NativeButton onClick={onCancel}>Cancel</NativeButton>
                    <PrimaryButton form="reportTemplateForm" type="submit">
                        Save
                    </PrimaryButton>
                </div>
            </div>
        </ModalDialog>
    );
};

export default ReportModalDialog;

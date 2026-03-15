import LabelledField from "components/form/LabelledField";
import NativeButton from "components/form/NativeButton";
import NativeInput from "components/form/NativeInput";
import PrimaryButton from "components/ui/buttons/Primary";
import ModalDialog from "components/ui/ModalDIalog";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import { useRef, useState } from "react";
import { requestEntityPost } from "utilities/requests.js";

const ReportModalDialog = ({ isOpen, onSubmit, onCancel }) => {
    const fileRef = useRef();

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
        formData.append("versionDescription", reportTemplate.versionDescription);
        formData.append("resultFile", fileRef.current.files[0]);

        requestEntityPost(`/reports/templates`, formData)
            .then(() => {
                onSubmit();
                actionCompletedToast(`The report template "${reportTemplate.versionName}" has been added.`);
            })
            .catch((err) => {
                errorToast(err);
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
                    <form id="reportTemplateForm" onSubmit={onCreateReportFormSubmit}>
                        <div>
                            <LabelledField
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
                            <LabelledField
                                label="Version description"
                                control={<NativeInput type="text" name="versionDescription" onChange={onFormChange} />}
                            />
                        </div>
                        <div>
                            <LabelledField
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
                    </form>
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

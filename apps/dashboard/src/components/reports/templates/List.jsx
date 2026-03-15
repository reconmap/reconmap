import { UserManualUrl } from "ServerUrls";
import { useDeleteReportMutation, useReportsTemplatesQuery } from "api/reports.js";
import { requestAttachment } from "api/requests/attachments.js";
import Breadcrumb from "components/ui/Breadcrumb";
import EmptyField from "components/ui/EmptyField";
import ExternalLink from "components/ui/ExternalLink";
import Loading from "components/ui/Loading";
import NoResults from "components/ui/NoResults";
import Title from "components/ui/Title";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import SecondaryButton from "components/ui/buttons/Secondary";
import { resolveMime } from "friendly-mimes";
import useBoolean from "hooks/useBoolean";
import { Link } from "react-router-dom";
import ReportModalDialog from "./ModalDialog";

const ReportTemplatesList = () => {
    const { data: templates, isLoading } = useReportsTemplatesQuery();
    const deleteReportMutation = useDeleteReportMutation();

    const deleteTemplate = (ev, templateId) => {
        ev.stopPropagation();

        deleteReportMutation.mutate(templateId);
    };

    const {
        value: isAddReportTemplateDialogOpen,
        setTrue: openAddReportTemplateDialog,
        setFalse: closeAddReportTemplateDialog,
    } = useBoolean();

    const onReportTemplateFormSaved = () => {
        refetchTemplates();
        closeAddReportTemplateDialog();
    };

    const handleDownload = (reportId) => {
        requestAttachment(reportId).then(({ blob, filename }) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
        });
    };

    const safeResolveMime = (mimeType) => {
        try {
            return resolveMime(mimeType)["name"];
        } catch (err) {
            console.error(err);
            return mimeType;
        }
    };
    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/reports">Reports</Link>
                </Breadcrumb>

                <ReportModalDialog
                    isOpen={isAddReportTemplateDialogOpen}
                    onSubmit={onReportTemplateFormSaved}
                    onCancel={closeAddReportTemplateDialog}
                />
                <CreateButton onClick={openAddReportTemplateDialog}>Add report template&hellip;</CreateButton>
            </div>
            <Title title="Report templates" />

            <div status="info">
                Needing some inspiration? Have a look at hundred of penetration test reports available at&nbsp;
                <ExternalLink href="https://pentestreports.com/">https://pentestreports.com/</ExternalLink>
            </div>

            <div status="info">
                Visit this{" "}
                <ExternalLink href={UserManualUrl + "reports/report-template-variables.html"}>
                    user manual's page
                </ExternalLink>{" "}
                if you want to find out which variables are available to your report templates.
            </div>

            {isLoading ? (
                <Loading />
            ) : (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th style={{ width: "190px" }}>Name</th>
                            <th>Description</th>
                            <th style={{ width: "190px" }}>File name</th>
                            <th>Mime type</th>
                            <th>Downloads</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.length === 0 ? (
                            <tr>
                                <td colSpan={3}>
                                    <NoResults />
                                </td>
                            </tr>
                        ) : (
                            templates.map((template) => (
                                <tr key={template.id}>
                                    <td>{template.versionName}</td>
                                    <td>
                                        <EmptyField value={template.versionDescription} />
                                    </td>
                                    <td>{template.clientFileName}</td>
                                    <td>
                                        <span title={safeResolveMime(template.fileMimeType)}>
                                            {template.fileMimeType}
                                        </span>
                                    </td>
                                    <td>
                                        <SecondaryButton onClick={() => handleDownload(template.attachmentId)}>
                                            {template.clientFileName?.split(".").pop().toUpperCase()}
                                        </SecondaryButton>
                                    </td>
                                    <td>
                                        <DeleteIconButton
                                            disabled={template.createdByUid === 0}
                                            title={
                                                template.createdByUid === 0 ? "System templates cannot be deleted" : ""
                                            }
                                            onClick={(ev) => deleteTemplate(ev, template.id)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default ReportTemplatesList;

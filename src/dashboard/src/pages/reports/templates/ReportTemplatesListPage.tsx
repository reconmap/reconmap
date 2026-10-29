import { type MouseEvent } from "react";
import { useConfirm } from "components/ui/useConfirm";
import { UserManualUrl } from "ServerUrls";
import { useDeleteReportMutation, useReportsTemplatesQuery } from "api/reports";
import { requestAttachment } from "api/requests/attachments";
import ReportModalDialog from "components/reports/templates/ReportModalDialog";
import Breadcrumb from "components/ui/Breadcrumb";
import EmptyField from "components/ui/EmptyField";
import ExternalLink from "components/ui/ExternalLink";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResults from "components/ui/NoResults";
import PageTitleHeader from "components/ui/PageTitleHeader";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import { mimeTypeName } from "utilities/mimeTypes";
import useBoolean from "hooks/useBoolean";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

const ReportTemplatesListPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const { data: templates, isLoading, refetch: refetchTemplates } = useReportsTemplatesQuery(undefined as any);
    const deleteReportMutation = useDeleteReportMutation();

    const deleteTemplate = async (event: MouseEvent<HTMLElement>, templateId) => {
        event.stopPropagation();

        if (!(await confirm(t("Are you sure you want to delete this report template?")))) return;

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
            a.download = filename!;
            a.click();
        });
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
                <CreateButton onClick={openAddReportTemplateDialog}>New report template&hellip;</CreateButton>
            </div>
            <PageTitleHeader title={t("Report templates")} />

            <div {...({ status: "info" } as any)}>
                Needing some inspiration? Have a look at hundred of penetration test reports available at&nbsp;
                <ExternalLink href="https://pentestreports.com/">https://pentestreports.com/</ExternalLink>
            </div>

            <div {...({ status: "info" } as any)}>
                Visit this{" "}
                <ExternalLink href={UserManualUrl + "reports/report-template-variables.html"}>
                    user manual's page
                </ExternalLink>{" "}
                if you want to find out which variables are available to your report templates.
            </div>

            {(
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
                        {isLoading ? (
                            <LoadingTableRow numColumns={6} />
                        ) : templates.length === 0 ? (
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
                                        <EmptyField {...({ value: template.versionDescription } as any)} />
                                    </td>
                                    <td>{template.clientFileName}</td>
                                    <td>
                                        <span title={mimeTypeName(template.fileMimeType)}>
                                            {template.fileMimeType}
                                        </span>
                                    </td>
                                    <td>
                                        <SecondaryButton onClick={() => handleDownload(template.attachmentId)}>
                                            {template.clientFileName?.split(".").pop().toUpperCase()}
                                        </SecondaryButton>
                                    </td>
                                    <td>
                                        <DeleteButton display="icon"
                                            disabled={template.createdById === 0}
                                            title={
                                                template.createdById === 0 ? "System templates cannot be deleted" : ""
                                            }
                                            onClick={(event) => deleteTemplate(event, template.id)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
            {confirmDialog}
        </>
    );
};

export default ReportTemplatesListPage;

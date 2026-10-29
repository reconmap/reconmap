import { useConfirm } from "components/ui/useConfirm";
import { requestVulnerabilities } from "api/requests/vulnerabilities";
import { ignoreAbortError } from "utilities/abort";
import { useDeleteVulnerabilityMutation } from "api/vulnerabilities";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import DeleteButton from "components/ui/buttons/DeleteButton";
import { toast } from "components/ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import CreateButton from "components/ui/buttons/CreateButton";
import VulnerabilityFilters from "components/vulnerabilities/VulnerabilityFilters";
import VulnerabilitiesTable from "components/vulnerabilities/VulnerabilitiesTable";
import VulnerabilityTableModel from "components/vulnerabilities/VulnerabilityTableModel";
import { useTranslation } from "react-i18next";

const VulnerabilitiesListPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    let pageNumber: any = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const vulnerabilitiesDeleteMutation = useDeleteVulnerabilityMutation();

    const [tableModel, setTableModel] = useState(new VulnerabilityTableModel());

    const [totalCount, setTotalCount] = useState("?");
    const [numberPages, setNumberPages] = useState(1);

    const onPageChange = (pageNumber) => {
        const queryParams = new URLSearchParams();
        queryParams.set("isTemplate", "false");
        queryParams.set("page", pageNumber + 1);
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );
        const url = `/vulnerabilities?${queryParams.toString()}`;
        navigate(url);
    };

    const fetchVulnerabilities = useCallback((signal?: AbortSignal) => {
        const queryParams = new URLSearchParams();
        queryParams.set("isTemplate", "false");
        queryParams.set("page", String(pageNumber));
        queryParams.set("orderColumn", tableModel.sortBy.column);
        queryParams.set("orderDirection", tableModel.sortBy.order);
        Object.keys(tableModel.filters).forEach(
            (key) =>
                tableModel.filters[key] !== null &&
                tableModel.filters[key].length !== 0 &&
                queryParams.append(key, tableModel.filters[key]),
        );

        requestVulnerabilities(queryParams, { signal })
            .then((data) => {
                setNumberPages(data.pageCount);
                setTotalCount(data.totalCount);
                setTableModel((tableModel) => ({
                    ...tableModel,
                    vulnerabilities: data.data,
                }));
            })
            .catch(ignoreAbortError);
    }, [pageNumber, tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order]);

    const reloadVulnerabilities = useCallback(() => {
        setTableModel((tableModel) => ({
            ...tableModel,
            vulnerabilities: null,
        }));
        fetchVulnerabilities();
    }, [fetchVulnerabilities]);

    const onDeleteButtonClick = async () => {
        if (!(await confirm(t("Are you sure you want to delete the selected vulnerabilities?")))) return;
        vulnerabilitiesDeleteMutation.mutate(tableModel.selection as any, {
            onSuccess: () => {
                reloadVulnerabilities();
                setTableModel({ ...tableModel, selection: [] });
                toast.success("All selected vulnerabilities were deleted.");
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    const onAddVulnerabilityClick = () => {
        navigate(`/vulnerabilities/create`);
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchVulnerabilities(controller.signal);
        return () => controller.abort();
    }, [fetchVulnerabilities]);

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <PaginationV2 page={apiPageNumber} total={numberPages} onPageChange={onPageChange} />
                <div>
                    <NativeButtonGroup>
                        <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                            <DeleteButton onClick={onDeleteButtonClick} disabled={!tableModel.selection.length}>
                                Delete selected
                            </DeleteButton>
                        </RestrictedComponent>
                        <CreateButton onClick={onAddVulnerabilityClick}>New vulnerability</CreateButton>
                    </NativeButtonGroup>
                </div>
            </div>
            <PageTitleHeader title={t("Vulnerabilities")} header={`${t("Vulnerabilities")} (${totalCount})`} />
            <VulnerabilityFilters tableModel={tableModel} tableModelSetter={setTableModel} />
            <VulnerabilitiesTable
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                reloadCallback={reloadVulnerabilities}
            />
            {confirmDialog}
        </>
    );
};

export default VulnerabilitiesListPage;

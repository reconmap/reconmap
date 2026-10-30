import { useConfirm } from "components/ui/useConfirm";
import { requestFindings } from "api/requests/findings";
import { ignoreAbortError } from "utilities/abort";
import { useDeleteFindingMutation } from "api/findings";
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
import FindingFilters from "components/findings/FindingFilters";
import FindingsTable from "components/findings/FindingsTable";
import FindingTableModel from "components/findings/FindingTableModel";
import { useTranslation } from "react-i18next";

const FindingsListPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    let pageNumber: any = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const findingsDeleteMutation = useDeleteFindingMutation();

    const [tableModel, setTableModel] = useState(new FindingTableModel());

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
        const url = `/findings?${queryParams.toString()}`;
        navigate(url);
    };

    const fetchFindings = useCallback((signal?: AbortSignal) => {
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

        requestFindings(queryParams, { signal })
            .then((data) => {
                setNumberPages(data.pageCount);
                setTotalCount(data.totalCount);
                setTableModel((tableModel) => ({
                    ...tableModel,
                    findings: data.data,
                }));
            })
            .catch(ignoreAbortError);
    }, [pageNumber, tableModel.filters, tableModel.sortBy.column, tableModel.sortBy.order]);

    const reloadFindings = useCallback(() => {
        setTableModel((tableModel) => ({
            ...tableModel,
            findings: null,
        }));
        fetchFindings();
    }, [fetchFindings]);

    const onDeleteButtonClick = async () => {
        if (!(await confirm(t("Are you sure you want to delete the selected findings?")))) return;
        findingsDeleteMutation.mutate(tableModel.selection as any, {
            onSuccess: () => {
                reloadFindings();
                setTableModel({ ...tableModel, selection: [] });
                toast.success("All selected findings were deleted.");
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    const onAddFindingClick = () => {
        navigate(`/findings/create`);
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchFindings(controller.signal);
        return () => controller.abort();
    }, [fetchFindings]);

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
                        <CreateButton onClick={onAddFindingClick}>New finding</CreateButton>
                    </NativeButtonGroup>
                </div>
            </div>
            <PageTitleHeader title={t("Findings")} header={`${t("Findings")} (${totalCount})`} />
            <FindingFilters tableModel={tableModel} tableModelSetter={setTableModel} />
            <FindingsTable
                tableModel={tableModel}
                tableModelSetter={setTableModel}
                reloadCallback={reloadFindings}
            />
            {confirmDialog}
        </>
    );
};

export default FindingsListPage;
